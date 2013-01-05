#pragma once

#include "SQLHelper.h"
#include "WebServer.h"
#include "RFXtrx.h"
#include "DomoticzHardware.h"
#include "Scheduler.h"

enum eVerboseLevel
{
	EVBL_None,
	EVBL_ALL,
};

class MainWorker
{
public:
	MainWorker();
	~MainWorker();

	bool Start();
	bool Stop();

	void StopDomoticzHardware();
	void StartDomoticzHardware();
	void AddDomoticzHardware(CDomoticzHardwareBase *pHardware);
	void RemoveDomoticzHardware(CDomoticzHardwareBase *pHardware);
	void RemoveDomoticzHardware(int HwdId);
	int FindDomoticzHardware(int HwdId);
	void ClearDomoticzHardware();

	void SetVerboseLevel(eVerboseLevel Level);
	void SetWebserverPort(std::string Port);
	std::string GetWebserverPort();

	bool SwitchLight(std::string idx, std::string switchcmd,std::string level);
	bool SwitchLight(unsigned long long idx, std::string switchcmd, unsigned char level);
	bool SwitchLightInt(const std::vector<std::string> sd, const std::string switchcmd, unsigned char level, const bool IsTesting);

	bool GetSunSettings();

	bool AddHardwareFromParams(
				int ID,
				std::string Name,
				_eHardwareTypes Type,
				std::string Address, unsigned short Port, 
				std::string Username, std::string Password, 
				unsigned char Mode1,
				unsigned char Mode2, 
				unsigned char Mode3,
				unsigned char Mode4,
				unsigned char Mode5);

	CSQLHelper m_sql;
	CScheduler m_scheduler;
	bool m_bIgnoreUsernamePassword;
private:
	unsigned char m_ScheduleLastMinute;
	unsigned char m_ScheduleLastHour;

	boost::mutex m_devicemutex;
	boost::mutex decodeRXMessageMutex;

	bool m_bStartHardware;
	unsigned char m_hardwareStartCounter;

	std::vector<CDomoticzHardwareBase*> m_hardwaredevices;
	eVerboseLevel m_verboselevel;
	http::server::CWebServer m_webserver;
	std::string m_webserverport;

	volatile bool m_stoprequested;
	boost::shared_ptr<boost::thread> m_thread;
	boost::mutex m_mutex;

	bool StartThread();
	void Do_Work();
	void SendResetCommand(CDomoticzHardwareBase *pHardware);
	void SendCommand(const int HwdID, unsigned char Cmd, const char *szMessage=NULL);
	void WriteToHardware(const int HwdID, const char *pdata, const unsigned char length);
	void DecodeRXMessage(const CDomoticzHardwareBase *pHardware, const unsigned char *pRXCommand);
	void OnHardwareConnected(CDomoticzHardwareBase *pHardware);

	void WriteMessage(const char *szMessage);
	void WriteMessage(const char *szMessage, bool linefeed);

	//message decoders
	void decode_BateryLevel(bool bIsInPercentage, unsigned char level);
	unsigned char get_BateryLevel(bool bIsInPercentage, unsigned char level);

	//RFX Message decoders
	void decode_InterfaceMessage(const int HwdID, const tRBUF *pResponse);
	void decode_UNDECODED(const int HwdID, const tRBUF *pResponse);
	void decode_RecXmitMessage(const int HwdID, const tRBUF *pResponse);
	void decode_Rain(const int HwdID, const tRBUF *pResponse);
	void decode_Wind(const int HwdID, const tRBUF *pResponse);
	void decode_Temp(const int HwdID, const tRBUF *pResponse);
	void decode_Hum(const int HwdID, const tRBUF *pResponse);
	void decode_TempHum(const int HwdID, const tRBUF *pResponse);
	void decode_UV(const int HwdID, const tRBUF *pResponse);
	void decode_Lighting1(const int HwdID, const tRBUF *pResponse);
	void decode_Lighting2(const int HwdID, const tRBUF *pResponse);
	void decode_Lighting3(const int HwdID, const tRBUF *pResponse);
	void decode_Lighting4(const int HwdID, const tRBUF *pResponse);
	void decode_Lighting5(const int HwdID, const tRBUF *pResponse);
	void decode_Lighting6(const int HwdID, const tRBUF *pResponse);
	void decode_BLINDS1(const int HwdID, const tRBUF *pResponse);
	void decode_Security1(const int HwdID, const tRBUF *pResponse);
	void decode_Camera1(const int HwdID, const tRBUF *pResponse);
	void decode_Remote(const int HwdID, const tRBUF *pResponse);
	void decode_Thermostat1(const int HwdID, const tRBUF *pResponse);
	void decode_Thermostat2(const int HwdID, const tRBUF *pResponse);
	void decode_Thermostat3(const int HwdID, const tRBUF *pResponse);
	void decode_Baro(const int HwdID, const tRBUF *pResponse);
	void decode_TempHumBaro(const int HwdID, const tRBUF *pResponse);
	void decode_DateTime(const int HwdID, const tRBUF *pResponse);
	void decode_Current(const int HwdID, const tRBUF *pResponse);
	void decode_Energy(const int HwdID, const tRBUF *pResponse);
	void decode_Current_Energy(const int HwdID, const tRBUF *pResponse);
	void decode_Gas(const int HwdID, const tRBUF *pResponse);
	void decode_Water(const int HwdID, const tRBUF *pResponse);
	void decode_Weight(const int HwdID, const tRBUF *pResponse);
	void decode_RFXSensor(const int HwdID, const tRBUF *pResponse);
	void decode_RFXMeter(const int HwdID, const tRBUF *pResponse);
	void decode_P1MeterPower(const int HwdID, const tRBUF *pResponse);
	void decode_P1MeterGas(const int HwdID, const tRBUF *pResponse);
	void decode_FS20(const int HwdID, const tRBUF *pResponse);
};
