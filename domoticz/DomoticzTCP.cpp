#include "stdafx.h"
#include "DomoticzTCP.h"
//#include <boost/bind.hpp>
//#include <boost/asio.hpp>

#define RETRY_DELAY 10

DomoticzTCP::DomoticzTCP(const int ID, const std::string IPAddress, const unsigned short usIPPort, const std::string username, const std::string password)
{
	m_HwdID=ID;
	m_username=username;
	m_password=password;
#if defined WIN32
	int ret;
	//Init winsock
	WSADATA data;
	WORD version; 

	version = (MAKEWORD(2, 2)); 
	ret = WSAStartup(version, &data); 
	if (ret != 0) 
	{  
		ret = WSAGetLastError(); 

		if (ret == WSANOTINITIALISED) 
		{  
			std::cout << "Winsock could not be initialized!" << std::endl;
		}
	}
	m_socket=INVALID_SOCKET;
#endif
	m_stoprequested=false;
	m_szIPAddress=IPAddress;
	m_usIPPort=usIPPort;
}

DomoticzTCP::~DomoticzTCP(void)
{
#if defined WIN32
	//
	// Release WinSock
	//
	WSACleanup();
#endif
}

bool DomoticzTCP::StartHardware()
{
	try
	{
		connectto(m_szIPAddress.c_str(), m_usIPPort);
	}
	catch (boost::exception & e)
	{
		std::cerr << "Error opening TCP connection!\n";
#ifdef _DEBUG
		std::cerr << "-----------------" << std::endl << boost::diagnostic_information(e) << "-----------------" << std::endl;
#endif
		return false;
	}
	catch ( ... )
	{
		std::cerr << "Error opening TCP connection!!!";
		return false;
	}
	m_bIsStarted=true;
	return true;
}

bool DomoticzTCP::StopHardware()
{
	if (isConnected())
	{
		try {
			disconnect();
		} catch(...)
		{
			//Don't throw from a Stop command
		}
	}
	return true;
}

bool DomoticzTCP::connectto(const char *serveraddr, unsigned short port)
{
	disconnect();

	m_stoprequested=false;

	memset(&m_addr,0,sizeof(sockaddr_in));
	m_addr.sin_family = AF_INET;
	m_addr.sin_port = htons(port);

	unsigned long ip;
	ip=inet_addr(serveraddr);

	// if we have a error in the ip, it means we have entered a string
	if(ip!=INADDR_NONE)
	{
		m_addr.sin_addr.s_addr=ip;
	}
	else
	{
		// change Hostname in serveraddr
		hostent *he=gethostbyname(serveraddr);
		if(he==NULL)
		{
			return false;
		}
		else
		{
			memcpy(&(m_addr.sin_addr),he->h_addr_list[0],4);
		}
	}

	m_retrycntr=RETRY_DELAY; //will force reconnect first thing

	//Start worker thread
	m_thread = boost::shared_ptr<boost::thread>(new boost::thread(boost::bind(&DomoticzTCP::Do_Work, this)));

	return (m_thread!=NULL);
}

bool DomoticzTCP::ConnectInternal()
{
	m_socket = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
	if (m_socket == INVALID_SOCKET)
	{
		std::cerr << "could not create a TCP/IP socket!" << std::endl;
		return false;
	}

	// connect to the server
	int nRet;
	nRet = connect(m_socket,(const sockaddr*)&m_addr, sizeof(m_addr));
	if (nRet == SOCKET_ERROR)
	{
		closesocket(m_socket);
		m_socket=INVALID_SOCKET;
		std::cerr << "could not connect to: " << m_szIPAddress << ":" << std::dec << m_usIPPort << std::endl;
		return false;
	}

	std::cout << "connected to: " << m_szIPAddress << ":" << std::dec << m_usIPPort << std::endl;

	if (m_username!="")
	{
		char szAuth[300];
		sprintf(szAuth,"AUTH;%s;%s",m_username.c_str(),m_password.c_str());
		WriteToHardware((const char*)&szAuth,(const unsigned char)strlen(szAuth));
	}

	sOnConnected(this);
	return true;
}

void DomoticzTCP::disconnect()
{
	m_stoprequested=true;
	if (m_thread!=NULL)
		m_thread->join();
	if (m_socket==INVALID_SOCKET)
		return;
	closesocket(m_socket);	//will terminate the thread
	m_socket=INVALID_SOCKET;
}

void DomoticzTCP::Do_Work()
{
	while (!m_stoprequested)
	{
		if (
			(m_socket == INVALID_SOCKET)&&
			(!m_stoprequested)
			)
		{
			boost::this_thread::sleep(boost::posix_time::seconds(1));
			m_retrycntr++;
			if (m_retrycntr>=RETRY_DELAY)
			{
				m_retrycntr=0;
				if (!ConnectInternal())
				{
					std::cout << "retrying in " << std::dec << RETRY_DELAY << " seconds..." << std::endl;
					continue;
				}
			}
		}
		else
		{
			char buf;
			int bread=recv(m_socket,&buf,1,0);
			if ((bread==0)||(bread<0)) {
				std::cout << "TCP/IP connection closed!" << std::endl;
				closesocket(m_socket);
				m_socket=INVALID_SOCKET;
				if (!m_stoprequested)
				{
					std::cout << "retrying in " << std::dec << RETRY_DELAY << " seconds..." << std::endl;
					m_retrycntr=0;
					continue;
				}
			}
			else
			{
				boost::lock_guard<boost::mutex> l(readQueueMutex);
				onRFXMessage((const unsigned char *)&buf,1);
			}
		}
		
	}
	std::cout << "TCP/IP Worker stopped...\n";
} 

void DomoticzTCP::write(const char *data, size_t size)
{
	if (m_socket==INVALID_SOCKET)
		return; //not connected!
	send(m_socket,data,size,0);
}

void DomoticzTCP::WriteToHardware(const char *pdata, const unsigned char length)
{
	if (isConnected())
		write(pdata,length);
}
