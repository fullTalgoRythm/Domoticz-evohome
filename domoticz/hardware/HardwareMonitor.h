#pragma once
//#include "../main/RFXtrx.h" 
#include "DomoticzHardware.h"
#if defined WIN32 
	// for windows system info
	#include <wbemidl.h>
	#pragma comment(lib, "wbemuuid.lib")
#endif

class CHardwareMonitor : public CDomoticzHardwareBase
{
public:
	CHardwareMonitor(void);
	~CHardwareMonitor(void);
	void StartHardwareMonitor();
	void StopHardwareMonitor();
	void WriteToHardware(const char *pdata, const unsigned char length) {};
private:
	bool m_bEnabled;
	int hwId;
	double m_lastquerytime;
	void Do_Work();	
	volatile bool m_stoprequested;
	boost::shared_ptr<boost::thread> m_thread;
	void Init();
	void FetchData();
	void UpdateSystemSensor(const std::string& qType, const std::string& wmiId, const std::string& devName, const std::string& devValue);
	bool StartHardware() { return true; };
	bool StopHardware() { return true; };
#ifdef WIN32
	void InitWMI();
	void ExitWMI();
	bool IsOHMRunning();
	void RunWMIQuery(const char* qTable, const char* qType);
	IWbemLocator *pLocator; 
	IWbemServices *pServicesOHM;
	IWbemServices *pServicesSystem;
#elif defined __linux__
	void FetchUnixData();
	long long m_lastloadcpu;
	int m_totcpu;
#endif
};

