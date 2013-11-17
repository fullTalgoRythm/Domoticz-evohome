#pragma once

#include "RFXNames.h"
#include <string>
#include <vector>

class MainWorker;

struct tScheduleItem
{
	bool bIsScene;
	std::string DeviceName;
	unsigned long long RowID;
	unsigned char startHour;
	unsigned char startMin;
	_eTimerType	timerType; 
	_eTimerCommand timerCmd;
	int Level;
	bool bUseRandmoness;
	int Days;
	//internal
	time_t startTime;
};

class CScheduler
{
public:
	CScheduler(void);
	~CScheduler(void);

	void StartScheduler(MainWorker *pMainWorker);
	void StopScheduler();

	void ReloadSchedules();

	void SetSunRiseSetTimers(const std::string &sSunRise, const std::string &sSunSet);

	std::vector<tScheduleItem> GetScheduleItems();

private:
	time_t m_tSunRise;
	time_t m_tSunSet;
	MainWorker *m_pMain;
	boost::mutex m_mutex;
	volatile bool m_stoprequested;
	boost::shared_ptr<boost::thread> m_thread;
	std::vector<tScheduleItem> m_scheduleitems;

	//our thread
	void Do_Work();

	//will set the new/next startTime
	//returns false if timer is invalid (like no sunset/sunrise known yet)
	bool AdjustScheduleItem(tScheduleItem *pItem, bool bForceAddDay);
	//will check if anything needs to be scheduled
	void CheckSchedules();
};

