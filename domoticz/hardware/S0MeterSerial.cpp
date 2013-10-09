#include "stdafx.h"
#include "S0MeterSerial.h"
#include "../main/Logger.h"
#include "../main/Helper.h"
#include "../main/RFXtrx.h"
#include "../main/mainworker.h"
#include "P1MeterBase.h"
#include "hardwaretypes.h"
#include <string>
#include <algorithm>
#include <iostream>
#include <boost/bind.hpp>

#include <ctime>

//
//Class S0MeterSerial
//
S0MeterSerial::S0MeterSerial(const int ID, const std::string& devname, const unsigned int baud_rate, const int M1Type, const int M1PPH, const int M2Type, const int M2PPH)
{
	m_HwdID=ID;
	m_szSerialPort=devname;
	m_iBaudRate=baud_rate;

	m_s0_m1_type=M1Type;
	m_s0_m2_type=M2Type;
	m_pulse_per_unit_1=2000.0;
	m_pulse_per_unit_2=2000.0;

	if (M1PPH!=0)
		m_pulse_per_unit_1=float(M1PPH);
	if (M2PPH!=0)
		m_pulse_per_unit_2=float(M2PPH);
}

S0MeterSerial::~S0MeterSerial()
{
	clearReadCallback();
}

bool S0MeterSerial::StartHardware()
{
	//Try to open the Serial Port
	try
	{
		_log.Log(LOG_NORM,"S0 Meter Using serial port: %s", m_szSerialPort.c_str());
		open(
			m_szSerialPort,
			m_iBaudRate,
			boost::asio::serial_port_base::parity(
			boost::asio::serial_port_base::parity::even),
			boost::asio::serial_port_base::character_size(7)
			);
	}
	catch (boost::exception & e)
	{
		_log.Log(LOG_ERROR,"Error opening serial port!");
#ifdef _DEBUG
		_log.Log(LOG_ERROR,"-----------------\n%s\n-----------------",boost::diagnostic_information(e).c_str());
#endif
		return false;
	}
	catch ( ... )
	{
		_log.Log(LOG_ERROR,"Error opening serial port!!!");
		return false;
	}
	m_bIsStarted=true;
	m_bufferpos=0;
	ReloadLastTotals();
	setReadCallback(boost::bind(&S0MeterSerial::readCallback, this, _1, _2));
	sOnConnected(this);
	return true;
}

bool S0MeterSerial::StopHardware()
{
	m_bIsStarted=false;
	if (isOpen())
	{
		try {
			clearReadCallback();
			close();
			doClose();
			setErrorStatus(true);
		} catch(...)
		{
			//Don't throw from a Stop command
		}
	}
	return true;
}


void S0MeterSerial::readCallback(const char *data, size_t len)
{
	boost::lock_guard<boost::mutex> l(readQueueMutex);
	if (!m_bIsStarted)
		return;

	if (!m_bEnableReceive)
		return; //receiving not enabled

	ParseData((const unsigned char*)data, (int)len);
}

void S0MeterSerial::WriteToHardware(const char *pdata, const unsigned char length)
{
}

void S0MeterSerial::ReloadLastTotals()
{
	m_s0_m1_volume_total=0;
	m_s0_m2_volume_total=0;

	m_s0_m1_last_values[0]=0;
	m_s0_m1_last_values[1]=0;
	m_s0_m1_last_values[2]=0;
	m_s0_m1_last_values[3]=0;
	m_s0_m2_last_values[0]=0;
	m_s0_m2_last_values[1]=0;
	m_s0_m2_last_values[2]=0;
	m_s0_m2_last_values[3]=0;

	char szTmp[300];
	std::vector<std::vector<std::string> > result;
	std::vector<std::string> results;

	sprintf(szTmp,"SELECT sValue FROM DeviceStatus WHERE (HardwareID=%d AND DeviceID='%d' AND Unit=0 AND Type=%d AND SubType=%d)",m_HwdID, 1, pTypeENERGY, sTypeELEC2);
	result=m_pMainWorker->m_sql.query(szTmp);
	if (result.size()==1)
	{
		StringSplit(result[0][0],";",results);
		if (results.size()==2)
		{
			m_s0_m1_volume_total=atof(results[1].c_str())/1000.0;
		}
	}
	results.clear();
	sprintf(szTmp,"SELECT sValue FROM DeviceStatus WHERE (HardwareID=%d AND DeviceID='%d' AND Unit=0 AND Type=%d AND SubType=%d)",m_HwdID, 2, pTypeENERGY, sTypeELEC2);
	result=m_pMainWorker->m_sql.query(szTmp);
	if (result.size()==1)
	{
		StringSplit(result[0][0],";",results);
		if (results.size()==2)
		{
			m_s0_m2_volume_total=atof(results[1].c_str())/1000.0;
		}
	}
}

void S0MeterSerial::ParseData(const unsigned char *pData, int Len)
{
	int ii=0;
	while (ii<Len)
	{
		const unsigned char c = pData[ii];
		if(c == 0x0d)
		{
			ii++;
			continue;
		}

		m_buffer[m_bufferpos] = c;
		if(c == 0x0a || m_bufferpos == sizeof(m_buffer) - 1)
		{
			// discard newline, close string, parse line and clear it.
			if(m_bufferpos > 0) m_buffer[m_bufferpos] = 0;
			ParseLine();
			m_bufferpos = 0;
		}
		else
		{
			m_bufferpos++;
		}
		ii++;
	}
}

void S0MeterSerial::SendMeter(unsigned char ID, double musage, double mtotal)
{
	RBUF tsen;
	memset(&tsen,0,sizeof(RBUF));

	int meterype=MTYPE_ENERGY;
	if (ID==1)
	{
		meterype=m_s0_m1_type;
	}
	else
	{
		meterype=m_s0_m2_type;
	}

	if (meterype==MTYPE_ENERGY)
	{
		tsen.ENERGY.packettype=pTypeENERGY;
		tsen.ENERGY.subtype=sTypeELEC2;
		tsen.ENERGY.id1=0;
		tsen.ENERGY.id2=ID;
		tsen.ENERGY.count=1;
		tsen.ENERGY.rssi=6;

		tsen.ENERGY.battery_level=9;

		unsigned long long instant=(unsigned long long)(musage*1000.0);
		tsen.ENERGY.instant1=(unsigned char)(instant/0x1000000);
		instant-=tsen.ENERGY.instant1*0x1000000;
		tsen.ENERGY.instant2=(unsigned char)(instant/0x10000);
		instant-=tsen.ENERGY.instant2*0x10000;
		tsen.ENERGY.instant3=(unsigned char)(instant/0x100);
		instant-=tsen.ENERGY.instant3*0x100;
		tsen.ENERGY.instant4=(unsigned char)(instant);

		double total=(mtotal*1000.0)*223.666;
		tsen.ENERGY.total1=(unsigned char)(total/0x10000000000ULL);
		total-=tsen.ENERGY.total1*0x10000000000ULL;
		tsen.ENERGY.total2=(unsigned char)(total/0x100000000ULL);
		total-=tsen.ENERGY.total2*0x100000000ULL;
		tsen.ENERGY.total3=(unsigned char)(total/0x1000000);
		total-=tsen.ENERGY.total3*0x1000000;
		tsen.ENERGY.total4=(unsigned char)(total/0x10000);
		total-=tsen.ENERGY.total4*0x10000;
		tsen.ENERGY.total5=(unsigned char)(total/0x100);
		total-=tsen.ENERGY.total5*0x100;
		tsen.ENERGY.total6=(unsigned char)(total);

		sDecodeRXMessage(this, (const unsigned char *)&tsen.ENERGY);//decode message

	}
	else if (meterype==MTYPE_GAS)
	{
		//can only be one gas meter...
		P1Gas	m_p1gas;
		m_p1gas.len=sizeof(P1Gas)-1;
		m_p1gas.type=pTypeP1Gas;
		m_p1gas.subtype=sTypeP1Gas;
		m_p1gas.gasusage=(unsigned long)(mtotal*1000.0);
		sDecodeRXMessage(this, (const unsigned char *)&m_p1gas);//decode message
	}
	else
	{
		//show as a counter, user needs to change meter type later
		//Counter
		RBUF tsen;
		memset(&tsen,0,sizeof(RBUF));
		tsen.RFXMETER.packetlength=sizeof(tsen.RFXMETER)-1;
		tsen.RFXMETER.packettype=pTypeRFXMeter;
		tsen.RFXMETER.subtype=sTypeRFXMeterCount;
		tsen.RFXMETER.rssi=6;
		tsen.RFXMETER.id1=0;
		tsen.RFXMETER.id2=ID;

		unsigned long counterA=(unsigned long)(mtotal*1000.0);

		tsen.RFXMETER.count1 = (BYTE)((counterA & 0xFF000000) >> 24);
		tsen.RFXMETER.count2 = (BYTE)((counterA & 0x00FF0000) >> 16);
		tsen.RFXMETER.count3 = (BYTE)((counterA & 0x0000FF00) >> 8);
		tsen.RFXMETER.count4 = (BYTE)(counterA & 0x000000FF);
		sDecodeRXMessage(this, (const unsigned char *)&tsen.RFXMETER);//decode message

	}
}

void S0MeterSerial::ParseLine()
{
	if (m_bufferpos<2)
		return;
	std::string sLine((char*)&m_buffer);

	std::vector<std::string> results;
	StringSplit(sLine,":",results);
	if (results.size()<1)
		return; //invalid data

	if (results[0][0]=='/') {
		//Meter restart
		//m_bMeterRestart=true;
		//Software Version

		std::string MeterID=results[0].substr(1);
		std::string SoftwareVersion=results[1];
		_log.Log(LOG_NORM,"S0 Meter ID: %s, Version: %s",MeterID.c_str(),SoftwareVersion.c_str());
		return;
	}
	if (results.size()!=10)
	{
		_log.Log(LOG_NORM,"S0 Meter Invalid Data received!: Len:%d",sLine.size());
		return;
	}
	//ID:0001:I:99:M1:123:456:M2:234:567 = ID(1)/Pulse Interval(3)/M1Actual(5)/M1Total(7)/M2Actual(8)/M2Total(9)
	std::string MeterID=results[1];
	double s0_pulse_interval=atof(results[3].c_str());

	double s0_m1_pulse=atof(results[5].c_str());
	double s0_m2_pulse=atof(results[8].c_str());
	double s0_m1_volume=( s0_m1_pulse / m_pulse_per_unit_1 );
	double s0_m2_volume=( s0_m2_pulse / m_pulse_per_unit_2 );

	//Calculate average here (5 values)
	double s0_m1_act_watt=s0_m1_volume*(3600.0/s0_pulse_interval);
	double s0_m2_act_watt=s0_m2_volume*(3600.0/s0_pulse_interval);

	double s0_m1_watt_hour=(s0_m1_act_watt+m_s0_m1_last_values[0]+m_s0_m1_last_values[1]+m_s0_m1_last_values[2]+m_s0_m1_last_values[3])*0.2;
	double s0_m2_watt_hour=(s0_m2_act_watt+m_s0_m2_last_values[0]+m_s0_m2_last_values[1]+m_s0_m2_last_values[2]+m_s0_m2_last_values[3])*0.2;
	m_s0_m1_last_values[0]=m_s0_m1_last_values[1];
	m_s0_m1_last_values[1]=m_s0_m1_last_values[2];
	m_s0_m1_last_values[2]=m_s0_m1_last_values[3];
	m_s0_m1_last_values[3]=s0_m1_act_watt;
	m_s0_m2_last_values[0]=m_s0_m2_last_values[1];
	m_s0_m2_last_values[1]=m_s0_m2_last_values[2];
	m_s0_m2_last_values[2]=m_s0_m2_last_values[3];
	m_s0_m2_last_values[3]=s0_m2_act_watt;

	m_s0_m1_volume_total+=s0_m1_volume;
	m_s0_m2_volume_total+=s0_m2_volume;

//	_log.Log(LOG_NORM,"S0 Meter M1-Int=%0.3f, M1-Tot=%0.3f, M2-Int=%0.3f, M2-Tot=%0.3f",s0_m1_watt_hour,m_s0_m1_volume_total,s0_m2_watt_hour,m_s0_m2_volume_total);

	if (m_s0_m1_volume_total!=0) {
		SendMeter(1,s0_m1_watt_hour,m_s0_m1_volume_total);
	}
	if (m_s0_m2_volume_total!=0) {
		SendMeter(2,s0_m2_watt_hour,m_s0_m2_volume_total);
	}
}