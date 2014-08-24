#include "stdafx.h"
#include <iostream>
#include "Scheduler.h"
#include "localtime_r.h"
#include "Logger.h"
#include "Helper.h"
#include "SQLHelper.h"
#include "mainworker.h"

CScheduler::CScheduler(void)
{
	m_tSunRise=0;
	m_tSunSet=0;
	m_stoprequested=false;
	srand((int)mytime(NULL));
}

CScheduler::~CScheduler(void)
{
}

void CScheduler::StartScheduler()
{
	m_thread = boost::shared_ptr<boost::thread>(new boost::thread(boost::bind(&CScheduler::Do_Work, this)));
}

void CScheduler::StopScheduler()
{
	if (m_thread!=NULL)
	{
		m_stoprequested = true;
		m_thread->join();
	}
}

std::vector<tScheduleItem> CScheduler::GetScheduleItems()
{
	boost::lock_guard<boost::mutex> l(m_mutex);
	std::vector<tScheduleItem> ret;

	std::vector<tScheduleItem>::iterator itt;
	for (itt=m_scheduleitems.begin(); itt!=m_scheduleitems.end(); ++itt)
	{
		ret.push_back(*itt);
	}
	return ret;
}

void CScheduler::ReloadSchedules()
{
	boost::lock_guard<boost::mutex> l(m_mutex);
	m_scheduleitems.clear();

	std::stringstream szQuery;
	std::vector<std::vector<std::string> > result;

	//Add Device Timers
	szQuery << "SELECT T1.DeviceRowID, T1.Time, T1.Type, T1.Cmd, T1.Level, T1.Days, T2.Name, T2.Used, T1.UseRandomness, T1.Hue, T1.[Date] FROM Timers as T1, DeviceStatus as T2 WHERE ((T1.Active == 1) AND (T1.TimerPlan == " << m_sql.m_ActiveTimerPlan << ") AND (T2.ID == T1.DeviceRowID)) ORDER BY T1.ID";
	result=m_sql.query(szQuery.str());
	if (result.size()>0)
	{
		std::vector<std::vector<std::string> >::const_iterator itt;
		for (itt=result.begin(); itt!=result.end(); ++itt)
		{
			std::vector<std::string> sd=*itt;

			bool bDUsed=(atoi(sd[7].c_str())!=0);

			if (bDUsed==true)
			{
				tScheduleItem titem;

				titem.bEnabled = true;
				titem.bIsScene=false;

				_eTimerType timerType = (_eTimerType)atoi(sd[2].c_str());

				std::stringstream s_str( sd[0] );
				s_str >> titem.RowID;

				titem.startHour=(unsigned char)atoi(sd[1].substr(0,2).c_str());
				titem.startMin=(unsigned char)atoi(sd[1].substr(3,2).c_str());
				titem.startTime=0;
				titem.timerType = timerType;
				titem.timerCmd=(_eTimerCommand)atoi(sd[3].c_str());
				titem.Level=(unsigned char)atoi(sd[4].c_str());
				titem.bUseRandmoness=(atoi(sd[8].c_str())!=0);
				titem.Hue=atoi(sd[9].c_str());

				if (timerType == TTYPE_FIXEDDATETIME)
				{
					std::string sdate = sd[10];
					if (sdate.size()!=10)
						continue; //invalid
					titem.startYear = (unsigned short)atoi(sdate.substr(0, 4).c_str());
					titem.startMonth = (unsigned char)atoi(sdate.substr(5, 2).c_str());
					titem.startDay = (unsigned char)atoi(sdate.substr(8, 2).c_str());
				}

				if ((titem.timerCmd==TCMD_ON)&&(titem.Level==0))
				{
					titem.Level=100;
				}
				titem.Days=atoi(sd[5].c_str());
				titem.DeviceName=sd[6];
				if (AdjustScheduleItem(&titem,false)==true)
					m_scheduleitems.push_back(titem);
			}
			else
			{
				//not used? delete it
				szQuery.clear();
				szQuery.str("");
				szQuery << "DELETE FROM Timers WHERE (DeviceRowID == " << sd[0] << ")";
				m_sql.query(szQuery.str());
			}
		}
	}

	//Add Scene Timers
	szQuery.clear();
	szQuery.str("");
	szQuery << "SELECT T1.SceneRowID, T1.Time, T1.Type, T1.Cmd, T1.Level, T1.Days, T2.Name, T1.UseRandomness, T1.[Date] FROM SceneTimers as T1, Scenes as T2 WHERE ((T1.Active == 1) AND (T1.TimerPlan == " << m_sql.m_ActiveTimerPlan << ") AND (T2.ID == T1.SceneRowID)) ORDER BY T1.ID";
	result=m_sql.query(szQuery.str());
	if (result.size()>0)
	{
		std::vector<std::vector<std::string> >::const_iterator itt;
		for (itt=result.begin(); itt!=result.end(); ++itt)
		{
			std::vector<std::string> sd=*itt;

			tScheduleItem titem;

			titem.bEnabled = true;
			titem.bIsScene = true;

			std::stringstream s_str( sd[0] );
			s_str >> titem.RowID;

			_eTimerType timerType = (_eTimerType)atoi(sd[2].c_str());

			if (timerType == TTYPE_FIXEDDATETIME)
			{
				std::string sdate = sd[8];
				if (sdate.size() != 10)
					continue; //invalid
				titem.startYear = (unsigned short)atoi(sdate.substr(0, 4).c_str());
				titem.startMonth = (unsigned char)atoi(sdate.substr(5, 2).c_str());
				titem.startDay = (unsigned char)atoi(sdate.substr(8, 2).c_str());
			}

			titem.startHour=(unsigned char)atoi(sd[1].substr(0,2).c_str());
			titem.startMin=(unsigned char)atoi(sd[1].substr(3,2).c_str());
			titem.startTime=0;
			titem.timerType = timerType;
			titem.timerCmd=(_eTimerCommand)atoi(sd[3].c_str());
			titem.Level=(unsigned char)atoi(sd[4].c_str());
			titem.bUseRandmoness=(atoi(sd[7].c_str())!=0);
			if ((titem.timerCmd==TCMD_ON)&&(titem.Level==0))
			{
				titem.Level=100;
			}
			titem.Days=atoi(sd[5].c_str());
			titem.DeviceName=sd[6];
			if (AdjustScheduleItem(&titem,false)==true)
				m_scheduleitems.push_back(titem);
		}
	}

}

void CScheduler::SetSunRiseSetTimers(const std::string &sSunRise, const std::string &sSunSet)
{
	bool bReloadSchedules=false;
	{	//needed private scope for the lock
		boost::lock_guard<boost::mutex> l(m_mutex);
		unsigned char hour,min,sec;

		time_t temptime;
		time_t atime=mytime(NULL);
		struct tm ltime;
		localtime_r(&atime,&ltime);

		hour=atoi(sSunRise.substr(0,2).c_str());
		min=atoi(sSunRise.substr(3,2).c_str());
		sec=atoi(sSunRise.substr(6,2).c_str());

		ltime.tm_hour = hour;
		ltime.tm_min = min;
		ltime.tm_sec = sec;
		temptime = mktime(&ltime);
		if ((m_tSunRise!=temptime)&&(temptime!=0))
		{
			if (m_tSunRise==0)
				bReloadSchedules=true;
			m_tSunRise=temptime;
		}

		hour=atoi(sSunSet.substr(0,2).c_str());
		min=atoi(sSunSet.substr(3,2).c_str());
		sec=atoi(sSunSet.substr(6,2).c_str());

		ltime.tm_hour = hour;
		ltime.tm_min = min;
		ltime.tm_sec = sec;
		temptime = mktime(&ltime);
		if ((m_tSunSet!=temptime)&&(temptime!=0))
		{
			if (m_tSunSet==0)
				bReloadSchedules=true;
			m_tSunSet=temptime;
		}
	}
	if (bReloadSchedules)
		ReloadSchedules();
}

bool CScheduler::AdjustScheduleItem(tScheduleItem *pItem, bool bForceAddDay)
{
	time_t atime=mytime(NULL);
	time_t rtime=atime;
	struct tm ltime;
	localtime_r(&atime,&ltime);
	ltime.tm_sec=0;

	unsigned long HourMinuteOffset=(pItem->startHour*3600)+(pItem->startMin*60);

	int nRandomTimerFrame=15;
	m_sql.GetPreferencesVar("RandomTimerFrame", nRandomTimerFrame);
	int roffset=0;
	if (pItem->bUseRandmoness)
	{
		if ((pItem->timerType == TTYPE_ONTIME) || (pItem->timerType == TTYPE_FIXEDDATETIME))
			roffset=rand() % (nRandomTimerFrame*2)-nRandomTimerFrame;
		else
			roffset=rand() % (nRandomTimerFrame);
	}

	if (pItem->timerType == TTYPE_ONTIME)
	{
		ltime.tm_hour=pItem->startHour;
		ltime.tm_min=pItem->startMin;
		rtime=mktime(&ltime)+(roffset*60);
	}
	else if (pItem->timerType == TTYPE_FIXEDDATETIME)
	{
		ltime.tm_year = pItem->startYear - 1900;
		ltime.tm_mon = pItem->startMonth - 1;
		ltime.tm_mday = pItem->startDay;
		ltime.tm_hour = pItem->startHour;
		ltime.tm_min = pItem->startMin;
		rtime = mktime(&ltime) + (roffset * 60);
		if (rtime < atime)
			return false; //past date/time
		pItem->startTime = rtime;
		return true;
	}
	else if (pItem->timerType == TTYPE_BEFORESUNSET)
	{
		if (m_tSunSet==0)
			return false;
		rtime=m_tSunSet-HourMinuteOffset-(roffset*60);
	}
	else if (pItem->timerType == TTYPE_AFTERSUNSET)
	{
		if (m_tSunSet==0)
			return false;
		rtime=m_tSunSet+HourMinuteOffset+(roffset*60);
	}
	else if (pItem->timerType == TTYPE_BEFORESUNRISE)
	{
		if (m_tSunRise==0)
			return false;
		rtime=m_tSunRise-HourMinuteOffset-(roffset*60);
	}
	else if (pItem->timerType == TTYPE_AFTERSUNRISE)
	{
		if (m_tSunRise==0)
			return false;
		rtime=m_tSunRise+HourMinuteOffset+(roffset*60);
	}
	else
		return false; //unknown timer type

	if (bForceAddDay)
	{
		//item is scheduled for next day
		rtime+=(24*3600);
	}

	//Adjust timer by 1 day if we are in the past
	while (rtime<atime+60)
	{
		rtime+=(24*3600);
	}

	pItem->startTime=rtime;
	return true;
}

void CScheduler::Do_Work()
{
	while (!m_stoprequested)
	{
		//sleep 1 second
		sleep_seconds(1);

		time_t atime = mytime(NULL);
		struct tm ltime;
		localtime_r(&atime, &ltime);


		if (ltime.tm_sec % 12 == 0) {
			m_mainworker.HeartbeatUpdate("Scheduler");
		}

		CheckSchedules();
	}
	_log.Log(LOG_STATUS,"Scheduler stopped...");
}

void CScheduler::CheckSchedules()
{
	boost::lock_guard<boost::mutex> l(m_mutex);

	time_t atime=mytime(NULL);
	struct tm ltime;
	localtime_r(&atime,&ltime);

	std::vector<tScheduleItem>::iterator itt;
	for (itt=m_scheduleitems.begin(); itt!=m_scheduleitems.end(); ++itt)
	{
		if ((itt->bEnabled)&&(atime>itt->startTime))
		{
			//check if we are on a valid day
			bool bOkToFire = false;
			if (itt->timerType == TTYPE_FIXEDDATETIME)
			{
				bOkToFire = true;
			}
			else
			{
				if (itt->Days & 0x80)
				{
					//everyday
					bOkToFire = true;
				}
				else if (itt->Days & 0x100)
				{
					//weekdays
					if ((ltime.tm_wday > 0) && (ltime.tm_wday < 6))
						bOkToFire = true;
				}
				else if (itt->Days & 0x200)
				{
					//weekends
					if ((ltime.tm_wday == 0) || (ltime.tm_wday == 6))
						bOkToFire = true;
				}
				else
				{
					//custom days
					if ((itt->Days & 0x01) && (ltime.tm_wday == 1))
						bOkToFire = true;//Monday
					if ((itt->Days & 0x02) && (ltime.tm_wday == 2))
						bOkToFire = true;//Tuesday
					if ((itt->Days & 0x04) && (ltime.tm_wday == 3))
						bOkToFire = true;//Wednesday
					if ((itt->Days & 0x08) && (ltime.tm_wday == 4))
						bOkToFire = true;//Thursday
					if ((itt->Days & 0x10) && (ltime.tm_wday == 5))
						bOkToFire = true;//Friday
					if ((itt->Days & 0x20) && (ltime.tm_wday == 6))
						bOkToFire = true;//Saturday
					if ((itt->Days & 0x40) && (ltime.tm_wday == 0))
						bOkToFire = true;//Sunday
				}
			}
			if (bOkToFire)
			{
				if (itt->bIsScene==false)
					_log.Log(LOG_STATUS,"Schedule item started! Type: %s, DevID: %llu, Time: %s", Timer_Type_Desc(itt->timerType), itt->RowID, asctime(&ltime));
				else
					_log.Log(LOG_STATUS,"Schedule item started! Type: %s, SceneID: %llu, Time: %s", Timer_Type_Desc(itt->timerType), itt->RowID, asctime(&ltime));
				std::string switchcmd="";
				if (itt->timerCmd == TCMD_ON)
					switchcmd="On";
				else if (itt->timerCmd == TCMD_OFF)
					switchcmd="Off";
				if (switchcmd=="")
				{
					_log.Log(LOG_ERROR,"Unknown switch command in timer!!....");
				}
				else
				{
					if (itt->bIsScene==false)
					{
						//Get SwitchType
						std::vector<std::vector<std::string> > result;
						std::stringstream szQuery;
						szQuery << "SELECT Type,SubType,SwitchType FROM DeviceStatus WHERE (ID == " << itt->RowID << ")";
						result=m_sql.query(szQuery.str());
						if (result.size()>0)
						{
							std::vector<std::string> sd=result[0];

							unsigned char dType=atoi(sd[0].c_str());
							unsigned char dSubType=atoi(sd[1].c_str());
							_eSwitchType switchtype=(_eSwitchType) atoi(sd[2].c_str());
							std::string lstatus="";
							int llevel=0;
							bool bHaveDimmer=false;
							bool bHaveGroupCmd=false;
							int maxDimLevel=0;

							GetLightStatus(dType, dSubType, switchtype,0, "", lstatus, llevel, bHaveDimmer, maxDimLevel, bHaveGroupCmd);
							int ilevel=maxDimLevel;
							if (((switchtype == STYPE_Dimmer)||(switchtype == STYPE_BlindsPercentage))&&(maxDimLevel!=0))
							{
								if (itt->timerCmd == TCMD_ON)
								{
									switchcmd="Set Level";
									float fLevel=(maxDimLevel/100.0f)*itt->Level;
									if (fLevel>100)
										fLevel=100;
									ilevel=int(fLevel);
								}
							}
							if (!m_mainworker.SwitchLight(itt->RowID,switchcmd,ilevel, itt->Hue))
							{
								_log.Log(LOG_ERROR,"Error sending switch command, DevID: %llu, Time: %s", itt->RowID, asctime(&ltime));
							}
						}
					}
					else
					{
						if (!m_mainworker.SwitchScene(itt->RowID,switchcmd))
						{
							_log.Log(LOG_ERROR,"Error switching Scene command, SceneID: %llu, Time: %s", itt->RowID, asctime(&ltime));
						}
					}
				}
			}
			if (!AdjustScheduleItem(&*itt,true))
			{
				//something is wrong, probably no sunset/rise
				if (itt->timerType != TTYPE_FIXEDDATETIME)
				{
					itt->startTime += atime + (24 * 3600);
				}
				else {
					//Disable timer
					itt->bEnabled = false;
				}
			}
		}
	}
}
