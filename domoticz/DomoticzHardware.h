#pragma once

#include <boost/signals2.hpp>
#include "tcpserver/TCPServer.h"

//Base class with functions all notification systems should have
#define RX_BUFFER_SIZE 40

class CDomoticzHardwareBase
{
	friend class RFXComSerial;
	friend class RFXComTCP;
	friend class DomoticzTCP;
public:
	CDomoticzHardwareBase();
	~CDomoticzHardwareBase() {};

	bool Start();
	bool Stop();
	virtual void WriteToHardware(const char *pdata, const unsigned char length)=0;

	void StopSharing();
	bool StartSharing(const std::string port, const std::string username, const std::string password, const int rights);

	bool IsStarted() { return m_bIsStarted; }

	int m_HwdID;
	std::string Name;
	unsigned char m_SeqNr;
	unsigned char m_rxbufferpos;
	bool m_bEnableReceive;
	boost::signals2::signal<void(CDomoticzHardwareBase *pHardware, const unsigned char *pRXCommand)> sDecodeRXMessage;
	boost::signals2::signal<void(CDomoticzHardwareBase *pDevice)> sOnConnected;
private:
	boost::mutex readQueueMutex;
	tcp::server::CTCPServer m_sharedserver;
	virtual bool StartHardware()=0;
	virtual bool StopHardware()=0;
	void onRFXMessage(const unsigned char *pBuffer, const size_t Len);
	unsigned char m_rxbuffer[RX_BUFFER_SIZE];
	bool m_bIsStarted;
};

