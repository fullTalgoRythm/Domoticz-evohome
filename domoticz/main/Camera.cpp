#include "stdafx.h"
#include <iostream>
#include "Camera.h"
#include "mainworker.h"
#include "localtime_r.h"
#include "Logger.h"
#include "../httpclient/HTTPClient.h"
#include "../smtpclient/SMTPClient.h"
#include "../webserver/Base64.h"

#define CAMERA_POLL_INTERVAL 30

extern std::string szStartupFolder;

CCamScheduler::CCamScheduler(void)
{
	m_pMain=NULL;
	m_stoprequested=false;
	m_seconds_counter=0;
}

CCamScheduler::~CCamScheduler(void)
{
}

void CCamScheduler::SetMainWorker(MainWorker *pMainWorker)
{
	m_pMain=pMainWorker;
	ReloadCameras();
}

/*
void CCamScheduler::StartCameraGrabber(MainWorker *pMainWorker)
{
	m_seconds_counter=CAMERA_POLL_INTERVAL;
	m_thread = boost::shared_ptr<boost::thread>(new boost::thread(boost::bind(&CCamScheduler::Do_Work, this)));
}

void CCamScheduler::StopCameraGrabber()
{
	if (m_thread!=NULL)
	{
		m_stoprequested = true;
		m_thread->join();
	}
}
*/

std::vector<cameraDevice> CCamScheduler::GetCameraDevices()
{
	boost::lock_guard<boost::mutex> l(m_mutex);
	std::vector<cameraDevice> ret;

	std::vector<cameraDevice>::iterator itt;
	for (itt=m_cameradevices.begin(); itt!=m_cameradevices.end(); ++itt)
	{
		ret.push_back(*itt);
	}
	return ret;
}

void CCamScheduler::ReloadCameras()
{
	std::vector<std::string> _AddedCameras;
	if (m_pMain!=NULL)
	{
		boost::lock_guard<boost::mutex> l(m_mutex);
		m_cameradevices.clear();
		std::stringstream szQuery;
		std::vector<std::vector<std::string> > result;
		std::vector<std::vector<std::string> >::const_iterator itt;

		szQuery << "SELECT ID, Name, Address, Port, Username, Password, VideoURL, ImageURL FROM Cameras WHERE (Enabled == 1) ORDER BY ID";
		result=m_pMain->m_sql.query(szQuery.str());
		if (result.size()>0)
		{
			_log.Log(LOG_NORM,"Camera settings (re)loaded");
			for (itt=result.begin(); itt!=result.end(); ++itt)
			{
				std::vector<std::string> sd=*itt;

				cameraDevice citem;
				std::stringstream s_str( sd[0] );
				s_str >> citem.ID;
				citem.Name		= sd[1];
				citem.Address	= sd[2];
				citem.Port		= atoi(sd[3].c_str());
				citem.Username	= base64_decode(sd[4]);
				citem.Password	= base64_decode(sd[5]);
				citem.VideoURL	= sd[6];
				citem.ImageURL	= sd[7];
				m_cameradevices.push_back(citem);
				_AddedCameras.push_back(sd[0]);
			}
		}
	}
	std::vector<std::string>::const_iterator ittCam;
	for (ittCam=_AddedCameras.begin(); ittCam!=_AddedCameras.end(); ++ittCam)
	{
		//Get Active Devices/Scenes
		ReloadCameraActiveDevices(*ittCam);
	}
}

void CCamScheduler::ReloadCameraActiveDevices(const std::string &CamID)
{
	cameraDevice *pCamera=GetCamera(CamID);
	if (pCamera==NULL)
		return;
	pCamera->mActiveDevices.clear();
	std::vector<std::vector<std::string> > result;
	std::vector<std::vector<std::string> >::const_iterator itt;
	std::stringstream szQuery;

	szQuery.clear();
	szQuery.str("");
	szQuery << "SELECT ID, DevSceneType, DevSceneRowID FROM CamerasActiveDevices WHERE (CameraRowID=='" << CamID << "') ORDER BY ID";
	result=m_pMain->m_sql.query(szQuery.str());
	if (result.size()>0)
	{
		for (itt=result.begin(); itt!=result.end(); ++itt)
		{
			std::vector<std::string> sd=*itt;
			cameraActiveDevice aDevice;
			std::stringstream s_str( sd[0] );
			s_str >> aDevice.ID;
			aDevice.DevSceneType=(unsigned char)atoi(sd[1].c_str());
			std::stringstream s_str2( sd[2] );
			s_str2 >> aDevice.DevSceneRowID;
			pCamera->mActiveDevices.push_back(aDevice);
		}
	}
}

//Return 0 if NO, otherwise Cam IDX
unsigned long long CCamScheduler::IsDevSceneInCamera(const unsigned char DevSceneType, const std::string &DevSceneID)
{
	unsigned long long ulID;
	std::stringstream s_str( DevSceneID );
	s_str >> ulID;
	return IsDevSceneInCamera(DevSceneType,ulID);
}

unsigned long long CCamScheduler::IsDevSceneInCamera(const unsigned char DevSceneType, const unsigned long long DevSceneID)
{
	boost::lock_guard<boost::mutex> l(m_mutex);
	std::vector<cameraDevice>::iterator itt;
	for (itt=m_cameradevices.begin(); itt!=m_cameradevices.end(); ++itt)
	{
		cameraDevice *pCamera=&(*itt);
		std::vector<cameraActiveDevice>::iterator itt2;
		for (itt2=pCamera->mActiveDevices.begin(); itt2!=pCamera->mActiveDevices.end(); ++itt2)
		{
			if (
				(itt2->DevSceneType==DevSceneType)&&
				(itt2->DevSceneRowID==DevSceneID)
				)
				return itt->ID;
		}
	}
	return 0;
}

/*
void CCamScheduler::Do_Work()
{
	while (!m_stoprequested)
	{
		//sleep 1 second
		boost::this_thread::sleep(boost::posix_time::seconds(1));
		if (m_stoprequested)
			break;
		m_seconds_counter++;
		if (m_seconds_counter>=CAMERA_POLL_INTERVAL)
		{
			m_seconds_counter=0;
			CheckCameras();
		}
	}
	_log.Log(LOG_NORM,"Camera fetch stopped...");
}

void CCamScheduler::CheckCameras()
{
	boost::lock_guard<boost::mutex> l(m_mutex);

	time_t atime=mytime(NULL);
	struct tm ltime;
	localtime_r(&atime,&ltime);
    //_log.Log(LOG_NORM,"Camera tick");

}
*/

std::string CCamScheduler::GetCameraFeedURL(const std::string &CamID)
{
	cameraDevice* pCamera=GetCamera(CamID);
	if (pCamera==NULL)
		return "";
	std::string szURL=GetCameraURL(pCamera);
	return szURL+="/" + pCamera->VideoURL;
}

std::string CCamScheduler::GetCameraFeedURL(const unsigned long long CamID)
{
	cameraDevice* pCamera=GetCamera(CamID);
	if (pCamera==NULL)
		return "";
	std::string szURL=GetCameraURL(pCamera);
	return szURL+="/" + pCamera->VideoURL;
}


std::string CCamScheduler::GetCameraURL(const std::string &CamID)
{
	cameraDevice* pCamera=GetCamera(CamID);
	if (pCamera==NULL)
		return "";
	return GetCameraURL(pCamera);
}

std::string CCamScheduler::GetCameraURL(const unsigned long long CamID)
{
	cameraDevice* pCamera=GetCamera(CamID);
	if (pCamera==NULL)
		return "";
	return GetCameraURL(pCamera);
}

std::string CCamScheduler::GetCameraURL(cameraDevice *pCamera)
{
	std::stringstream s_str;
	if ((pCamera->Username!="")||(pCamera->Password!=""))
		s_str << "http://" << pCamera->Username << ":" << pCamera->Password << "@" << pCamera->Address << ":" << pCamera->Port;
	else
		s_str << "http://" << pCamera->Address << ":" << pCamera->Port;
	return s_str.str();
}

cameraDevice* CCamScheduler::GetCamera(const std::string &CamID)
{
	unsigned long long ulID;
	std::stringstream s_str( CamID );
	s_str >> ulID;
	return GetCamera(ulID);
}

cameraDevice* CCamScheduler::GetCamera(const unsigned long long CamID)
{
	boost::lock_guard<boost::mutex> l(m_mutex);
	std::vector<cameraDevice>::iterator itt;
	for (itt=m_cameradevices.begin(); itt!=m_cameradevices.end(); ++itt)
	{
		if (itt->ID==CamID)
			return &(*itt);
	}
	return NULL;
}

bool CCamScheduler::TakeSnapshot(const std::string &CamID, std::vector<unsigned char> &camimage)
{
	unsigned long long ulID;
	std::stringstream s_str( CamID );
	s_str >> ulID;
	return TakeSnapshot(ulID,camimage);
}

bool CCamScheduler::TakeRaspberrySnapshot(std::vector<unsigned char> &camimage)
{
	std::string raspparams="-w 800 -h 600 -t 0";
	m_pMain->m_sql.GetPreferencesVar("RaspCamParams", raspparams);

#ifdef WIN32
	//get our test image
	std::ifstream is("E:\\test.jpg", std::ios::in | std::ios::binary);
	if (is)
	{
		char buf[512];
		while (is.read(buf, sizeof(buf)).gcount() > 0)
			camimage.insert(camimage.end(),buf, buf+(unsigned int)is.gcount());
		is.close();
		return true;
	}
#else
	std::string OutputFileName=szStartupFolder + "tempcam.jpg";

	std::string raspistillcmd="raspistill " + raspparams + " -o " + OutputFileName;
	std::remove(OutputFileName.c_str());
	
	//Get our image
	system(raspistillcmd.c_str());
	//If all went correct, we should have our file
	std::ifstream is(OutputFileName.c_str(), std::ios::in | std::ios::binary);
	if (is)
	{
		char buf[512];
		while (is.read(buf, sizeof(buf)).gcount() > 0)
			camimage.insert(camimage.end(),buf, buf+(unsigned int)is.gcount());
		is.close();
		std::remove(OutputFileName.c_str());
		return true;
	}
#endif

	return false;
}

bool CCamScheduler::TakeUVCSnapshot(std::vector<unsigned char> &camimage)
{
#ifdef WIN32
	return false;
#endif
	std::string OutputFileName=szStartupFolder + "tempcam.jpg";
	std::string nvcmd="uvccapture -S80 -B128 -C128 -G80 -x800 -y600 -q100 -o" + OutputFileName;
	std::remove(OutputFileName.c_str());

	//Get our image
	system(nvcmd.c_str());
	//If all went correct, we should have our file
	std::ifstream is(OutputFileName.c_str(), std::ios::in | std::ios::binary);
	if (is)
	{
		char buf[512];
		while (is.read(buf, sizeof(buf)).gcount() > 0)
			camimage.insert(camimage.end(),buf, buf+(unsigned int)is.gcount());
		is.close();
		std::remove(OutputFileName.c_str());
		return true;
	}
	return false;
}

bool CCamScheduler::TakeSnapshot(const unsigned long long CamID, std::vector<unsigned char> &camimage)
{
	cameraDevice *pCamera=GetCamera(CamID);
	if (pCamera==NULL)
		return false;

	std::string szURL=GetCameraURL(pCamera);
	szURL+="/" + pCamera->ImageURL;

	if (pCamera->ImageURL=="raspberry.cgi")
		return TakeRaspberrySnapshot(camimage);
	else if (pCamera->ImageURL=="uvccapture.cgi")
		return TakeUVCSnapshot(camimage);
	
	return HTTPClient::GETBinary(szURL,camimage);
}

bool CCamScheduler::EmailCameraSnapshot(const std::string &CamIdx, const std::string &subject)
{
	if (m_pMain==NULL)
		return false;

	int nValue;
	std::string sValue;
	if (!m_pMain->m_sql.GetPreferencesVar("EmailServer",nValue,sValue))
	{
		return false;//no email setup
	}
	if (sValue=="")
	{
		return false;//no email setup
	}
	std::vector<unsigned char> camimage;
	if (CamIdx=="")
		return false;

	if (!TakeSnapshot(CamIdx, camimage))
		return false;

	std::string EmailFrom;
	std::string EmailTo;
	std::string EmailServer=sValue;
	int EmailPort=25;
	std::string EmailUsername;
	std::string EmailPassword;
	int EmailAsAttachment=0;
	m_pMain->m_sql.GetPreferencesVar("EmailFrom",nValue,EmailFrom);
	m_pMain->m_sql.GetPreferencesVar("EmailTo",nValue,EmailTo);
	m_pMain->m_sql.GetPreferencesVar("EmailUsername",nValue,EmailUsername);
	m_pMain->m_sql.GetPreferencesVar("EmailPassword",nValue,EmailPassword);
	m_pMain->m_sql.GetPreferencesVar("EmailPort", EmailPort);
	m_pMain->m_sql.GetPreferencesVar("EmailAsAttachment", EmailAsAttachment);

	std::vector<char> filedata;
	filedata.insert(filedata.begin(),camimage.begin(),camimage.end());
	std::string imgstring;
	imgstring.insert(imgstring.end(),filedata.begin(),filedata.end());
	imgstring=base64_encode((const unsigned char*)imgstring.c_str(),filedata.size());

	std::string htmlMsg=
		"<html>\r\n"
		"<body>\r\n"
		"<img src=\"data:image/jpeg;base64,";
	htmlMsg+=
		imgstring +
		"\">\r\n"
		"</body>\r\n"
		"</html>\r\n";

	SMTPClient sclient;
	sclient.SetFrom(CURLEncode::URLDecode(EmailFrom.c_str()));
	sclient.SetTo(CURLEncode::URLDecode(EmailTo.c_str()));
	sclient.SetCredentials(base64_decode(EmailUsername),base64_decode(EmailPassword));
	sclient.SetServer(CURLEncode::URLDecode(EmailServer.c_str()),EmailPort);
	sclient.SetSubject(CURLEncode::URLDecode(subject));

	if (EmailAsAttachment==0)
		sclient.SetHTMLBody(htmlMsg);
	else
		sclient.AddAttachment(imgstring,"snapshot.jpg");
	bool bRet=sclient.SendEmail();
	return bRet;
}
