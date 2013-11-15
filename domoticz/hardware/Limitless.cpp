#include "stdafx.h"
#include "LimitLess.h"
#include "../main/Helper.h"
#include "../main/Logger.h"
#include "../httpclient/HTTPClient.h"
#include "hardwaretypes.h"
#include <boost/asio.hpp>

// Commands
// White LEDs
const unsigned char AllOn[3] = { 0x35, 0x0, 0x55 };
const unsigned char AllOff[3] = { 0x39, 0x0, 0x55 };
const unsigned char AllNight[3] = { 0xB9, 0x0, 0x55 };
const unsigned char AllFull [3] = { 0xB5, 0x0, 0x55 };

const unsigned char BrightnessUp[3] = { 0x3C, 0x0, 0x55 };
const unsigned char BrightnessDown[3] = { 0x34, 0x0, 0x55 };

const unsigned char ColorTempUp[3] = { 0x3E, 0x0, 0x55 };
const unsigned char ColorTempDown[3] = { 0x3F, 0x0, 0x55 };

const unsigned char Group1On[3] = { 0x38, 0x0, 0x55 };
const unsigned char Group1Off[3] = { 0x3B, 0x0, 0x55 };
const unsigned char Group1Night[3] = { 0xBB, 0x0, 0x55 };
const unsigned char Group1Full[3] = { 0xB8, 0x0, 0x55 };

const unsigned char Group2On[3] = { 0x3D, 0x0, 0x55 };
const unsigned char Group2Off[3] = { 0x33, 0x0, 0x55 };
const unsigned char Group2Night[3] = { 0xB3, 0x0, 0x55 };
const unsigned char Group2Full[3] = { 0xBD, 0x0, 0x55 };

const unsigned char Group3On[3] = { 0x37, 0x0, 0x55 };
const unsigned char Group3Off[3] = { 0x3A, 0x0, 0x55 };
const unsigned char Group3Night[3] = { 0xBA, 0x0, 0x55 };
const unsigned char Group3Full[3] = { 0xB7, 0x0, 0x55 };

const unsigned char Group4On[3] = { 0x32, 0x0, 0x55 };
const unsigned char Group4Off[3] = { 0x36, 0x0, 0x55 };
const unsigned char Group4Night[3] = { 0xB6, 0x0, 0x55 };
const unsigned char Group4Full[3] = { 0xB2, 0x0, 0x55 };

// RGB LEDs
const unsigned char RGBOn[3] = { 0x22, 0x0, 0x55 };
const unsigned char RGBOff[3] = { 0x21, 0x0, 0x55 };

const unsigned char RGBBrightnessUp[3] = { 0x23, 0x0, 0x55 };
const unsigned char RGBBrightnessDown[3] = { 0x24, 0x0, 0x55 };

const unsigned char RGBSpeedUp[3] = { 0x25, 0x0, 0x55 };
const unsigned char RGBSpeedDown[3] = { 0x26, 0x0, 0x55 };

const unsigned char RGBDiscoNext[3] = { 0x27, 0x0, 0x55 };
const unsigned char RGBDiscoLast[3] = { 0x28, 0x0, 0x55 };

const unsigned char RGBColour[3] = { 0x20, 0x0, 0x55 };

//RGBW LEDs
const unsigned char RGBWOn[3] = { 0x42, 0x0, 0x55 };
const unsigned char RGBWOff[3] = { 0x41, 0x0, 0x55 };

const unsigned char RGBWDiscoSpeedSlower[3] = { 0x43, 0x0, 0x55 };
const unsigned char RGBWDiscoSpeedFaster[3] = { 0x44, 0x0, 0x55 };

const unsigned char RGBWGroup1AllOff[3] = { 0x45, 0x0, 0x55 };	//(SYNC/PAIR RGB+W Bulb within 2 seconds of Wall Switch Power being turned ON)
const unsigned char RGBWGroup1AllOn[3] = { 0x46, 0x0, 0x55 };
const unsigned char RGBWGroup2AllOff[3] = { 0x47, 0x0, 0x55 };	//(SYNC/PAIR RGB+W Bulb within 2 seconds of Wall Switch Power being turned ON)
const unsigned char RGBWGroup2AllOn[3] = { 0x48, 0x0, 0x55 };
const unsigned char RGBWGroup3AllOff[3] = { 0x49, 0x0, 0x55 };	//(SYNC/PAIR RGB+W Bulb within 2 seconds of Wall Switch Power being turned ON)
const unsigned char RGBWGroup3AllOn[3] = { 0x4A, 0x0, 0x55 };
const unsigned char RGBWGroup4AllOff[3] = { 0x4B, 0x0, 0x55 };	//(SYNC/PAIR RGB+W Bulb within 2 seconds of Wall Switch Power being turned ON)
const unsigned char RGBWGroup4AllOn[3] = { 0x4C, 0x0, 0x55 };
const unsigned char RGBWDisco[3] = { 0x4D, 0x0, 0x55 };

//Not to sure about these below, think we should send the 'on' command
const unsigned char RGBWSetColorToWhiteAll[3]={0xC2,0x0,0x55};	//SET COLOR TO WHITE (GROUP ALL) 0x42 100ms followed by: 0xC2
const unsigned char RGBWSetColorToWhiteGroup1[3]={0xC5,0x0,0x55};	//SET COLOR TO WHITE (GROUP 1) 0x45 100ms followed by: 0xC5
const unsigned char RGBWSetColorToWhiteGroup2[3]={0xC7,0x0,0x55};	//SET COLOR TO WHITE (GROUP 2) 0x47 100ms followed by: 0xC7
const unsigned char RGBWSetColorToWhiteGroup3[3]={0xC9,0x0,0x55};	//SET COLOR TO WHITE (GROUP 3) 0x49 100ms followed by: 0xC9
const unsigned char RGBWSetColorToWhiteGroup4[3]={0xCB,0x0,0x55};	//SET COLOR TO WHITE (GROUP 4) 0x4B 100ms followed by: 0xCB

const unsigned char RGBWSetBrightnessLevel[3]={0x4E,0,0x55};
//LIMITLESSLED RGBW DIRECT BRIGHTNESS SETTING is by a 3BYTE COMMAND: (First send the Group ON for the group you want to set the brightness for. You send the group ON command 100ms before sending the 4E 00 55)
//Byte1: 0x4E (decimal: 78)
//Byte2: 0�00 to 0xFF (full brightness 0x3B)
//Byte3: Always 0�55 (decimal: 85)

const unsigned char RGBWSetColor[3]={0x40,0,0x55};
//LIMITLESSLED RGBW COLOR SETTING is by a 3BYTE COMMAND: (First send the Group ON for the group you want to set the colour for. You send the group ON command 100ms before sending the 40)
//Byte1: 0�40 (decimal: 64)
//Byte2: 0�00 to 0xFF (255 colors) Color Matrix Chart [COMING SOON]
//Byte3: Always 0�55 (decimal: 85)

CLimitLess::CLimitLess(const int ID, const std::string IPAddress, const unsigned short usIPPort)
{
	m_HwdID=ID;
	m_szIPAddress=IPAddress;
	m_usIPPort=usIPPort;
	m_stoprequested=false;
	m_RemoteSocket=INVALID_SOCKET;
#if defined WIN32
	//Init winsock
	WSADATA data;
	WORD version; 

	version = (MAKEWORD(2, 2)); 
	int ret = WSAStartup(version, &data); 
	if (ret != 0) 
	{  
		ret = WSAGetLastError(); 

		if (ret == WSANOTINITIALISED) 
		{  
			MessageBox(0,"Winsock not initialized","Error:",MB_OK); 
		}
	}		
#endif

	memset(&m_stRemoteDestAddr,0,sizeof(m_stRemoteDestAddr));
	m_stRemoteDestAddr.sin_family = AF_UNSPEC;
	m_stRemoteDestAddr.sin_family = PF_INET; 

	unsigned long ip;
	ip=inet_addr(m_szIPAddress.c_str());

	// if we have a error in the ip, it means we have entered a string
	if(ip!=INADDR_NONE)
	{
		m_stRemoteDestAddr.sin_addr.s_addr=ip;
	}
	else
	{
		// change Hostname in server address
		hostent *he=gethostbyname(m_szIPAddress.c_str());
		if(he!=NULL)
			memcpy(&(m_stRemoteDestAddr.sin_addr),he->h_addr_list[0],4);
	}

	m_stRemoteDestAddr.sin_port = htons (usIPPort); 

	Init();
}

CLimitLess::~CLimitLess(void)
{
	WSACleanup();
}

void CLimitLess::Init()
{
}

bool CLimitLess::StartHardware()
{
	Init();
	if (m_RemoteSocket!=INVALID_SOCKET)
	{
		closesocket(m_RemoteSocket);
		m_RemoteSocket=INVALID_SOCKET;
	}

	m_RemoteSocket = socket( AF_INET, SOCK_DGRAM, 0 );

	sOnConnected(this);
	//Start worker thread
	m_thread = boost::shared_ptr<boost::thread>(new boost::thread(boost::bind(&CLimitLess::Do_Work, this)));

	return (m_thread!=NULL);
}

bool CLimitLess::StopHardware()
{
	/*
    m_stoprequested=true;
	if (m_thread)
		m_thread->join();
	return true;
    */
	if (m_thread!=NULL)
	{
		assert(m_thread);
		m_stoprequested = true;
		m_thread->join();
	}
    if (m_RemoteSocket!=INVALID_SOCKET)
	{
		closesocket(m_RemoteSocket);
		m_RemoteSocket=INVALID_SOCKET;
	}
    return true;
}

void CLimitLess::Do_Work()
{
	while (!m_stoprequested)
	{
		boost::this_thread::sleep(boost::posix_time::seconds(1));
	}
	_log.Log(LOG_NORM,"LimitLess Worker stopped...");
}

void CLimitLess::WriteToHardware(const char *pdata, const unsigned char length)
{
	sendto(m_RemoteSocket,pdata,length,0,(struct sockaddr*)&m_stRemoteDestAddr, sizeof(SOCKADDR_IN));
}
