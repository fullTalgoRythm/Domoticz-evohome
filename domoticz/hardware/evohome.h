#pragma once

#include "DomoticzHardware.h"
#include <iostream>

class CEvohome : public CDomoticzHardwareBase
{
public:
	CEvohome(const int ID);
	~CEvohome(void);
	void WriteToHardware(const char *pdata, const unsigned char length);
private:
	void Init();
	bool StartHardware();
	bool StopHardware();
};

