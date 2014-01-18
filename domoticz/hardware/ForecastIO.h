#pragma once

#include "DomoticzHardware.h"
#include <iostream>

class CForecastIO : public CDomoticzHardwareBase
{
public:
	CForecastIO(const int ID, const std::string APIKey, const std::string Location);
	~CForecastIO(void);
	void WriteToHardware(const char *pdata, const unsigned char length);
private:
	std::string m_APIKey;
	std::string m_Location;
	volatile bool m_stoprequested;
	unsigned char m_LastMinute;
	boost::shared_ptr<boost::thread> m_thread;

	void Init();
	bool StartHardware();
	bool StopHardware();
	void Do_Work();
	void GetMeterDetails();
};

