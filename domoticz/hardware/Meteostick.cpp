#include "stdafx.h"
#include "Meteostick.h"
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

#define RETRY_DELAY 30

#define round(a) ( int ) ( a + .5 )

//
//Class Meteostick
//
Meteostick::Meteostick(const int ID, const std::string& devname, const unsigned int baud_rate)
{
	m_HwdID=ID;
	m_szSerialPort=devname;
	m_iBaudRate=baud_rate;
	m_stoprequestedpoller = false;
}

Meteostick::~Meteostick()
{
	clearReadCallback();
}

bool Meteostick::StartHardware()
{
	m_retrycntr = RETRY_DELAY; //will force reconnect first thing
	StartPollerThread();
	return true;
}

bool Meteostick::StopHardware()
{
	m_bIsStarted = false;
	if (isOpen())
	{
		try {
			clearReadCallback();
			close();
			doClose();
			setErrorStatus(true);
		}
		catch (...)
		{
			//Don't throw from a Stop command
		}
	}
	StopPollerThread();
	return true;
}

void Meteostick::StartPollerThread()
{
	m_pollerthread = boost::shared_ptr<boost::thread>(new boost::thread(boost::bind(&Meteostick::Do_PollWork, this)));
}

void Meteostick::StopPollerThread()
{
	if (m_pollerthread != NULL)
	{
		assert(m_pollerthread);
		m_stoprequestedpoller = true;
		m_pollerthread->join();
	}
}

bool Meteostick::OpenSerialDevice()
{
	//Try to open the Serial Port
	try
	{
		_log.Log(LOG_STATUS, "Meteostick: Using serial port: %s", m_szSerialPort.c_str());
		open(
			m_szSerialPort,
			m_iBaudRate,
			boost::asio::serial_port_base::parity(boost::asio::serial_port_base::parity::none),
			boost::asio::serial_port_base::character_size(8)
			);
	}
	catch (boost::exception & e)
	{
		_log.Log(LOG_ERROR, "Meteostick:Error opening serial port!");
#ifdef _DEBUG
		_log.Log(LOG_ERROR, "-----------------\n%s\n-----------------", boost::diagnostic_information(e).c_str());
#endif
		return false;
	}
	catch (...)
	{
		_log.Log(LOG_ERROR, "Meteostick:Error opening serial port!!!");
		return false;
	}
	m_state = MSTATE_INIT;
	m_bIsStarted = true;
	m_bufferpos = 0;
	m_LastOutsideTemp = 12345;
	setReadCallback(boost::bind(&Meteostick::readCallback, this, _1, _2));
	sOnConnected(this);
	return true;
}


void Meteostick::Do_PollWork()
{
	bool bFirstTime = true;
	while (!m_stoprequestedpoller)
	{
		sleep_seconds(1);

		if (!isOpen())
		{
			if (m_retrycntr == 0)
			{
				_log.Log(LOG_STATUS, "Meteostick: serial setup retry in %d seconds...", RETRY_DELAY);
			}
			m_retrycntr++;
			if (m_retrycntr >= RETRY_DELAY)
			{
				m_retrycntr = 0;
				if (OpenSerialDevice())
					bFirstTime = true;
			}
		}
	}
	_log.Log(LOG_STATUS, "Meteostick: Worker stopped...");
}


void Meteostick::readCallback(const char *data, size_t len)
{
	boost::lock_guard<boost::mutex> l(readQueueMutex);
	if (!m_bIsStarted)
		return;

	if (!m_bEnableReceive)
		return; //receiving not enabled

	ParseData((const unsigned char*)data, (int)len);
}

void Meteostick::WriteToHardware(const char *pdata, const unsigned char length)
{
}

void Meteostick::ParseData(const unsigned char *pData, int Len)
{
	int ii = 0;
	while (ii < Len)
	{
		const unsigned char c = pData[ii];
		if (c == 0x0d)
		{
			ii++;
			continue;
		}

		if (c == 0x0a || m_bufferpos == sizeof(m_buffer)-1)
		{
			// discard newline, close string, parse line and clear it.
			if (m_bufferpos > 0) m_buffer[m_bufferpos] = 0;
			ParseLine();
			m_bufferpos = 0;
		}
		else
		{
			m_buffer[m_bufferpos] = c;
			m_bufferpos++;
		}
		ii++;
	}
}

void Meteostick::SendTempSensor(const unsigned char Idx, const float Temp, const std::string &defaultname)
{
	if (m_pMainWorker == NULL)
		return;
	bool bDeviceExits = true;
	std::stringstream szQuery;
	std::vector<std::vector<std::string> > result;
	szQuery << "SELECT Name FROM DeviceStatus WHERE (HardwareID==" << m_HwdID << ") AND (DeviceID==" << int(Idx) << ") AND (Type==" << int(pTypeTEMP) << ") AND (Subtype==" << int(sTypeTEMP10) << ")";
	result = m_pMainWorker->m_sql.query(szQuery.str());
	if (result.size() < 1)
	{
		bDeviceExits = false;
	}

	RBUF tsen;
	memset(&tsen, 0, sizeof(RBUF));

	tsen.TEMP.packetlength = sizeof(tsen.TEMP) - 1;
	tsen.TEMP.packettype = pTypeTEMP;
	tsen.TEMP.subtype = sTypeTEMP10;
	tsen.TEMP.battery_level = 9;
	tsen.TEMP.rssi = 12;
	tsen.TEMP.id1 = 0;
	tsen.TEMP.id2 = Idx;

	tsen.TEMP.tempsign = (Temp >= 0) ? 0 : 1;
	int at10 = round(abs(Temp*10.0f));
	tsen.TEMP.temperatureh = (BYTE)(at10 / 256);
	at10 -= (tsen.TEMP.temperatureh * 256);
	tsen.TEMP.temperaturel = (BYTE)(at10);

	sDecodeRXMessage(this, (const unsigned char *)&tsen.TEMP);

	if (!bDeviceExits)
	{
		//Assign default name for device
		szQuery.clear();
		szQuery.str("");
		szQuery << "UPDATE DeviceStatus SET Name='" << defaultname << "' WHERE (HardwareID==" << m_HwdID << ") AND (DeviceID==" << int(Idx) << ") AND (Type==" << int(pTypeTEMP) << ") AND (Subtype==" << int(sTypeTEMP10) << ")";
		result = m_pMainWorker->m_sql.query(szQuery.str());
	}
}

void Meteostick::SendTempHumSensor(const unsigned char Idx, const float Temp, const int Hum, const std::string &defaultname)
{
	if (m_pMainWorker == NULL)
		return;
	bool bDeviceExits = true;
	std::stringstream szQuery;
	std::vector<std::vector<std::string> > result;
	szQuery << "SELECT Name FROM DeviceStatus WHERE (HardwareID==" << m_HwdID << ") AND (DeviceID==" << int(Idx) << ") AND (Type==" << int(pTypeTEMP_HUM) << ") AND (Subtype==" << int(sTypeTH5) << ")";
	result = m_pMainWorker->m_sql.query(szQuery.str());
	if (result.size() < 1)
	{
		bDeviceExits = false;
	}

	RBUF tsen;
	memset(&tsen, 0, sizeof(RBUF));
	tsen.TEMP_HUM.packetlength = sizeof(tsen.TEMP_HUM) - 1;
	tsen.TEMP_HUM.packettype = pTypeTEMP_HUM;
	tsen.TEMP_HUM.subtype = sTypeTH5;
	tsen.TEMP_HUM.battery_level = 9;
	tsen.TEMP_HUM.rssi = 12;
	tsen.TEMP_HUM.id1 = 0;
	tsen.TEMP_HUM.id2 = Idx;

	tsen.TEMP_HUM.tempsign = (Temp >= 0) ? 0 : 1;
	int at10 = round(abs(Temp*10.0f));
	tsen.TEMP_HUM.temperatureh = (BYTE)(at10 / 256);
	at10 -= (tsen.TEMP_HUM.temperatureh * 256);
	tsen.TEMP_HUM.temperaturel = (BYTE)(at10);
	tsen.TEMP_HUM.humidity = (BYTE)Hum;
	tsen.TEMP_HUM.humidity_status = Get_Humidity_Level(tsen.TEMP_HUM.humidity);

	sDecodeRXMessage(this, (const unsigned char *)&tsen.TEMP_HUM);

	if (!bDeviceExits)
	{
		//Assign default name for device
		szQuery.clear();
		szQuery.str("");
		szQuery << "UPDATE DeviceStatus SET Name='" << defaultname << "' WHERE (HardwareID==" << m_HwdID << ") AND (DeviceID==" << int(Idx) << ") AND (Type==" << int(pTypeTEMP_HUM) << ") AND (Subtype==" << int(sTypeTH5) << ")";
		result = m_pMainWorker->m_sql.query(szQuery.str());
	}
}

void Meteostick::SendTempBaroSensor(const unsigned char Idx, const float Temp, const float Baro, const std::string &defaultname)
{
	if (m_pMainWorker == NULL)
		return;
	bool bDeviceExits = true;
	std::stringstream szQuery;
	std::vector<std::vector<std::string> > result;
	szQuery << "SELECT Name FROM DeviceStatus WHERE (HardwareID==" << m_HwdID << ") AND (DeviceID==" << int(Idx) << ") AND (Type==" << int(pTypeTEMP_BARO) << ") AND (Subtype==" << int(sTypeBMP085) << ")";
	result = m_pMainWorker->m_sql.query(szQuery.str());
	if (result.size() < 1)
	{
		bDeviceExits = false;
	}

	//Calculate Altitude
	double altitude = CalculateAltitudeFromPressure((double)Baro);
	_tTempBaro tsensor;
	tsensor.id1 = Idx;
	tsensor.temp = Temp;
	tsensor.baro = Baro;
	tsensor.altitude = float(altitude);

	//this is probably not good, need to take the rising/falling of the pressure into account?
	//any help would be welcome!

	tsensor.forecast = baroForecastNoInfo;
	if (tsensor.baro < 1000)
		tsensor.forecast = baroForecastRain;
	else if (tsensor.baro < 1020)
		tsensor.forecast = baroForecastCloudy;
	else if (tsensor.baro < 1030)
		tsensor.forecast = baroForecastPartlyCloudy;
	else
		tsensor.forecast = baroForecastSunny;
	sDecodeRXMessage(this, (const unsigned char *)&tsensor);

	if (!bDeviceExits)
	{
		//Assign default name for device
		szQuery.clear();
		szQuery.str("");
		szQuery << "UPDATE DeviceStatus SET Name='" << defaultname << "' WHERE (HardwareID==" << m_HwdID << ") AND (DeviceID==" << int(Idx) << ") AND (Type==" << int(pTypeTEMP_BARO) << ") AND (Subtype==" << int(sTypeBMP085) << ")";
		result = m_pMainWorker->m_sql.query(szQuery.str());
	}
}

void Meteostick::SendWindSensor(const unsigned char Idx, const float Temp, const float Speed, const int Direction, const std::string &defaultname)
{
	if (m_pMainWorker == NULL)
		return;
	bool bDeviceExits = true;
	std::stringstream szQuery;
	std::vector<std::vector<std::string> > result;
	szQuery << "SELECT Name FROM DeviceStatus WHERE (HardwareID==" << m_HwdID << ") AND (DeviceID==" << int(Idx) << ") AND (Type==" << int(pTypeWIND) << ") AND (Subtype==" << int(sTypeWINDNoTemp) << ")";
	result = m_pMainWorker->m_sql.query(szQuery.str());
	if (result.size() < 1)
	{
		bDeviceExits = false;
	}

	RBUF tsen;

	memset(&tsen, 0, sizeof(RBUF));
	tsen.WIND.packetlength = sizeof(tsen.WIND) - 1;
	tsen.WIND.packettype = pTypeWIND;
	tsen.WIND.subtype = sTypeWINDNoTemp;
	tsen.WIND.battery_level = 9;
	tsen.WIND.rssi = 12;
	tsen.WIND.id1 = 0;
	tsen.WIND.id2 = Idx;

	int aw = round(Direction);
	tsen.WIND.directionh = (BYTE)(aw / 256);
	aw -= (tsen.WIND.directionh * 256);
	tsen.WIND.directionl = (BYTE)(aw);

	tsen.WIND.av_speedh = 0;
	tsen.WIND.av_speedl = 0;
	int sw = round(Speed*10.0f);
	tsen.WIND.av_speedh = (BYTE)(sw / 256);
	sw -= (tsen.WIND.av_speedh * 256);
	tsen.WIND.av_speedl = (BYTE)(sw);

	tsen.WIND.gusth = 0;
	tsen.WIND.gustl = 0;

	//this is not correct, why no wind temperature? and only chill?
	tsen.WIND.chillh = 0;
	tsen.WIND.chilll = 0;
	tsen.WIND.temperatureh = 0;
	tsen.WIND.temperaturel = 0;
	tsen.WIND.tempsign = (Temp >= 0) ? 0 : 1;
	tsen.WIND.chillsign = (Temp >= 0) ? 0 : 1;
	int at10 = round(abs(Temp*10.0f));
	tsen.WIND.temperatureh = (BYTE)(at10 / 256);
	tsen.WIND.chillh = (BYTE)(at10 / 256);
	at10 -= (tsen.WIND.chillh * 256);
	tsen.WIND.temperaturel = (BYTE)(at10);
	tsen.WIND.chilll = (BYTE)(at10);

	sDecodeRXMessage(this, (const unsigned char *)&tsen.WIND);

	if (!bDeviceExits)
	{
		//Assign default name for device
		szQuery.clear();
		szQuery.str("");
		szQuery << "UPDATE DeviceStatus SET Name='" << defaultname << "' WHERE (HardwareID==" << m_HwdID << ") AND (DeviceID==" << int(Idx) << ") AND (Type==" << int(pTypeWIND) << ") AND (Subtype==" << int(sTypeWINDNoTemp) << ")";
		result = m_pMainWorker->m_sql.query(szQuery.str());
	}

}

void Meteostick::SendUVSensor(const unsigned char Idx, const float UV, const std::string &defaultname)
{
	if (m_pMainWorker == NULL)
		return;
	bool bDeviceExits = true;
	std::stringstream szQuery;
	std::vector<std::vector<std::string> > result;
	szQuery << "SELECT Name FROM DeviceStatus WHERE (HardwareID==" << m_HwdID << ") AND (DeviceID==" << int(Idx) << ") AND (Type==" << int(pTypeUV) << ") AND (Subtype==" << int(sTypeUV1) << ")";
	result = m_pMainWorker->m_sql.query(szQuery.str());
	if (result.size() < 1)
	{
		bDeviceExits = false;
	}

	RBUF tsen;
	memset(&tsen, 0, sizeof(RBUF));
	tsen.UV.packetlength = sizeof(tsen.UV) - 1;
	tsen.UV.packettype = pTypeUV;
	tsen.UV.subtype = sTypeUV1;
	tsen.UV.battery_level = 9;
	tsen.UV.rssi = 12;
	tsen.UV.id1 = 0;
	tsen.UV.id2 = Idx;

	tsen.UV.uv = (BYTE)round(UV * 10);
	sDecodeRXMessage(this, (const unsigned char *)&tsen.UV);

	if (!bDeviceExits)
	{
		//Assign default name for device
		szQuery.clear();
		szQuery.str("");
		szQuery << "UPDATE DeviceStatus SET Name='" << defaultname << "' WHERE (HardwareID==" << m_HwdID << ") AND (DeviceID==" << int(Idx) << ") AND (Type==" << int(pTypeUV) << ") AND (Subtype==" << int(sTypeUV1) << ")";
		result = m_pMainWorker->m_sql.query(szQuery.str());
	}
}

void Meteostick::SendPercentage(const unsigned long Idx, const float Percentage, const std::string &defaultname)
{
	if (m_pMainWorker == NULL)
		return;
	bool bDeviceExits = true;
	std::stringstream szQuery;
	std::vector<std::vector<std::string> > result;

	char szTmp[30];
	sprintf(szTmp, "%08X", (unsigned int)Idx);

	szQuery << "SELECT Name FROM DeviceStatus WHERE (HardwareID==" << m_HwdID << ") AND (DeviceID=='" << szTmp << "') AND (Type==" << int(pTypeGeneral) << ") AND (Subtype==" << int(sTypePercentage) << ")";
	result = m_pMainWorker->m_sql.query(szQuery.str());
	if (result.size() < 1)
	{
		bDeviceExits = false;
	}

	_tGeneralDevice gDevice;
	gDevice.subtype = sTypePercentage;
	gDevice.id = 1;
	gDevice.floatval1 = Percentage;
	gDevice.intval1 = (int)Idx;
	sDecodeRXMessage(this, (const unsigned char *)&gDevice);

	if (!bDeviceExits)
	{
		//Assign default name for device
		szQuery.clear();
		szQuery.str("");
		szQuery << "UPDATE DeviceStatus SET Name='" << defaultname << "' WHERE (HardwareID==" << m_HwdID << ") AND (DeviceID=='" << szTmp << "') AND (Type==" << int(pTypeGeneral) << ") AND (Subtype==" << int(sTypePercentage) << ")";
		result = m_pMainWorker->m_sql.query(szQuery.str());
	}
}

//We need a total rain counter here, and only receive daily rain... not going to work yet!
void Meteostick::SendRainSensor(const unsigned char Idx, const float Rainmm, const std::string &defaultname)
{
	if (m_pMainWorker == NULL)
		return;
	bool bDeviceExits = true;
	std::stringstream szQuery;
	std::vector<std::vector<std::string> > result;
	szQuery << "SELECT Name FROM DeviceStatus WHERE (HardwareID==" << m_HwdID << ") AND (DeviceID==" << int(Idx) << ") AND (Type==" << int(pTypeRAIN) << ") AND (Subtype==" << int(sTypeRAIN3) << ")";
	result = m_pMainWorker->m_sql.query(szQuery.str());
	if (result.size() < 1)
	{
		bDeviceExits = false;
	}

	RBUF tsen;
	memset(&tsen, 0, sizeof(RBUF));
	tsen.RAIN.packetlength = sizeof(tsen.RAIN) - 1;
	tsen.RAIN.packettype = pTypeRAIN;
	tsen.RAIN.subtype = sTypeRAIN3;
	tsen.RAIN.battery_level = 9;
	tsen.RAIN.rssi = 12;
	tsen.RAIN.id1 = 0;
	tsen.RAIN.id2 = Idx;

	tsen.RAIN.rainrateh = 0;
	tsen.RAIN.rainratel = 0;

	int tr10 = int(float(Rainmm)*10.0f);

	tsen.RAIN.raintotal1 = 0;
	tsen.RAIN.raintotal2 = (BYTE)(tr10 / 256);
	tr10 -= (tsen.RAIN.raintotal2 * 256);
	tsen.RAIN.raintotal3 = (BYTE)(tr10);

	sDecodeRXMessage(this, (const unsigned char *)&tsen.RAIN);

	if (!bDeviceExits)
	{
		//Assign default name for device
		szQuery.clear();
		szQuery.str("");
		szQuery << "UPDATE DeviceStatus SET Name='" << defaultname << "' WHERE (HardwareID==" << m_HwdID << ") AND (DeviceID==" << int(Idx) << ") AND (Type==" << int(pTypeRAIN) << ") AND (Subtype==" << int(sTypeRAIN3) << ")";
		result = m_pMainWorker->m_sql.query(szQuery.str());
	}
}

void Meteostick::SendLeafWetnessRainSensor(const unsigned char Idx, const unsigned char Channel, const int Wetness, const std::string &defaultname)
{
	if (m_pMainWorker == NULL)
		return;
	bool bDeviceExits = true;
	std::stringstream szQuery;
	std::vector<std::vector<std::string> > result;
	int finalID = (Idx * 10) + Channel;
	szQuery << "SELECT Name FROM DeviceStatus WHERE (HardwareID==" << m_HwdID << ") AND (DeviceID==" << finalID << ") AND (Type==" << int(pTypeGeneral) << ") AND (Subtype==" << int(sTypeLeafWetness) << ")";
	result = m_pMainWorker->m_sql.query(szQuery.str());
	if (result.size() < 1)
	{
		bDeviceExits = false;
	}

	_tGeneralDevice gdevice;
	gdevice.subtype = sTypeLeafWetness;
	gdevice.intval1 = Wetness;
	gdevice.id = finalID;
	sDecodeRXMessage(this, (const unsigned char *)&gdevice);

	if (!bDeviceExits)
	{
		//Assign default name for device
		szQuery.clear();
		szQuery.str("");
		szQuery << "UPDATE DeviceStatus SET Name='" << defaultname << "' WHERE (HardwareID==" << m_HwdID << ") AND (DeviceID==" << finalID << ") AND (Type==" << int(pTypeGeneral) << ") AND (Subtype==" << int(sTypeLeafWetness) << ")";
		result = m_pMainWorker->m_sql.query(szQuery.str());
	}
}

void Meteostick::SendSoilMoistureSensor(const unsigned char Idx, const unsigned char Channel, const int Moisture, const std::string &defaultname)
{
	if (m_pMainWorker == NULL)
		return;
	bool bDeviceExits = true;
	std::stringstream szQuery;
	std::vector<std::vector<std::string> > result;
	int finalID = (Idx * 10) + Channel;
	szQuery << "SELECT Name FROM DeviceStatus WHERE (HardwareID==" << m_HwdID << ") AND (DeviceID==" << finalID << ") AND (Type==" << int(pTypeGeneral) << ") AND (Subtype==" << int(sTypeSoilMoisture) << ")";
	result = m_pMainWorker->m_sql.query(szQuery.str());
	if (result.size() < 1)
	{
		bDeviceExits = false;
	}

	_tGeneralDevice gdevice;
	gdevice.subtype = sTypeSoilMoisture;
	gdevice.intval1 = Moisture;
	gdevice.id = finalID;
	sDecodeRXMessage(this, (const unsigned char *)&gdevice);

	if (!bDeviceExits)
	{
		//Assign default name for device
		szQuery.clear();
		szQuery.str("");
		szQuery << "UPDATE DeviceStatus SET Name='" << defaultname << "' WHERE (HardwareID==" << m_HwdID << ") AND (DeviceID==" << finalID << ") AND (Type==" << int(pTypeGeneral) << ") AND (Subtype==" << int(sTypeSoilMoisture) << ")";
		result = m_pMainWorker->m_sql.query(szQuery.str());
	}
}

void Meteostick::SendSolarRadiationSensor(const unsigned char Idx, const float Radiation, const std::string &defaultname)
{
	if (m_pMainWorker == NULL)
		return;
	bool bDeviceExits = true;
	std::stringstream szQuery;
	std::vector<std::vector<std::string> > result;
	szQuery << "SELECT Name FROM DeviceStatus WHERE (HardwareID==" << m_HwdID << ") AND (DeviceID==" << int(Idx) << ") AND (Type==" << int(pTypeGeneral) << ") AND (Subtype==" << int(sTypeSolarRadiation) << ")";
	result = m_pMainWorker->m_sql.query(szQuery.str());
	if (result.size() < 1)
	{
		bDeviceExits = false;
	}

	_tGeneralDevice gdevice;
	gdevice.subtype = sTypeSolarRadiation;
	gdevice.id = (int)Idx;
	gdevice.floatval1 = Radiation;
	sDecodeRXMessage(this, (const unsigned char *)&gdevice);

	if (!bDeviceExits)
	{
		//Assign default name for device
		szQuery.clear();
		szQuery.str("");
		szQuery << "UPDATE DeviceStatus SET Name='" << defaultname << "' WHERE (HardwareID==" << m_HwdID << ") AND (DeviceID==" << int(Idx) << ") AND (Type==" << int(pTypeGeneral) << ") AND (Subtype==" << int(sTypeSolarRadiation) << ")";
		result = m_pMainWorker->m_sql.query(szQuery.str());
	}
}

void Meteostick::ParseLine()
{
	if (m_bufferpos < 1)
		return;
	std::string sLine((char*)&m_buffer);

	std::vector<std::string> results;
	StringSplit(sLine, " ", results);
	if (results.size() < 1)
		return; //invalid data

	switch (m_state)
	{
	case MSTATE_INIT:
		if (sLine.find("# MeteoStick Version") == 0) {
			_log.Log(LOG_STATUS, sLine.c_str());
			return;
		}
		if (results[0] == "?")
		{
			//Turn off filters
			write("f0\n");
			m_state = MSTATE_FILTERS;
		}
		return;
	case MSTATE_FILTERS:
		//Set output to 'computer values'
		write("o1\n");
		m_state = MSTATE_VALUES;
		return;
	case MSTATE_VALUES:
		//Set listen frequency to 868 (need to be user configurable for 915Mhz)
		write("m1\n");
		m_state = MSTATE_DATA;
		return;
	}

	if (m_state != MSTATE_DATA)
		return;

	if (results.size() < 3)
		return;

	unsigned char rCode = results[0][0];
	if (rCode == '#')
		return;

#ifdef _DEBUG
	_log.Log(LOG_NORM, sLine.c_str());
#endif

	switch (rCode)
	{
	case 'B':
		//temperature in Celsius, pressure in hPa
		if (results.size() >= 3)
		{
			float temp = (float)atof(results[1].c_str());
			float baro = (float)atof(results[2].c_str());

			SendTempBaroSensor(0, temp, baro, "Meteostick Temp+Baro");
		}
		break;
	case 'W':
		//current wind speed in m / s, wind direction in degrees
		if (m_LastOutsideTemp != 12345)
		{
			if (results.size() >= 5)
			{
				unsigned char ID = (unsigned char)atoi(results[1].c_str());
				float speed = (float)atof(results[2].c_str());
				int direction = (int)atoi(results[3].c_str());
				SendWindSensor(ID, m_LastOutsideTemp, speed, direction, "Wind");
			}
		}
		break;
	case 'T':
		//temperature in degree Celsius, humidity in percent
		if (results.size() >= 5)
		{
			unsigned char ID = (unsigned char)atoi(results[1].c_str());
			float temp = (float)atof(results[2].c_str());
			int hum = (int)atoi(results[3].c_str());

			SendTempHumSensor(ID, temp, hum, "Outside Temp+Hum");
			m_LastOutsideTemp = temp;
		}
		break;
	case 'R':
		//Rain
		//counter value (value 0 - 255), ticks, 1 tick = 0.2mm or 0.01in
		if (results.size() >= 4)
		{
			unsigned char ID = (unsigned char)atoi(results[1].c_str());
			float Rainmm = (float)atof(results[2].c_str())*0.2f; //convert to mm
			SendRainSensor(ID, Rainmm, "Rain");
		}
		break;
	case 'S':
		//solar radiation, solar radiation in W / qm
		if (results.size() >= 4)
		{
			unsigned char ID = (unsigned char)atoi(results[1].c_str());
			float Radiation = (float)atof(results[2].c_str());
			SendSolarRadiationSensor(ID, Radiation, "Solar Radiation");
		}
		break;
	case 'U':
		//UV index
		if (results.size() >= 4)
		{
			unsigned char ID = (unsigned char)atoi(results[1].c_str());
			float UV = (float)atof(results[2].c_str());
			SendUVSensor(ID, UV, "UV");
		}
		break;
	case 'L':
		//wetness data of a leaf station
		//channel number (1 - 4), leaf wetness (0-15)
		if (results.size() >= 5)
		{
			unsigned char ID = (unsigned char)atoi(results[1].c_str());
			unsigned char Channel = (unsigned char)atoi(results[2].c_str());
			unsigned char Wetness = (unsigned char)atoi(results[3].c_str());
			SendLeafWetnessRainSensor(ID, Channel, Wetness, "Leaf Wetness");
		}
		break;
	case 'M':
		//soil moisture of a soil station
		//channel number (1 - 4), Soil moisture in cbar(0 - 200)
		if (results.size() >= 5)
		{
			unsigned char ID = (unsigned char)atoi(results[1].c_str());
			unsigned char Channel = (unsigned char)atoi(results[2].c_str());
			unsigned char Moisture = (unsigned char)atoi(results[3].c_str());
			SendSoilMoistureSensor(ID, Channel, Moisture, "Soil Moisture");
		}
		break;
	case 'O':
		//soil / leaf temperature of a soil / leaf station
		//channel number (1 - 4), soil / leaf temperature in degrees Celsius
		if (results.size() >= 5)
		{
			unsigned char ID = (unsigned char)atoi(results[1].c_str());
			unsigned char Channel = (unsigned char)atoi(results[2].c_str());
			float temp = (float)atof(results[3].c_str());
			unsigned char finalID = (ID * 10) + Channel;
			SendTempSensor(finalID, temp, "Soil/Leaf Temp");
		}
		break;
	case 'P':
		//solar panel power in(0 - 100)
		if (results.size() >= 4)
		{
			unsigned char ID = (unsigned char)atoi(results[1].c_str());
			float Percentage = (float)atof(results[2].c_str());
			SendPercentage(ID, Percentage, "power of solar panel");
		}
		break;
	default:
		_log.Log(LOG_STATUS, "Unknown Type: %c", rCode);
		break;
	}

}
