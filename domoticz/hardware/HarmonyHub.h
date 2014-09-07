#pragma once

#include "DomoticzHardware.h"
#include <iostream>
#include "hardwaretypes.h"
#include "../main/csocket.h"

class Action
{
public:
    std::string m_strCommand;
    std::string m_strName;
    std::string m_strLabel;
    std::string toString()
    {
        return m_strCommand;
    }
};


class Function
{
public:
    std::string m_strName;
    std::vector< Action > m_vecActions;
    std::string toString()
    {
        std::string ret = "    Function: ";
        ret.append(m_strName);
        ret.append("\n      Commands:");
        std::vector<Action>::iterator it = m_vecActions.begin();
        std::vector<Action>::iterator ite = m_vecActions.end();
        for(; it != ite; ++it)
        {
            ret.append("\n\t");
            ret.append(it->toString());
        }
        ret.append("\n");
        return ret;
    }
};

class Device
{
public:
    std::string m_strID;
    std::string m_strLabel;
    std::string m_strManufacturer;
    std::string m_strModel;
    std::string m_strType;
    std::vector< Function > m_vecFunctions;

    std::string toString()
    {
        std::string ret = m_strType;
        ret.append(": ");
        ret.append(m_strLabel);
        ret.append(" (ID = ");
        ret.append(m_strID);
        ret.append(")\n");
        ret.append(m_strManufacturer);
        ret.append(" - ");
        ret.append(m_strModel);
        ret.append("\nFunctions: \n");
        std::vector<Function>::iterator it = m_vecFunctions.begin();
        std::vector<Function>::iterator ite = m_vecFunctions.end();
        for(; it != ite; ++it)
        {
            ret.append(it->toString());
        }
        return ret;
    }
};

class CHarmonyHub : public CDomoticzHardwareBase
{
public:
	CHarmonyHub(const int ID, const std::string IPAddress, unsigned int port, const std::string userName, const std::string password);
	~CHarmonyHub(void);
	void WriteToHardware(const char *pdata, const unsigned char length);

private:
	
	std::string m_userName;
	std::string m_password;
	std::string m_harmonyAddress;
	std::string m_szAuthorizationToken;
	std::string m_szCurActivityID;
	boost::mutex m_mutex;

    csocket * m_commandcsocket;
	unsigned short m_usIPPort;
	unsigned short m_usCommandsMissed;
	volatile bool m_stoprequested;
	bool m_bDoLogin;
	bool m_bIsChangingActivity;
	boost::shared_ptr<boost::thread> m_thread;
	char m_databuffer[1000000];	
	std::string m_szResultString;


	bool Login();
	void Logout();
	bool SetupCommandSocket();
	bool UpdateActivities();
	bool UpdateCurrentActivity();
	void CheckSetActivity(std::string activityID, bool on);
	void UpdateSwitch(unsigned char idx, const char * szIdx, const bool bOn, const std::string &defaultname);
	
	void Init();
	bool StartHardware();
	bool StopHardware();
	void Do_Work();

	int HarmonyWebServiceLogin(std::string strUserEmail, std::string strPassword, std::string& m_szAuthorizationToken );
	int ConnectToHarmony(std::string strHarmonyIPAddress, int harmonyPortNumber, csocket* harmonyCommunicationcsocket);
	int StartCommunication(csocket* communicationcsocket, std::string strUserName, std::string strPassword);
	int SwapAuthorizationToken(csocket* authorizationcsocket, std::string& m_szAuthorizationToken);
	int SubmitCommand(csocket* m_commandcsocket, std::string& m_szAuthorizationToken, std::string strCommand, std::string strCommandParameterPrimary, std::string strCommandParameterSecondary);
	bool CheckIfChanging(const std::string& strData);
	int ParseAction(const std::string& strAction, std::vector<Action>& vecDeviceActions, const std::string& strDeviceID);
	int ParseFunction(const std::string& strFunction, std::vector<Function>& vecDeviceFunctions, const std::string& strDeviceID);
	int ParseControlGroup(const std::string& strControlGroup, std::vector<Function>& vecDeviceFunctions, const std::string& strDeviceID);
	int ParseConfiguration(const std::string& strConfiguration, std::map< std::string, std::string >& mapActivities, std::vector< Device >& vecDevices);

};
