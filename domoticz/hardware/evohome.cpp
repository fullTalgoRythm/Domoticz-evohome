#include "stdafx.h"
#include "evohome.h"

CEvohome::CEvohome(const int ID)
{
	m_HwdID=ID;
	m_bSkipReceiveCheck = true;
}

CEvohome::~CEvohome(void)
{
	m_bIsStarted=false;
}

void CEvohome::Init()
{
}

bool CEvohome::StartHardware()
{
	Init();
	m_bIsStarted=true;
	sOnConnected(this);
	return true;
}

bool CEvohome::StopHardware()
{
	m_bIsStarted=false;
	return true;
}

void CEvohome::WriteToHardware(const char *pdata, const unsigned char length)
{

}

