#pragma once

#include <vector>
#include <string>
#include "RFXNames.h"
#include "../httpclient/UrlEncode.h"

struct sqlite3;

struct _tNotification
{
	unsigned long long ID;
	std::string Params;
	time_t LastSend;
};

struct _tDeviceNameRef
{
	unsigned long long ID;
	int _HardwareID;
	std::string _ID;
	unsigned char _unit;
	unsigned char _devType;
	unsigned char _subType;
	std::string Name;
};

struct _tDeviceStatus
{
	unsigned char _DelayTime;
	int _HardwareID;
	std::string _ID;
	unsigned char _unit;
	unsigned char _devType;
	unsigned char _subType;
	unsigned char _signallevel;
	unsigned char _batterylevel;
	int _nValue;
	std::string _sValue;

	_tDeviceStatus(const unsigned char DelayTime, const int HardwareID, const char* ID, const unsigned char unit, const unsigned char devType, const unsigned char subType, const unsigned char signallevel, const unsigned char batterylevel, const int nValue, const char* sValue)
	{
		_DelayTime=DelayTime;
		_HardwareID=HardwareID;
		_ID=ID;
		_unit=unit;
		_devType=devType;
		_subType=subType;
		_signallevel=signallevel;
		_batterylevel=batterylevel;
		_nValue=nValue;
		_sValue=sValue;
	}
};

class CSQLHelper
{
public:
	CSQLHelper(void);
	~CSQLHelper(void);

	bool OpenDatabase();
	void SetDatabaseName(const std::string DBName);

	void UpdateValue(const int HardwareID, const char* ID, const unsigned char unit, const unsigned char devType, const unsigned char subType, const unsigned char signallevel, const unsigned char batterylevel, const int nValue, std::string &devname);
	void UpdateValue(const int HardwareID, const char* ID, const unsigned char unit, const unsigned char devType, const unsigned char subType, const unsigned char signallevel, const unsigned char batterylevel, const char* sValue, std::string &devname);
	void UpdateValue(const int HardwareID, const char* ID, const unsigned char unit, const unsigned char devType, const unsigned char subType, const unsigned char signallevel, const unsigned char batterylevel, const int nValue, const char* sValue, std::string &devname);

	void GetAddjustment(const int HardwareID, const char* ID, const unsigned char unit, const unsigned char devType, const unsigned char subType, float &AddjValue, float &AddjMulti);
	void GetAddjustment2(const int HardwareID, const char* ID, const unsigned char unit, const unsigned char devType, const unsigned char subType, float &AddjValue, float &AddjMulti);

	void UpdateRFXCOMHardwareDetails(const int HardwareID, const int msg1, const int msg2, const int msg3, const int msg4, const int msg5);

	void UpdateTempVar(const char *Key, const char* sValue);
	bool GetTempVar(const char *Key, int &nValue, std::string &sValue);

	void UpdatePreferencesVar(const char *Key, const char* sValue);
	void UpdatePreferencesVar(const char *Key, const int nValue);
	void UpdatePreferencesVar(const char *Key, const int nValue, const char* sValue);
	bool GetPreferencesVar(const char *Key, int &nValue, std::string &sValue);
	bool GetPreferencesVar(const char *Key, int &nValue);

	void Set5MinuteHistoryDays(const int Days);

	//notification functions
	bool AddNotification(const std::string DevIdx, const std::string Param);
	bool UpdateNotification(const std::string ID, const std::string Param);
	bool RemoveDeviceNotifications(const std::string DevIdx);
	bool RemoveNotification(const std::string ID);
	std::vector<_tNotification> GetNotifications(const unsigned long long DevIdx);
	std::vector<_tNotification> GetNotifications(const std::string DevIdx);
	void TouchNotification(const unsigned long long ID);
	bool HasNotifications(const unsigned long long DevIdx);
	bool HasNotifications(const std::string DevIdx);

	bool CheckAndHandleTempHumidityNotification(
		const int HardwareID, 
		const std::string ID, 
		const unsigned char unit, 
		const unsigned char devType, 
		const unsigned char subType, 
		const float temp, 
		const int humidity, 
		const bool bHaveTemp, 
		const bool bHaveHumidity);
	bool CheckAndHandleNotification(
		const int HardwareID, 
		const std::string ID, 
		const unsigned char unit, 
		const unsigned char devType, 
		const unsigned char subType, 
		const _eNotificationTypes ntype, 
		const float mvalue);
	bool CheckAndHandleRainNotification(
		const int HardwareID, 
		const std::string ID, 
		const unsigned char unit, 
		const unsigned char devType, 
		const unsigned char subType, 
		const _eNotificationTypes ntype, 
		const float mvalue);
	bool CheckAndHandleTotalNotification(
		const int HardwareID, 
		const std::string ID, 
		const unsigned char unit, 
		const unsigned char devType, 
		const unsigned char subType, 
		const _eNotificationTypes ntype, 
		const float mvalue);
	bool CheckAndHandleUsageNotification(
		const int HardwareID, 
		const std::string ID, 
		const unsigned char unit, 
		const unsigned char devType, 
		const unsigned char subType, 
		const _eNotificationTypes ntype, 
		const float mvalue);
	bool CheckAndHandleAmpere123Notification(
		const int HardwareID, 
		const std::string ID, 
		const unsigned char unit, 
		const unsigned char devType, 
		const unsigned char subType, 
		const float Ampere1,
		const float Ampere2,
		const float Ampere3
		);

	bool HasTimers(const unsigned long long Idx);
	bool HasTimers(const std::string Idx);
	bool HasSceneTimers(const unsigned long long Idx);
	bool HasSceneTimers(const std::string Idx);

	void CheckSceneStatus(const unsigned long long Idx);
	void CheckSceneStatus(const std::string Idx);
	void CheckSceneStatusWithDevice(const unsigned long long DevIdx);
	void CheckSceneStatusWithDevice(const std::string DevIdx);

	bool SendNotification(const std::string EventID, const std::string Message);

	void Schedule5Minute();
	void ScheduleDay();

	void DeleteHardware(const std::string idx);
    
    void DeleteCamera(const std::string idx);

    void DeletePlan(const std::string idx);
    
	void DeleteDevice(const std::string idx);

	void TransferDevice(const std::string oldidx, const std::string newidx);

	bool DoesSceneByNameExits(const std::string SceneName);

	std::vector<std::vector<std::string> > query(const std::string szQuery);

	std::string m_LastSwitchID;	//for learning command
	unsigned long long m_LastSwitchRowID;
private:
	boost::mutex m_sqlQueryMutex;
	CURLEncode m_urlencoder;
	sqlite3 *m_dbase;
	std::string m_dbase_name;
	int m_5MinuteHistoryDays;

	std::vector<_tDeviceStatus> m_device_status_queue;
	boost::shared_ptr<boost::thread> m_device_status_thread;
	boost::mutex m_device_status_mutex;
	bool m_stoprequested;
	bool StartThread();
	void Do_Work();

	void UpdateValueInt(const int HardwareID, const char* ID, const unsigned char unit, const unsigned char devType, const unsigned char subType, const unsigned char signallevel, const unsigned char batterylevel, const int nValue, const char* sValue, std::string &devname);

	void CheckAndUpdateDeviceOrder();

	void CleanupLightLog();

	void UpdateTemperatureLog();
	void UpdateRainLog();
	void UpdateWindLog();
	void UpdateUVLog();
	void UpdateMeter();
	void UpdateMultiMeter();
	void AddCalendarTemperature();
	void AddCalendarUpdateRain();
	void AddCalendarUpdateWind();
	void AddCalendarUpdateUV();
	void AddCalendarUpdateMeter();
	void AddCalendarUpdateMultiMeter();
};

