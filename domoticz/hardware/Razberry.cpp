#include "stdafx.h"
#include "Razberry.h"

#include <iostream>     // std::cout
#include <sstream>      // std::stringstream
#include <vector>
#include <ctype.h>

#include "../httpclient/HTTPClient.h"
#include "../main/Helper.h"
#include "../main/RFXtrx.h"
#include "../main/Logger.h"
#include "hardwaretypes.h"

#pragma warning(disable: 4996)

#define round(a) ( int ) ( a + .5 )

bool isInt(std::string s)
{
	for(size_t i = 0; i < s.length(); i++){
		if(!isdigit(s[i]))
			return false;
	}
	return true;
}

static std::string readInputTestFile( const char *path )
{
	FILE *file = fopen( path, "rb" );
	if ( !file )
		return std::string("");
	fseek( file, 0, SEEK_END );
	long size = ftell( file );
	fseek( file, 0, SEEK_SET );
	std::string text;
	char *buffer = new char[size+1];
	buffer[size] = 0;
	if ( fread( buffer, 1, size, file ) == (unsigned long)size )
		text = buffer;
	fclose( file );
	delete[] buffer;
	return text;
}

CRazberry::CRazberry(const int ID, const std::string ipaddress, const int port, const std::string username, const std::string password)
{
	m_HwdID=ID;
	m_ipaddress=ipaddress;
	m_port=port;
	m_username=username;
	m_password=password;
}


CRazberry::~CRazberry(void)
{
}

bool CRazberry::StartHardware()
{
	m_bInitState=true;
	m_updateTime=0;
	m_controllerID=0;
	m_stoprequested=false;

	//Start worker thread
	m_thread = boost::shared_ptr<boost::thread>(new boost::thread(boost::bind(&CRazberry::Do_Work, this)));
	return (m_thread!=NULL);
}

bool CRazberry::StopHardware()
{
	if (m_thread!=NULL)
	{
		assert(m_thread);
		m_stoprequested = true;
		m_thread->join();
	}
	return true;
}

void CRazberry::Do_Work()
{
	while (!m_stoprequested)
	{
		boost::this_thread::sleep(boost::posix_time::milliseconds(500));
		if (m_bInitState)
		{
			if (GetInitialDevices())
			{
				m_bInitState=false;
				sOnConnected(this);
			}
		}
		else
			GetUpdates();
	}
}

const std::string CRazberry::GetControllerURL()
{
	std::stringstream sUrl;
	if (m_username!="")
		sUrl << "http://" << m_ipaddress << ":" << m_port << "/ZWaveAPI/Data/" << m_updateTime;
	else
		sUrl << "http://"  << m_username << ":" << m_password << "@" << m_ipaddress << ":" << m_port << "/ZWaveAPI/Data/" << m_updateTime;
	return sUrl.str();
}

const std::string CRazberry::GetRunURL(const std::string cmd)
{
	std::stringstream sUrl;
	if (m_username!="")
		sUrl << "http://" << m_ipaddress << ":" << m_port << "/ZWaveAPI/Run/" << cmd;
	else
		sUrl << "http://"  << m_username << ":" << m_password << "@" << m_ipaddress << ":" << m_port << "/ZWaveAPI/Run/" << cmd;
	return sUrl.str();
}

bool CRazberry::GetInitialDevices()
{
	std::string sResult;
	
	std::string szURL=GetControllerURL();
	bool bret;
	bret=HTTPClient::GET(szURL,sResult);
	if (!bret)
	{
		_log.Log(LOG_ERROR,"Error getting Razberry data!");
		return 0;
	}
	//sResult=readInputTestFile("test.json");
	Json::Value root;

	Json::Reader jReader;
	bool ret=jReader.parse(sResult,root);
	if (!ret)
	{
		_log.Log(LOG_ERROR,"Razberry: Invalid data received!");
		return 0;
	}

	Json::Value jval;
	jval=root["controller"];
	if (jval.empty()==true)
		return 0;
	m_controllerID=jval["data"]["nodeId"]["value"].asInt();

	for (Json::Value::iterator itt=root.begin(); itt!=root.end(); ++itt)
	{
		const std::string kName=itt.key().asString();
		if (kName=="devices")
		{
			parseDevices(*itt);
		}
		else if (kName=="updateTime")
		{
			std::string supdateTime=(*itt).asString();
			m_updateTime=(time_t)atol(supdateTime.c_str());
		}
	}

	return true;
}

bool CRazberry::GetUpdates()
{
	std::string sResult;
	
	std::string szURL=GetControllerURL();
	bool bret;
	bret=HTTPClient::GET(szURL,sResult);
	if (!bret)
	{
		_log.Log(LOG_ERROR,"Razberry: Error getting update data!");
		return 0;
	}
	//sResult=readInputTestFile("update.json");
	Json::Value root;

	Json::Reader jReader;
	bool ret=jReader.parse(sResult,root);
	if (!ret)
	{
		_log.Log(LOG_ERROR,"Razberry: Invalid data received!");
		return 0;
	}

	for (Json::Value::iterator itt=root.begin(); itt!=root.end(); ++itt)
	{
		std::string kName=itt.key().asString();
		const Json::Value obj=(*itt);

		if (kName=="updateTime")
		{
			std::string supdateTime=obj.asString();
			m_updateTime=(time_t)atol(supdateTime.c_str());
		}
		else if (kName=="devices")
		{
			parseDevices(obj);
		}
		else
		{
			std::vector<std::string> results;
			StringSplit(kName,".",results);

			if (results.size()>1)
			{
				UpdateDevice(kName,obj);
			}
		}
	}

	return true;
}

void CRazberry::parseDevices(const Json::Value devroot)
{
	for (Json::Value::iterator itt=devroot.begin(); itt!=devroot.end(); ++itt)
	{
		const std::string devID=itt.key().asString();

		unsigned long nodeID=atol(devID.c_str());
		if ((nodeID==255)||(nodeID==m_controllerID))
			continue; //skip ourself

		const Json::Value node=(*itt);

		_tZWaveDevice _device;
		_device.nodeID=nodeID;
		// Device status and battery
		_device.basicType =		node["data"]["basicType"]["value"].asInt();
		_device.genericType =	node["data"]["genericType"]["value"].asInt();
		_device.specificType =	node["data"]["specificType"]["value"].asInt();
		_device.isListening =	node["data"]["isListening"]["value"].asBool();
		_device.sensor250=		node["data"]["sensor250"]["value"].asBool();
		_device.sensor1000=		node["data"]["sensor1000"]["value"].asBool();
		_device.isFLiRS =		!_device.isListening && (_device.sensor250 || _device.sensor1000);
		_device.hasWakeup =		(node["instances"]["0"]["commandClasses"]["132"].empty()==false);
		_device.hasBattery =	(node["instances"]["0"]["commandClasses"]["128"].empty()==false);

		const Json::Value nodeInstances=node["instances"];
		// For all instances
		bool haveMultipleInstance=(nodeInstances.size()>1);
		for (Json::Value::iterator ittInstance=nodeInstances.begin(); ittInstance!=nodeInstances.end(); ++ittInstance)
		{
			_device.commandClassID=0;
			_device.scaleID=-1;

			const std::string sID=ittInstance.key().asString();
			_device.instanceID=atoi(sID.c_str());
			if ((_device.instanceID==0)&&(haveMultipleInstance))
				continue;// We skip instance 0 if there are more, since it should be mapped to other instances or their superposition

			const Json::Value instance=(*ittInstance);

			// Switches
			// We choose SwitchMultilevel first, if not available, SwhichBinary is chosen
			if (instance["commandClasses"]["38"].empty()==false)
			{
				_device.commandClassID=38;
				_device.intvalue=instance["commandClasses"]["38"]["data"]["level"]["value"].asInt();
				InsertOrUpdateDevice(_device,true);
			}
			else if (instance["commandClasses"]["37"].empty()==false)
			{
				_device.commandClassID=37;
				_device.intvalue=instance["commandClasses"]["37"]["data"]["level"]["value"].asInt();
				InsertOrUpdateDevice(_device,true);
			}

			// Add SensorMultilevel
			if (instance["commandClasses"]["48"].empty()==false)
			{
				_device.commandClassID=48;
				//InsertOrUpdateDevice(_device);
			}
			if (instance["commandClasses"]["49"].empty()==false)
			{
				_device.commandClassID=49;
				//InsertOrUpdateDevice(_device);
			}

			// Meters which are supposed to be sensors (measurable)
			if (instance["commandClasses"]["50"].empty()==false)
			{
				const Json::Value inVal=instance["commandClasses"]["50"]["data"];
				for (Json::Value::iterator itt2=inVal.begin(); itt2!=inVal.end(); ++itt2)
				{
					const std::string sKey=itt2.key().asString();
					if (!isInt(sKey))
						continue; //not a scale
					_device.scaleID=atoi(sKey.c_str());
					int sensorType=(*itt2)["sensorType"]["value"].asInt();
					_device.floatValue=(*itt2)["val"]["value"].asFloat();
					std::string scaleString = (*itt2)["scaleString"]["value"].asString();
					if ((_device.scaleID == 2 || _device.scaleID == 4 || _device.scaleID == 6) && (sensorType == 1))
					{
						_device.commandClassID=50;
						InsertOrUpdateDevice(_device,false);
					}
				}
			}

			// Meters (true meter values)
			if (instance["commandClasses"]["50"].empty()==false)
			{
				const Json::Value inVal=instance["commandClasses"]["50"]["data"];
				for (Json::Value::iterator itt2=inVal.begin(); itt2!=inVal.end(); ++itt2)
				{
					const std::string sKey=itt2.key().asString();
					if (!isInt(sKey))
						continue; //not a scale
					_device.scaleID=atoi(sKey.c_str());
					int sensorType=(*itt2)["sensorType"]["value"].asInt();
					_device.floatValue=(*itt2)["val"]["value"].asFloat();
					std::string scaleString = (*itt2)["scaleString"]["value"].asString();
					if ((_device.scaleID == 2 || _device.scaleID == 4 || _device.scaleID == 6) && (sensorType == 1))
						continue; // we don't want to have measurable here (W, V, PowerFactor)
					_device.commandClassID=50;
					InsertOrUpdateDevice(_device,false);
				}
			}
		}
	}
}

void CRazberry::InsertOrUpdateDevice(_tZWaveDevice device, const bool bSend2Domoticz)
{
	std::stringstream sstr;
	sstr << device.nodeID << ".instances." << device.instanceID << ".commandClasses." << device.commandClassID << ".data";
	if (device.scaleID!=-1)
	{
		sstr << "." << device.scaleID;
	}
	device.string_id=sstr.str();

	bool bNewDevice=(m_devices.find(device.string_id)==m_devices.end());
	
	device.lastreceived=time(NULL);
#ifdef _DEBUG
	if (bNewDevice)
	{
		std::cout << "New device: " << device.string_id << std::endl;
	}
	else
	{
		std::cout << "Update device: " << device.string_id << std::endl;
	}
#endif
	//insert or update device in internal record
	device.sequence_number=1;
	m_devices[device.string_id]=device;
	if (bSend2Domoticz)
	{
		SendDevice2Domoticz(&device);
	}
}

void CRazberry::UpdateDevice(const std::string path, const Json::Value obj)
{
	_tZWaveDevice *pDevice=NULL;

	std::map<std::string,_tZWaveDevice>::iterator itt;
	for (itt=m_devices.begin(); itt!=m_devices.end(); ++itt)
	{
		std::string::size_type loc = path.find(itt->second.string_id,0);
		if (loc!=std::string::npos)
		{
			pDevice=&itt->second;
			break;
		}
	}
	if (pDevice==NULL)
	{
		return; //don't know you
	}

	switch (pDevice->commandClassID)
	{
	case 37:
	case 38:
		//switch
		pDevice->intvalue=obj["value"].asInt();
		break;
	}
	time_t atime=time(NULL);
	if (atime-pDevice->lastreceived<2)
		return; //to soon
#ifdef _DEBUG
	std::cout << asctime(localtime(&atime));
	std::cout << "Razberry: Update device: " << pDevice->string_id << std::endl;
#endif
	switch (pDevice->commandClassID)
	{
	case 50:
		//meters
		pDevice->floatValue=obj["val"]["value"].asFloat();
		break;
	}

	pDevice->lastreceived=atime;
	pDevice->sequence_number+=1;
	if (pDevice->sequence_number==0)
		pDevice->sequence_number=1;
	SendDevice2Domoticz(pDevice);
}

void CRazberry::SendDevice2Domoticz(const _tZWaveDevice *pDevice)
{
	unsigned char ID1=0;
	unsigned char ID2=0;
	unsigned char ID3=0;
	unsigned char ID4=0;

	if ((pDevice->commandClassID==ZDTYPE_SWITCHNORMAL)||(pDevice->commandClassID==ZDTYPE_SWITCHDIMMER))
	{
		//Send as Lighting 2

		//make device ID
		ID1=0;
		ID2=(unsigned char)((pDevice->nodeID&0xFF00)>>8);
		ID3=(unsigned char)pDevice->nodeID&0xFF;
		ID4=pDevice->instanceID;

		tRBUF lcmd;
		memset(&lcmd,0,sizeof(RBUF));
		lcmd.LIGHTING2.packetlength=sizeof(lcmd.LIGHTING2)-1;
		lcmd.LIGHTING2.packettype=pTypeLighting2;
		lcmd.LIGHTING2.subtype=sTypeAC;
		lcmd.LIGHTING2.seqnbr=pDevice->sequence_number;
		lcmd.LIGHTING2.id1=ID1;
		lcmd.LIGHTING2.id2=ID2;
		lcmd.LIGHTING2.id3=ID3;
		lcmd.LIGHTING2.id4=ID4;
		lcmd.LIGHTING2.unitcode=1;
		int level=15;
		if (pDevice->commandClassID==ZDTYPE_SWITCHNORMAL)
		{
			//simple on/off device
			if (pDevice->intvalue==0)
			{
				level=0;
				lcmd.LIGHTING2.cmnd=light2_sOff;
			}
			else
			{
				level=15;
				lcmd.LIGHTING2.cmnd=light2_sOn;
			}
		}
		else
		{
			//dimmer able device
			if (pDevice->intvalue==0)
				level=0;
			if (pDevice->intvalue==255)
				level=15;
			else
			{
				float flevel=(15.0f/100.0f)*float(pDevice->intvalue);
				level=round(flevel);
				if (level>15)
					level=15;
			}
			if (level==0)
				lcmd.LIGHTING2.cmnd=light2_sOff;
			else if (level==15)
				lcmd.LIGHTING2.cmnd=light2_sOn;
			else
				lcmd.LIGHTING2.cmnd=light2_sSetLevel;
		}
		lcmd.LIGHTING2.level=level;
		lcmd.LIGHTING2.filler=0;
		lcmd.LIGHTING2.rssi=7;
		sDecodeRXMessage(this, (const unsigned char *)&lcmd.LIGHTING2);//decode message
		m_sharedserver.SendToAll((const char*)&lcmd,sizeof(lcmd.LIGHTING2));
		return;
	}
	else if (pDevice->commandClassID==ZDTYPE_SENSOR_METER)
	{
		_tUsageMeter umeter;
		umeter.fusage=pDevice->floatValue;
		sDecodeRXMessage(this, (const unsigned char *)&umeter);//decode message
		m_sharedserver.SendToAll((const char*)&umeter,sizeof(_tUsageMeter));
	}
}

const CRazberry::_tZWaveDevice* CRazberry::FindDevice(int nodeID, int instanceID, int commandClassID)
{
	std::map<std::string,_tZWaveDevice>::iterator itt;
	for (itt=m_devices.begin(); itt!=m_devices.end(); ++itt)
	{
		if (
			(itt->second.nodeID==nodeID)&&
			(itt->second.instanceID==instanceID)&&
			(itt->second.commandClassID==commandClassID)
			)
			return &itt->second;
	}
	return NULL;
}

void CRazberry::WriteToHardware(const char *pdata, const unsigned char length)
{
	unsigned char ID1=0;
	unsigned char ID2=0;
	unsigned char ID3=0;
	unsigned char ID4=0;

	const _tZWaveDevice* pDevice=NULL;

	tRBUF *pSen=(tRBUF*)pdata;
	if (pSen->LIGHTING2.packettype=pTypeLighting2)
	{
		//light command

		//find device

		int nodeID=(pSen->LIGHTING2.id2<<8)|pSen->LIGHTING2.id3;
		int instanceID=pSen->LIGHTING2.id4;

		int svalue=0;

		//find normal
		pDevice=FindDevice(nodeID,instanceID,ZDTYPE_SWITCHNORMAL);
		if (pDevice)
		{
			if (pSen->LIGHTING2.cmnd==light2_sOff)
				svalue=0;
			else
				svalue=255;
		}
		else {
			//find dimmer
			pDevice=FindDevice(nodeID,instanceID,ZDTYPE_SWITCHNORMAL);
			if (!pDevice)
				return;//ehh dont know you!

			if (pSen->LIGHTING2.cmnd==light2_sOff)
				svalue=0;
			if (pSen->LIGHTING2.cmnd==light2_sOn)
				svalue=255;
			else
			{
				float fvalue=(100.0f/15.0f)*float(pSen->LIGHTING2.level);
				if (fvalue>100.0f)
					fvalue=100.0f;
				svalue=round(fvalue);
			}
		}
		//Send command
		std::stringstream sstr;
		sstr << "devices[" << nodeID << "].instances[" << instanceID << "].commandClasses[" << pDevice->commandClassID << "].Set(" << svalue << ")";
		RunCMD(sstr.str());
	}
}

void CRazberry::RunCMD(const std::string cmd)
{
	std::string szURL=GetRunURL(cmd);
	bool bret;
	std::string sResult;
	bret=HTTPClient::GET(szURL,sResult);
	if (!bret)
	{
		_log.Log(LOG_ERROR,"Razberry: Error sending command to controller!");
	}
}

