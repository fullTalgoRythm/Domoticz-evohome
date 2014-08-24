#include "stdafx.h"
#include "RFXNames.h"
#include "RFXtrx.h"
#include "../hardware/hardwaretypes.h"

typedef struct _STR_TABLE_SINGLE {
	unsigned long    id;
	const char   *str1;
	const char   *str2;
} STR_TABLE_SINGLE;

typedef struct _STR_TABLE_ID1_ID2 {
	unsigned long    id1;
	unsigned long    id2;
	const char   *str1;
} STR_TABLE_ID1_ID2;

const char *findTableIDSingle1 (STR_TABLE_SINGLE *t, unsigned long id)
{
	while (t->str1) {
		if (t->id == id)
			return t->str1;
		t++;
	}
	return "Unknown";
} 

const char *findTableIDSingle2 (STR_TABLE_SINGLE *t, unsigned long id)
{
	while (t->str2) {
		if (t->id == id)
			return t->str2;
		t++;
	}
	return "Unknown";
} 

const char *findTableID1ID2 (_STR_TABLE_ID1_ID2 *t, unsigned long id1, unsigned long id2)
{
	while (t->str1) {
		if ( (t->id1 == id1) && (t->id2 == id2) )
			return t->str1;
		t++;
	}
	return "Unknown";
}

const char *RFX_Humidity_Status_Desc(const unsigned char status)
{
	STR_TABLE_SINGLE	Table[] = 
	{
		{ humstat_normal, "Normal" },
		{ humstat_comfort, "Comfortable" },
		{ humstat_dry, "Dry" },
		{ humstat_wet, "Wet" },
		{  0,NULL,NULL }
	};
	return findTableIDSingle1 (Table, status);
}

unsigned char Get_Humidity_Level(const unsigned char hlevel)
{
	if (hlevel<25)
		return humstat_dry;
	if (hlevel>60)
		return humstat_wet;
	if ((hlevel>=25)&&(hlevel<=60))
		return humstat_comfort;
	return humstat_normal;
}

const char *Security_Status_Desc(const unsigned char status)
{
	STR_TABLE_SINGLE	Table[] = 
	{
		{ sStatusNormal, "Normal" },
		{ sStatusNormalDelayed, "Normal Delayed" },
		{ sStatusAlarm, "Alarm" },
		{ sStatusAlarmDelayed, "Alarm Delayed" },
		{ sStatusMotion, "Motion" },
		{ sStatusNoMotion, "No Motion" },
		{ sStatusPanic, "Panic" },
		{ sStatusPanicOff, "Panic End" },
		{ sStatusArmAway, "Arm Away" },
		{ sStatusArmAwayDelayed, "Arm Away Delayed" },
		{ sStatusArmHome, "Arm Home" },
		{ sStatusArmHomeDelayed, "Arm Home Delayed" },
		{ sStatusDisarm, "Disarm" },
		{ sStatusLightOff, "Light Off" },
		{ sStatusLightOn, "Light On" },
		{ sStatusLight2Off, "Light 2 Off" },
		{ sStatusLight2On, "Light 2 On" },
		{ sStatusDark, "Dark detected" },
		{ sStatusLight, "Light Detected" },
		{ sStatusBatLow, "Battery low MS10 or XX18 sensor" },
		{ sStatusPairKD101, "Pair KD101" },
		{ sStatusNormalTamper, "Normal + Tamper" },
		{ sStatusNormalDelayedTamper, "Normal Delayed + Tamper" },
		{ sStatusAlarmTamper, "Alarm + Tamper" },
		{ sStatusAlarmDelayedTamper, "Alarm Delayed + Tamper" },
		{ sStatusMotionTamper, "Motion + Tamper" },
		{ sStatusNoMotionTamper, "No Motion + Tamper" },
		{ 0, NULL }
	};
	return findTableIDSingle1 (Table, status);
}

const char *Timer_Type_Desc(int tType)
{
	STR_TABLE_SINGLE	Table[] = 
	{
		{ TTYPE_BEFORESUNRISE, "Before Sunrise" },
		{ TTYPE_AFTERSUNRISE, "After Sunrise" },
		{ TTYPE_ONTIME, "On Time" },
		{ TTYPE_BEFORESUNSET, "Before Sunset" },
		{ TTYPE_AFTERSUNSET, "After Sunset" },
		{ TTYPE_FIXEDDATETIME, "Fixed Date/Time" },
		{  0,NULL,NULL }
	};
	return findTableIDSingle1 (Table, tType);
}

const char *Timer_Cmd_Desc(int tType)
{
	STR_TABLE_SINGLE	Table[] = 
	{
		{ TCMD_ON, "On" },
		{ TCMD_OFF, "Off" },
		{  0,NULL,NULL }
	};
	return findTableIDSingle1 (Table, tType);
}

const char *Hardware_Type_Desc(int hType)
{
	STR_TABLE_SINGLE	Table[] = 
	{
		{ HTYPE_RFXtrx315, "RFXCOM - RFXtrx315 USB 315MHz Transceiver" },
		{ HTYPE_RFXtrx433, "RFXCOM - RFXtrx433 USB 433.92MHz Transceiver" },
		{ HTYPE_RFXLAN, "RFXCOM - RFXtrx shared over LAN interface" },
		{ HTYPE_Domoticz, "Domoticz - Remote Server" },
		{ HTYPE_P1SmartMeter, "P1 Smart Meter USB" },
		{ HTYPE_P1SmartMeterLAN, "P1 Smart Meter with LAN interface" },
		{ HTYPE_YouLess, "YouLess Meter with LAN interface" },
		{ HTYPE_TE923, "TE923 USB Compatible Weather Station" },
		{ HTYPE_Rego6XX, "Rego 6XX USB/serial interface" },
		{ HTYPE_RazberryZWave, "Razberry Z-Wave via LAN interface (HTTP)" },
		{ HTYPE_DavisVantage, "Davis Vantage Weather Station USB" },
		{ HTYPE_VOLCRAFTCO20, "Volcraft CO-20 USB air quality sensor" },
		{ HTYPE_1WIRE, "1-Wire (System)" },
		{ HTYPE_RaspberryBMP085, "BMP085 Temp+Baro I2C sensor" },
		{ HTYPE_Wunderground, "Weather Underground" },
		{ HTYPE_ForecastIO, "Forecast IO (Weather Lookup)" },
		{ HTYPE_Dummy, "Dummy (Does nothing, use for virtual switches only)" },
		{ HTYPE_PiFace, "PiFace - Raspberry Pi IO expansion board" },
		{ HTYPE_S0SmartMeter, "S0 Meter USB" },
		{ HTYPE_OpenThermGateway, "OpenTherm Gateway USB" },
		{ HTYPE_TeleinfoMeter, "Teleinfo EDF USB" },
		{ HTYPE_OpenThermGatewayTCP, "OpenTherm Gateway with LAN interface" },
		{ HTYPE_OpenZWave, "OpenZWave USB" },
		{ HTYPE_LimitlessLights, "Limitless/AppLamp with LAN interface" },
		{ HTYPE_System, "Motherboard sensors" },
		{ HTYPE_EnOceanESP2, "EnOcean USB (ESP2)" },
		{ HTYPE_SolarEdgeTCP, "SolarEdge via LAN interface" },
		{ HTYPE_SMASpot, "SMASpot" },
		{ HTYPE_ICYTHERMOSTAT, "ICY Thermostat" },
		{ HTYPE_WOL, "Wake-on-LAN" },
		{ HTYPE_PVOUTPUT_INPUT, "PVOutput (Input)" },
		{ HTYPE_EnOceanESP3, "EnOcean USB (ESP3)" },
		{ HTYPE_RaspberryGPIO, "Raspberry's GPIO port" },
		{ HTYPE_Meteostick, "Meteostick USB" },
		{ HTYPE_TOONTHERMOSTAT, "Toon Thermostat" },
		{ HTYPE_ECODEVICES, "Eco Devices via LAN interface" },
		{ 0, NULL, NULL }
	};
	return findTableIDSingle1 (Table, hType);
}

const char *Switch_Type_Desc(const _eSwitchType sType)
{
	STR_TABLE_SINGLE	Table[] = 
	{
		{ STYPE_OnOff, "On/Off" },
		{ STYPE_Doorbell, "Doorbell" },
		{ STYPE_Contact, "Contact" },
		{ STYPE_Blinds, "Blinds" },
		{ STYPE_X10Siren, "X10 Siren" },
		{ STYPE_SMOKEDETECTOR, "Smoke Detector" },
        { STYPE_BlindsInverted, "Blinds Inverted" },
		{ STYPE_Dimmer, "Dimmer" },
		{ STYPE_Motion, "Motion Sensor" },
		{ STYPE_PushOn, "Push On Button" },
		{ STYPE_PushOff, "Push Off Button" },
		{ STYPE_DoorLock, "Door Lock" },
        { STYPE_Dusk, "Dusk Sensor" },
		{ STYPE_BlindsPercentage, "Blinds Percentage" },
		{ STYPE_VenetianBlindsUS, "Venetian Blinds US" },
		{ STYPE_VenetianBlindsEU, "Venetian Blinds EU" },
		{ 0, NULL, NULL }
	};
	return findTableIDSingle1 (Table, sType);
}

const char *Meter_Type_Desc(const _eMeterType sType)
{
	STR_TABLE_SINGLE	Table[] = 
	{
		{ MTYPE_ENERGY, "Energy" },
		{ MTYPE_GAS, "Gas" },
		{ MTYPE_WATER, "Water" },
		{ MTYPE_COUNTER, "Counter" },
		{  0,NULL,NULL }
	};
	return findTableIDSingle1 (Table, sType);
}

const char *Notification_Type_Desc(const int nType, const unsigned char snum)
{
	STR_TABLE_SINGLE	Table[] = 
	{
		{ NTYPE_TEMPERATURE, "Temperature","T" },
		{ NTYPE_HUMIDITY, "Humidity","H" },
		{ NTYPE_RAIN, "Rain","R" },
		{ NTYPE_UV, "UV","U" },
		{ NTYPE_WIND, "Wind","W" },
		{ NTYPE_USAGE, "Usage","M" },
		{ NTYPE_BARO, "Baro","B" },
		{ NTYPE_SWITCH_ON, "Switch On", "S" },
		{ NTYPE_AMPERE1, "Ampere 1", "1" },
		{ NTYPE_AMPERE2, "Ampere 2", "2" },
		{ NTYPE_AMPERE3, "Ampere 3", "3" },
		{ NTYPE_ENERGYINSTANT, "Instant", "I" },
		{ NTYPE_TODAYENERGY, "Today", "E" },
		{ NTYPE_TODAYGAS, "Today", "G" },
		{ NTYPE_TODAYCOUNTER, "Today", "C" },
		{ NTYPE_SWITCH_OFF, "Switch Off", "O" },
		{ NTYPE_PERCENTAGE, "Percentage", "P" },
		{ NTYPE_RPM, "RPM", "Z" },
		{ NTYPE_DEWPOINT, "Dew Point", "D" },
		
		{  0,NULL,NULL }
	};
	if (snum==0)
		return findTableIDSingle1 (Table, nType);
	else
		return findTableIDSingle2 (Table, nType);
}

const char *Notification_Type_Label(const int nType)
{
	STR_TABLE_SINGLE	Table[] = 
	{
		{ NTYPE_TEMPERATURE, "degrees" },
		{ NTYPE_HUMIDITY, "%%" },
		{ NTYPE_RAIN, "mm" },
		{ NTYPE_UV, "UVI" },
		{ NTYPE_WIND, "m/s" },
		{ NTYPE_USAGE, "" },
		{ NTYPE_BARO, "hPa" },
		{ NTYPE_SWITCH_ON, "" },
		{ NTYPE_AMPERE1, "Ampere"},
		{ NTYPE_AMPERE2, "Ampere"},
		{ NTYPE_AMPERE3, "Ampere" },
		{ NTYPE_ENERGYINSTANT, "Watt" },
		{ NTYPE_TODAYENERGY, "kWh" },
		{ NTYPE_TODAYGAS, "m3" },
		{ NTYPE_TODAYCOUNTER, "cnt" },
		{ NTYPE_SWITCH_OFF, "On" },
		{ NTYPE_PERCENTAGE, "%%" },
		{ NTYPE_DEWPOINT, "degrees" },
		{ NTYPE_RPM, "RPM" },
		{  0,NULL,NULL }
	};
	return findTableIDSingle1 (Table, nType);
}

const char *RFX_Forecast_Desc(const unsigned char Forecast)
{
	STR_TABLE_SINGLE	Table[] = 
	{
		{ baroForecastNoInfo, "No Info" },
		{ baroForecastSunny, "Sunny" },
		{ baroForecastPartlyCloudy, "Partly Cloudy" },
		{ baroForecastCloudy, "Cloudy" },
		{ baroForecastRain, "Rain" },
		{  0,NULL,NULL }
	};
	return findTableIDSingle1 (Table, Forecast);
}

const char *RFX_WSForecast_Desc(const unsigned char Forecast)
{
	STR_TABLE_SINGLE	Table[] = 
	{
		{ wsbaroforcast_heavy_snow,"Heavy Snow" },
		{ wsbaroforcast_snow, "Snow" },
		{ wsbaroforcast_heavy_rain, "Heavy Rain" },
		{ wsbaroforcast_rain, "Rain" },
		{ wsbaroforcast_cloudy, "Cloudy" },
		{ wsbaroforcast_some_clouds, "Some Clouds" },
		{ wsbaroforcast_sunny, "Sunny" },
		{  0,NULL,NULL }
	};
	return findTableIDSingle1 (Table, Forecast);
}

const char *RFX_Type_Desc(const unsigned char i, const unsigned char snum)
{
	STR_TABLE_SINGLE	Table[] = 
	{
		{ pTypeInterfaceControl, "Interface Control", "unknown" },
		{ pTypeInterfaceMessage, "Interface Message", "unknown" },
		{ pTypeRecXmitMessage, "Receiver/Transmitter Message", "unknown" },
		{ pTypeUndecoded, "Undecoded RF Message", "unknown" },
		{ pTypeLighting1, "Lighting 1" , "lightbulb", },
		{ pTypeLighting2, "Lighting 2" , "lightbulb", },
		{ pTypeLighting3, "Lighting 3" , "lightbulb", },
		{ pTypeLighting4, "Lighting 4" , "lightbulb", },
		{ pTypeLighting5, "Lighting 5" , "lightbulb", },
		{ pTypeLighting6, "Lighting 6" , "lightbulb", },
		{ pTypeLimitlessLights, "Lighting Limitless/Applamp" , "lightbulb" },
		{ pTypeCurtain, "Curtain" , "blinds" },
		{ pTypeBlinds, "Blinds" , "blinds" },
		{ pTypeSecurity1, "Security" , "security" },
		{ pTypeCamera, "Camera" , "unknown" },
		{ pTypeRemote, "Remote & IR" , "unknown" },
		{ pTypeThermostat1, "Thermostat 1" , "temperature" },
		{ pTypeThermostat2, "Thermostat 2" , "temperature" },
		{ pTypeThermostat3, "Thermostat 3" , "temperature" },
		{ pTypeTEMP, "Temp" , "temperature" },
		{ pTypeHUM, "Humidity" , "temperature" },
		{ pTypeTEMP_HUM, "Temp + Humidity" , "temperature" },
		{ pTypeBARO, "Barometric" , "temperature" },
		{ pTypeTEMP_HUM_BARO, "Temp + Humidity + Baro" , "temperature" },
		{ pTypeRAIN, "Rain" , "rain" },
		{ pTypeWIND, "Wind" , "wind" },
		{ pTypeUV, "UV" , "uv" },
		{ pTypeDT, "Date/Time" , "unknown" },
		{ pTypeCURRENT, "Current" , "current" },
		{ pTypeENERGY, "Energy" , "current" },
		{ pTypeCURRENTENERGY, "Current/Energy" , "current" },
		{ pTypeGAS, "Gas" , "counter" },
		{ pTypeWATER, "Water" , "counter" },
		{ pTypeWEIGHT, "Weight" , "scale" },
		{ pTypeRFXSensor, "RFXSensor" , "unknown" },
		{ pTypeRFXMeter, "RFXMeter" , "counter" },
		{ pTypeP1Power, "P1 Smart Meter" , "counter" },
		{ pTypeP1Gas, "P1 Smart Meter" , "counter" },
		{ pTypeYouLess, "YouLess Meter", "counter" },
		{ pTypeFS20, "FS20" , "unknown" },
		{ pTypeRego6XXTemp, "Temp" , "temperature" },
		{ pTypeRego6XXValue, "Value" , "utility" },
		{ pTypeAirQuality, "Air Quality" , "air" },
		{ pTypeUsage, "Usage" , "current" },
		{ pTypeTEMP_BARO, "Temp + Baro" , "temperature" },
		{ pTypeLux, "Lux" , "lux" },
		{ pTypeGeneral, "General" , "General" },
		{ pTypeThermostat, "Thermostat" , "thermostat" },
		{ pTypeTEMP_RAIN, "Temp + Rain" , "Temp + Rain" },
		{ pTypeChime, "Chime" , "doorbell" },
		{ pTypeBBQ, "BBQ Meter", "bbq" },
		{ pTypePOWER, "Current/Energy" , "current" },
		{ pTypeRFY, "RFY" , "blinds" },
		{  0,NULL,NULL }
	};
	if (snum==1)
		return findTableIDSingle1 (Table, i);

	return findTableIDSingle2 (Table, i);
}

const char *RFX_Type_SubType_Desc(const unsigned char dType, const unsigned char sType)
{
	STR_TABLE_ID1_ID2	Table[] = 
	{
		{ pTypeTEMP, sTypeTEMP1, "THR128/138, THC138" },
		{ pTypeTEMP, sTypeTEMP2, "THC238/268, THN132, THWR288, THRN122, THN122, AW129/131" },
		{ pTypeTEMP, sTypeTEMP3, "THWR800" },
		{ pTypeTEMP, sTypeTEMP4, "RTHN318" },
		{ pTypeTEMP, sTypeTEMP5, "LaCrosse TX3" },
		{ pTypeTEMP, sTypeTEMP6, "TS15C" },
		{ pTypeTEMP, sTypeTEMP7, "Viking 02811" },
		{ pTypeTEMP, sTypeTEMP8, "LaCrosse WS2300" },
		{ pTypeTEMP, sTypeTEMP9, "RUBiCSON" },
		{ pTypeTEMP, sTypeTEMP10, "TFA 30.3133" },
		{ pTypeTEMP, sTypeTEMP_SYSTEM, "System" },
		
		{ pTypeHUM, sTypeHUM1, "LaCrosse TX3" },
		{ pTypeHUM, sTypeHUM2, "LaCrosse WS2300" },

		{ pTypeTEMP_HUM, sTypeTH1, "THGN122/123, THGN132, THGR122/228/238/268" },
		{ pTypeTEMP_HUM, sTypeTH2, "THGR810, THGN800" },
		{ pTypeTEMP_HUM, sTypeTH3, "RTGR328" },
		{ pTypeTEMP_HUM, sTypeTH4, "THGR328" },
		{ pTypeTEMP_HUM, sTypeTH5, "WTGR800" },
		{ pTypeTEMP_HUM, sTypeTH6, "THGR918, THGRN228, THGN500" },
		{ pTypeTEMP_HUM, sTypeTH7, "Cresta, TFA TS34C" },
		{ pTypeTEMP_HUM, sTypeTH8, "WT450H" },
		{ pTypeTEMP_HUM, sTypeTH9, "Viking 02035, 02038" },
		{ pTypeTEMP_HUM, sTypeTH10, "Rubicson/IW008T/TX95" },
		{ pTypeTEMP_HUM, sTypeTH11, "Oregon EW109" },
		{ pTypeTEMP_HUM, sTypeTH12, "Imagintronix" },
		{ pTypeTEMP_HUM, sTypeTH_LC_TC, "LaCrosse TX3" },
		

		{ pTypeTEMP_HUM_BARO, sTypeTHB1, "THB1 - BTHR918" },
		{ pTypeTEMP_HUM_BARO, sTypeTHB2, "THB2 - BTHR918N, BTHR968" },
		{ pTypeTEMP_HUM_BARO, sTypeTHBFloat, "Weather Station" },

		{ pTypeRAIN, sTypeRAIN1, "RGR126/682/918/928" },
		{ pTypeRAIN, sTypeRAIN2, "PCR800" },
		{ pTypeRAIN, sTypeRAIN3, "TFA" },
		{ pTypeRAIN, sTypeRAIN4, "UPM RG700" },
		{ pTypeRAIN, sTypeRAIN5, "LaCrosse WS2300" },
		{ pTypeRAIN, sTypeRAIN6, "LaCrosse TX5" },
		{ pTypeRAIN, sTypeRAINWU, "WWW" },

		{ pTypeWIND, sTypeWIND1, "WTGR800" },
		{ pTypeWIND, sTypeWIND2, "WGR800" },
		{ pTypeWIND, sTypeWIND3, "STR918/928, WGR918" },
		{ pTypeWIND, sTypeWIND4, "TFA" },
		{ pTypeWIND, sTypeWIND5, "UPM WDS500" },
		{ pTypeWIND, sTypeWIND6, "LaCrosse WS2300" },
		{ pTypeWIND, sTypeWINDNoTemp, "Weather Station" },

		{ pTypeUV, sTypeUV1, "UVN128,UV138" },
		{ pTypeUV, sTypeUV2, "UVN800" },
		{ pTypeUV, sTypeUV3, "TFA" },

		{ pTypeLighting1, sTypeX10, "X10" },
		{ pTypeLighting1, sTypeARC, "ARC" },
		{ pTypeLighting1, sTypeAB400D, "ELRO AB400" },
		{ pTypeLighting1, sTypeWaveman, "Waveman" },
		{ pTypeLighting1, sTypeEMW200, "EMW200" },
		{ pTypeLighting1, sTypeIMPULS, "Impuls" },
		{ pTypeLighting1, sTypeRisingSun, "RisingSun" },
		{ pTypeLighting1, sTypePhilips, "Philips" },
		{ pTypeLighting1, sTypeEnergenie, "Energenie" },
		{ pTypeLighting1, sTypeEnergenie5, "Energenie 5-gang" },
		{ pTypeLighting1, sTypeGDR2, "COCO GDR2" },
		

		{ pTypeLighting2, sTypeAC, "AC" },
		{ pTypeLighting2, sTypeHEU, "HomeEasy EU" },
		{ pTypeLighting2, sTypeANSLUT, "Anslut" },

		{ pTypeLighting3, sTypeKoppla, "Ikea Koppla" },

		{ pTypeLighting4, sTypePT2262, "PT2262" },

		{ pTypeLighting5, sTypeLightwaveRF, "LightwaveRF" },
		{ pTypeLighting5, sTypeEMW100, "EMW100" },
		{ pTypeLighting5, sTypeBBSB, "BBSB new" },
		{ pTypeLighting5, sTypeMDREMOTE, "MDRemote" },
		{ pTypeLighting5, sTypeRSL, "Conrad RSL" },
		{ pTypeLighting5, sTypeLivolo, "Livolo" },
		{ pTypeLighting5, sTypeTRC02, "TRC02 (RGB)" },
		{ pTypeLighting5, sTypeAoke, "Aoke" },


		{ pTypeLighting6, sTypeBlyss, "Blyss" },

		{ pTypeCurtain, sTypeHarrison, "Harrison" },

		{ pTypeBlinds, sTypeBlindsT0, "RollerTrol, Hasta new" },
		{ pTypeBlinds, sTypeBlindsT1, "Hasta old" },
		{ pTypeBlinds, sTypeBlindsT2, "A-OK RF01" },
		{ pTypeBlinds, sTypeBlindsT3, "A-OK AC114" },
		{ pTypeBlinds, sTypeBlindsT4, "RAEX" },
		{ pTypeBlinds, sTypeBlindsT5, "Media Mount" },
		{ pTypeBlinds, sTypeBlindsT6, "DC106, YOOHA, Rohrmotor24 RMF" },
		{ pTypeBlinds, sTypeBlindsT7, "Forest" },

		{ pTypeSecurity1, sTypeSecX10, "X10 security" },
		{ pTypeSecurity1, sTypeSecX10M, "X10 security motion" },
		{ pTypeSecurity1, sTypeSecX10R, "X10 security remote" },
		{ pTypeSecurity1, sTypeKD101, "KD101 smoke detector" },
		{ pTypeSecurity1, sTypePowercodeSensor, "Visonic PowerCode sensor - primary contact" },
		{ pTypeSecurity1, sTypePowercodeMotion, "Visonic PowerCode motion" },
		{ pTypeSecurity1, sTypeCodesecure, "Visonic CodeSecure" },
		{ pTypeSecurity1, sTypePowercodeAux, "Visonic PowerCode sensor - auxiliary contact" },
		{ pTypeSecurity1, sTypeMeiantech, "Meiantech/Atlantic/Aidebao" },
		{ pTypeSecurity1, sTypeSA30, "Alecto SA30 smoke detector" },
		{ pTypeSecurity1, sTypeDomoticzSecurity, "Security Panel" },
		
		{ pTypeCamera, sTypeNinja, "Meiantech" },

		{ pTypeRemote, sTypeATI, "ATI Remote Wonder" },
		{ pTypeRemote, sTypeATIplus, "ATI Remote Wonder Plus" },
		{ pTypeRemote, sTypeMedion, "Medion Remote" },
		{ pTypeRemote, sTypePCremote, "PC Remote" },
		{ pTypeRemote, sTypeATIrw2, "ATI Remote Wonder II" },
		
		{ pTypeThermostat1, sTypeDigimax, "Digimax" },
		{ pTypeThermostat1, sTypeDigimaxShort, "Digimax with short format" },

		{ pTypeThermostat2, sTypeHE105, "HE105" },
		{ pTypeThermostat2, sTypeRTS10, "RTS10" },

		{ pTypeThermostat3, sTypeMertikG6RH4T1, "Mertik G6R-H4T1" },
		{ pTypeThermostat3, sTypeMertikG6RH4TB, "Mertik G6R-H4TB" },

		{ pTypeDT, sTypeDT1, "RTGR328N" },

		{ pTypeCURRENT, sTypeELEC1, "CM113, Electrisave" },
		
		{ pTypeENERGY, sTypeELEC2, "CM119 / CM160" },
		{ pTypeENERGY, sTypeELEC3, "CM180" },
		{ pTypeENERGY, sTypeZWaveUsage, "ZWave Usage" },

		{ pTypeCURRENTENERGY, sTypeELEC4, "CM180i" },
		
		{ pTypeWEIGHT, sTypeWEIGHT1, "BWR102" },
		{ pTypeWEIGHT, sTypeWEIGHT2, "GR101" },
		
		{ pTypeRFXSensor, sTypeRFXSensorTemp, "Temperature" },
		{ pTypeRFXSensor, sTypeRFXSensorAD, "A/D" },
		{ pTypeRFXSensor, sTypeRFXSensorVolt, "Voltage" },

		{ pTypeRFXMeter, sTypeRFXMeterCount, "RFXMeter counter" },
		
		{ pTypeP1Power, sTypeP1Power, "Energy" },
		{ pTypeP1Gas, sTypeP1Gas, "Gas" },

		{ pTypeYouLess, sTypeYouLess, "YouLess counter" },

		{ pTypeRego6XXTemp, sTypeRego6XXTemp, "Rego 6XX" },
		{ pTypeRego6XXValue, sTypeRego6XXStatus, "Rego 6XX" },
		{ pTypeRego6XXValue, sTypeRego6XXCounter, "Rego 6XX" },

		{ pTypeAirQuality, sTypeVoltcraft, "Voltcraft CO-20" },

		{ pTypeUsage, sTypeElectric, "Electric" },

		{ pTypeTEMP_BARO, sTypeBMP085, "BMP085 I2C" },
		
		{ pTypeLux, sTypeLux, "Lux" },

		{ pTypeGeneral, sTypeVisibility, "Visibility" },
		{ pTypeGeneral, sTypeSolarRadiation, "Solar Radiation" },
		{ pTypeGeneral, sTypeSoilMoisture, "Soil Moisture" },
		{ pTypeGeneral, sTypeLeafWetness, "Leaf Wetness" },
		{ pTypeGeneral, sTypeSystemTemp, "System temperature" },
		{ pTypeGeneral, sTypePercentage, "Percentage" },
		{ pTypeGeneral, sTypeSystemFan, "System fan" },
		{ pTypeGeneral, sTypeVoltage, "Voltage" },
		{ pTypeGeneral, sTypePressure, "Pressure" },
		
		{ pTypeThermostat, sTypeThermSetpoint, "SetPoint" },
		{ pTypeThermostat, sTypeThermTemperature, "Temperature" },

		{ pTypeChime, sTypeByronSX, "ByronSX" },
		{ pTypeTEMP_RAIN, sTypeTR1, "Alecto WS1200" },

		{ pTypeBBQ, sTypeBBQ1, "Maverick ET-732" },

		{ pTypePOWER, sTypeELEC5, "Revolt" },
		
		{ pTypeLimitlessLights, sTypeLimitlessRGBW, "RGBW" },
		{ pTypeLimitlessLights, sTypeLimitlessRGB, "RGB" },
		{ pTypeLimitlessLights, sTypeLimitlessWhite, "White" },
	
		{ pTypeRFY, sTypeRFY, "RFY" },
		{ pTypeRFY, sTypeRFYext, "RFY-Ext" },

		{  0,0,NULL }
	};
	return findTableID1ID2(Table, dType, sType);
}

const char *RFX_Type_SubType_Values(const unsigned char dType, const unsigned char sType)
{
	STR_TABLE_ID1_ID2	Table[] = 
	{
		{ pTypeTEMP, sTypeTEMP1, "Temperature" },
		{ pTypeTEMP, sTypeTEMP2, "Temperature" },
		{ pTypeTEMP, sTypeTEMP3, "Temperature" },
		{ pTypeTEMP, sTypeTEMP4, "Temperature" },
		{ pTypeTEMP, sTypeTEMP5, "Temperature,Humidity,Humidity Status" },
		{ pTypeTEMP, sTypeTEMP6, "Temperature" },
		{ pTypeTEMP, sTypeTEMP7, "Temperature" },
		{ pTypeTEMP, sTypeTEMP8, "Temperature" },
		{ pTypeTEMP, sTypeTEMP9, "Temperature" },
		{ pTypeTEMP, sTypeTEMP10, "Temperature" },
		{ pTypeTEMP, sTypeTEMP_SYSTEM, "Temperature" },
		
		{ pTypeHUM, sTypeHUM1, "Temperature,Humidity,Humidity Status" },
		{ pTypeHUM, sTypeHUM2, "Humidity" },

		{ pTypeTEMP_HUM, sTypeTH1, "Temperature,Humidity,Humidity Status" },
		{ pTypeTEMP_HUM, sTypeTH2, "Temperature,Humidity,Humidity Status" },
		{ pTypeTEMP_HUM, sTypeTH3, "Temperature,Humidity,Humidity Status" },
		{ pTypeTEMP_HUM, sTypeTH4, "Temperature,Humidity,Humidity Status" },
		{ pTypeTEMP_HUM, sTypeTH5, "Temperature,Humidity,Humidity Status" },
		{ pTypeTEMP_HUM, sTypeTH6, "Temperature,Humidity,Humidity Status" },
		{ pTypeTEMP_HUM, sTypeTH7, "Temperature,Humidity,Humidity Status" },
		{ pTypeTEMP_HUM, sTypeTH8, "Temperature,Humidity,Humidity Status" },
		{ pTypeTEMP_HUM, sTypeTH9, "Temperature,Humidity,Humidity Status" },
		{ pTypeTEMP_HUM, sTypeTH10, "Temperature,Humidity,Humidity Status" },
		{ pTypeTEMP_HUM, sTypeTH11, "Temperature,Humidity,Humidity Status" },
		{ pTypeTEMP_HUM, sTypeTH12, "Temperature,Humidity,Humidity Status" },
		{ pTypeTEMP_HUM, sTypeTH_LC_TC, "Temperature,Humidity,Humidity Status" },
		

		{ pTypeTEMP_HUM_BARO, sTypeTHB1, "Temperature,Humidity,Humidity Status,Barometer,Forecast" },
		{ pTypeTEMP_HUM_BARO, sTypeTHB2, "Temperature,Humidity,Humidity Status,Barometer,Forecast" },
		{ pTypeTEMP_HUM_BARO, sTypeTHBFloat, "Temperature,Humidity,Humidity Status,Barometer,Forecast" },

		{ pTypeRAIN, sTypeRAIN1, "Rain rate,Total rain" },
		{ pTypeRAIN, sTypeRAIN2, "Rain rate,Total rain" },
		{ pTypeRAIN, sTypeRAIN3, "Rain rate,Total rain" },
		{ pTypeRAIN, sTypeRAIN4, "Rain rate,Total rain" },
		{ pTypeRAIN, sTypeRAIN5, "Rain rate,Total rain" },
		{ pTypeRAIN, sTypeRAIN6, "Rain rate,Total rain" },
		{ pTypeRAIN, sTypeRAINWU, "Rain rate,Total rain" },

		{ pTypeWIND, sTypeWIND1, "Direction,Direction string,Speed,Gust,Temperature,Chill" },
		{ pTypeWIND, sTypeWIND2, "Direction,Direction string,Speed,Gust,Temperature,Chill" },
		{ pTypeWIND, sTypeWIND3, "Direction,Direction string,Speed,Gust,Temperature,Chill" },
		{ pTypeWIND, sTypeWIND4, "Direction,Direction string,Speed,Gust,Temperature,Chill" },
		{ pTypeWIND, sTypeWIND5, "Direction,Direction string,Speed,Gust,Temperature,Chill" },
		{ pTypeWIND, sTypeWIND6, "Direction,Direction string,Speed,Gust,Temperature,Chill" },
		{ pTypeWIND, sTypeWINDNoTemp, "Direction,Direction string,Speed,Gust,Temperature,Chill" },

		{ pTypeUV, sTypeUV1, "UV,Temperature" },
		{ pTypeUV, sTypeUV2, "UV,Temperature" },
		{ pTypeUV, sTypeUV3, "UV,Temperature" },

		{ pTypeLighting1, sTypeX10, "Status" },
		{ pTypeLighting1, sTypeARC, "Status" },
		{ pTypeLighting1, sTypeAB400D, "Status" },
		{ pTypeLighting1, sTypeWaveman, "Status" },
		{ pTypeLighting1, sTypeEMW200, "Status" },
		{ pTypeLighting1, sTypeIMPULS, "Status" },
		{ pTypeLighting1, sTypeRisingSun, "Status" },
		{ pTypeLighting1, sTypePhilips, "Status" },
		{ pTypeLighting1, sTypeEnergenie, "Status" },
		{ pTypeLighting1, sTypeEnergenie5, "Status" },
		{ pTypeLighting1, sTypeGDR2, "Status" },
		

		{ pTypeLighting2, sTypeAC, "Status" },
		{ pTypeLighting2, sTypeHEU, "Status" },
		{ pTypeLighting2, sTypeANSLUT, "Status" },

		{ pTypeLighting3, sTypeKoppla, "Status" },

		{ pTypeLighting4, sTypePT2262, "Status" },

		{ pTypeLighting5, sTypeLightwaveRF, "Status" },
		{ pTypeLighting5, sTypeEMW100, "Status" },
		{ pTypeLighting5, sTypeBBSB, "Status" },
		{ pTypeLighting5, sTypeMDREMOTE, "Status" },
		{ pTypeLighting5, sTypeRSL, "Status" },
		{ pTypeLighting5, sTypeLivolo, "Status" },
		{ pTypeLighting5, sTypeTRC02, "Status" },
		{ pTypeLighting5, sTypeAoke, "Status" },

		{ pTypeLighting6, sTypeBlyss, "Status" },

		{ pTypeCurtain, sTypeHarrison, "Status" },

		{ pTypeBlinds, sTypeBlindsT0, "Status" },
		{ pTypeBlinds, sTypeBlindsT1, "Status" },
		{ pTypeBlinds, sTypeBlindsT2, "Status" },
		{ pTypeBlinds, sTypeBlindsT3, "Status" },
		{ pTypeBlinds, sTypeBlindsT4, "Status" },
		{ pTypeBlinds, sTypeBlindsT5, "Status" },
		{ pTypeBlinds, sTypeBlindsT6, "Status" },
		{ pTypeBlinds, sTypeBlindsT7, "Status" },

		{ pTypeSecurity1, sTypeSecX10, "Status" },
		{ pTypeSecurity1, sTypeSecX10M, "Status" },
		{ pTypeSecurity1, sTypeSecX10R, "Status" },
		{ pTypeSecurity1, sTypeKD101, "Status" },
		{ pTypeSecurity1, sTypePowercodeSensor, "Status" },
		{ pTypeSecurity1, sTypePowercodeMotion, "Status" },
		{ pTypeSecurity1, sTypeCodesecure, "Status" },
		{ pTypeSecurity1, sTypePowercodeAux, "Status" },
		{ pTypeSecurity1, sTypeMeiantech, "Status" },
		{ pTypeSecurity1, sTypeSA30, "Status" },
		{ pTypeSecurity1, sTypeDomoticzSecurity, "Status" },
		
		{ pTypeCamera, sTypeNinja, "Not implemented" },

		{ pTypeRemote, sTypeATI, "Status" },
		{ pTypeRemote, sTypeATIplus, "Status" },
		{ pTypeRemote, sTypeMedion, "Status" },
		{ pTypeRemote, sTypePCremote, "Status" },
		{ pTypeRemote, sTypeATIrw2, "Status" },
		
		{ pTypeThermostat1, sTypeDigimax, "Temperature,Set point,Mode,Status" },
		{ pTypeThermostat1, sTypeDigimaxShort, "Temperature,Set point,Mode,Status" },

		{ pTypeThermostat2, sTypeHE105, "Not implemented" },
		{ pTypeThermostat2, sTypeRTS10, "Not implemented" },

		{ pTypeThermostat3, sTypeMertikG6RH4T1, "Status" },
		{ pTypeThermostat3, sTypeMertikG6RH4TB, "Status" },

		{ pTypeDT, sTypeDT1, "?????" },

		{ pTypeCURRENT, sTypeELEC1, "Current 1,Current 2,Current 3" },
		
		{ pTypeENERGY, sTypeELEC2, "Instant,Usage" },
		{ pTypeENERGY, sTypeELEC3, "Instant,Usage" },
		{ pTypeENERGY, sTypeZWaveUsage, "Instant,Usage" },

		{ pTypeCURRENTENERGY, sTypeELEC4, "Current 1,Current 2,Current 3,Usage" },
		
		{ pTypeWEIGHT, sTypeWEIGHT1, "Weight" },
		{ pTypeWEIGHT, sTypeWEIGHT2, "Weight" },
		
		{ pTypeRFXSensor, sTypeRFXSensorTemp, "Temperature" },
		{ pTypeRFXSensor, sTypeRFXSensorAD, "Voltage" },
		{ pTypeRFXSensor, sTypeRFXSensorVolt, "Voltage" },

		{ pTypeRFXMeter, sTypeRFXMeterCount, "Counter" },
		
		{ pTypeP1Power, sTypeP1Power, "Usage 1,Usage 2,Delivery 1,Delivery 2,Usage current,Delivery current" },
		{ pTypeP1Gas, sTypeP1Gas, "Gas usage" },

		{ pTypeYouLess, sTypeYouLess, "Usage,Usage current" },

		{ pTypeRego6XXTemp, sTypeRego6XXTemp, "Temperature" },
		{ pTypeRego6XXValue, sTypeRego6XXStatus, "Value" },
		{ pTypeRego6XXValue, sTypeRego6XXCounter, "Counter" },

		{ pTypeAirQuality, sTypeVoltcraft, "Status" },

		{ pTypeUsage, sTypeElectric, "Usage" },

		{ pTypeTEMP_BARO, sTypeBMP085, "Temperature,Barometer,Forecast,Altitude" },
		
		{ pTypeLux, sTypeLux, "Lux" },

		{ pTypeGeneral, sTypeVisibility, "Visibility" },
		{ pTypeGeneral, sTypeSolarRadiation, "Solar Radiation" },
		{ pTypeGeneral, sTypeSoilMoisture, "Soil Moisture" },
		{ pTypeGeneral, sTypeLeafWetness, "Leaf Wetness" },
		{ pTypeGeneral, sTypeSystemTemp, "Temperature" },
		{ pTypeGeneral, sTypePercentage, "Percentage" },
		{ pTypeGeneral, sTypeSystemFan, "Fanspeed" },
		{ pTypeGeneral, sTypeVoltage, "Voltage" },
		{ pTypeGeneral, sTypePressure, "Pressure" },
		
		{ pTypeThermostat, sTypeThermSetpoint, "Temperature" },
		{ pTypeThermostat, sTypeThermTemperature, "Temperature" },

		{ pTypeChime, sTypeByronSX, "Status" },
		{ pTypeTEMP_RAIN, sTypeTR1, "Temperature,Total rain" },

		{ pTypeBBQ, sTypeBBQ1, "Temperature 1,Temperature 2" },

		{ pTypePOWER, sTypeELEC5, "Instant,Usage" },
		
		{ pTypeLimitlessLights, sTypeLimitlessRGBW, "Status" },
		{ pTypeLimitlessLights, sTypeLimitlessRGB, "Status" },
		{ pTypeLimitlessLights, sTypeLimitlessWhite, "Status" },

		{ pTypeRFY, sTypeRFY, "Status" },
		{ pTypeRFY, sTypeRFYext, "Status" },

		{  0,0,NULL }
	};
	return findTableID1ID2(Table, dType, sType);
}

void GetLightStatus(
		const unsigned char dType, 
		const unsigned char dSubType, 
		const _eSwitchType switchtype,
		const unsigned char nValue, 
		const std::string &sValue, 
		std::string &lstatus, 
		int &llevel, 
		bool &bHaveDimmer,
		int &maxDimLevel,
		bool &bHaveGroupCmd)
{
	bHaveDimmer=false;
	maxDimLevel=0;
	bHaveGroupCmd=false;
	lstatus="";

	char szTmp[80];
	switch (dType)
	{
	case pTypeLighting1:
		switch (dSubType)
		{
		case sTypeX10:
			bHaveGroupCmd=true;
			switch (nValue)
			{
			case light1_sOff:
				lstatus="Off";
				break;
			case light1_sOn:
				lstatus="On";
				break;
			case light1_sDim:
				lstatus="Dim";
				break;
			case light1_sBright:
				lstatus="Bright";
				break;
			case light1_sAllOn:
				lstatus="All On";
				break;
			case light1_sAllOff:
				lstatus="All Off";
				break;
			}
			break;
		case sTypeARC:
		case sTypePhilips:
		case sTypeEnergenie:
		case sTypeEnergenie5:
		case sTypeGDR2:
			bHaveGroupCmd=true;
			switch (nValue)
			{
			case light1_sOff:
				lstatus="Off";
				break;
			case light1_sOn:
				lstatus="On";
				break;
			case light1_sAllOn:
				lstatus="All On";
				break;
			case light1_sAllOff:
				lstatus="All Off";
				break;
			case light1_sChime:
				lstatus="Chime";
				break;
			}
			break;
		case sTypeAB400D:
		case sTypeWaveman:
		case sTypeEMW200:
		case sTypeIMPULS:
		case sTypeRisingSun:
			switch (nValue)
			{
			case light1_sOff:
				lstatus="Off";
				break;
			case light1_sOn:
				lstatus="On";
				break;
			}
			break;
		}
		break;
	case pTypeLighting2:
		llevel=(int)float((100.0f/15.0f)*atof(sValue.c_str()));
		switch (dSubType)
		{
		case sTypeAC:
		case sTypeHEU:
		case sTypeANSLUT:
			bHaveDimmer=true;
			maxDimLevel=16;
			bHaveGroupCmd=true;
			switch (nValue)
			{
			case light2_sOff:
				lstatus="Off";
				break;
			case light2_sOn:
				lstatus="On";
				break;
			case light2_sSetLevel:
				sprintf(szTmp,"Set Level: %d %%", llevel);
				if (sValue!="0")
					lstatus=szTmp;
				else
					lstatus="Off";
				break;
			case light2_sGroupOff:
				lstatus="Group Off";
				break;
			case light2_sGroupOn:
				lstatus="Group On";
				break;
			case light2_sSetGroupLevel:
				sprintf(szTmp,"Set Group Level: %d %%", atoi(sValue.c_str()));
				if (sValue!="0")
					lstatus=szTmp;
				else
					lstatus="Off";
				break;
			}
			break;
		}
		break;
	case pTypeLighting4:
		switch (nValue)
		{
		case light2_sOff:
			lstatus="Off";
			break;
		case light2_sOn:
			lstatus="On";
			break;
		}
		break;
	case pTypeLighting5:
		if (dSubType==sTypeLivolo)
			llevel=int((100.0f/7.0f)*atof(sValue.c_str()));
		else
			llevel=int((100.0f/31.0f)*atof(sValue.c_str()));
		switch (dSubType)
		{
		case sTypeLightwaveRF:
			bHaveGroupCmd=true;
			bHaveDimmer=true;
			maxDimLevel=32;
			switch (nValue)
			{
			case light5_sOff:
				lstatus="Off";
				break;
			case light5_sOn:
				lstatus="On";
				break;
			case light5_sGroupOff:
				lstatus="Group Off";
				break;
			case light5_sMood1:
				lstatus="Group Mood 1";
				break;
			case light5_sMood2:
				lstatus="Group Mood 2";
				break;
			case light5_sMood3:
				lstatus="Group Mood 3";
				break;
			case light5_sMood4:
				lstatus="Group Mood 4";
				break;
			case light5_sMood5:
				lstatus="Group Mood 5";
				break;
			case light5_sUnlock:
				lstatus="Unlock";
				break;
			case light5_sLock:
				lstatus="Lock";
				break;
			case light5_sAllLock:
				lstatus="All lock";
				break;
			case light5_sClose:
				lstatus="Close inline relay";
				break;
			case light5_sStop:
				lstatus="Stop inline relay";
				break;
			case light5_sOpen:
				lstatus="Open inline relay";
				break;
			case light5_sSetLevel:
				sprintf(szTmp,"Set Level: %d %%" ,llevel);
				if (sValue!="0")
					lstatus=szTmp;
				else
					lstatus="Off";
				break;
			}
			break;
		case sTypeEMW100:
			switch (nValue)
			{
			case light5_sOff:
				lstatus="Off";
				break;
			case light5_sOn:
				lstatus="On";
				break;
			case light5_sLearn:
				lstatus="Learn";
				break;
			}
			break;
		case sTypeBBSB:
		case sTypeRSL:
			bHaveGroupCmd=true;
			switch (nValue)
			{
			case light5_sOff:
				lstatus="Off";
				break;
			case light5_sOn:
				lstatus="On";
				break;
			case light5_sGroupOff:
				lstatus="Group Off";
				break;
			case light5_sGroupOn:
				lstatus="Group On";
				break;
			}
			break;
		case sTypeLivolo:
			bHaveGroupCmd=true;
			bHaveDimmer=true;
			maxDimLevel=7;
			switch (nValue)
			{
			case light5_sOff:
				lstatus="Off";
				break;
			case light5_sOn:
				lstatus="On";
				break;
			case light5_sLivoloGang2Toggle:
				lstatus="Set Level";
				break;
			case light5_sLivoloGang3Toggle:
				lstatus="Set Level";
				break;
			}
			break;
		case sTypeTRC02:
			bHaveGroupCmd=true;
			bHaveDimmer=true;
			maxDimLevel=7;
			switch (nValue)
			{
			case light5_sOff:
				lstatus="Off";
				break;
			case light5_sOn:
				lstatus="On";
				break;
			}
			break;
		case sTypeAoke:
			switch (nValue)
			{
			case light5_sOff:
				lstatus = "Off";
				break;
			case light5_sOn:
				lstatus = "On";
				break;
			}
			break;
		}
		break;
	case pTypeLighting6:
		bHaveGroupCmd=true;
		switch (dSubType)
		{
		case sTypeBlyss:
			switch (nValue)
			{
			case light6_sOff:
				lstatus="Off";
				break;
			case light6_sOn:
				lstatus="On";
				break;
			case light6_sGroupOff:
				lstatus="Group Off";
				break;
			case light6_sGroupOn:
				lstatus="Group On";
				break;
			}
		}
		break;
	case pTypeLimitlessLights:
		bHaveDimmer=true;
		maxDimLevel=100;
		switch (nValue)
		{
		case Limitless_LedOff:
			lstatus="Off";
			break;
		case Limitless_LedOn:
			lstatus="On";
			break;
		case Limitless_SetBrightnessLevel:
			lstatus="Set Level";
			break;
		}
		break;
	case pTypeSecurity1:
		llevel=0;
		switch (nValue)
		{
		case sStatusNormal:
			lstatus="Normal";
			break;
		case sStatusNormalDelayed:
			lstatus="Normal Delayed";
			break;
		case sStatusAlarm:
			lstatus="Alarm";
			break;
		case sStatusAlarmDelayed:
			lstatus="Alarm Delayed";
			break;
		case sStatusMotion:
			lstatus="Motion";
			break;
		case sStatusNoMotion:
			lstatus="No Motion";
			break;
		case sStatusPanic:
			lstatus="Panic";
			break;
		case sStatusPanicOff:
			lstatus="Panic End";
			break;
		case sStatusArmAway:
			lstatus="Arm Away";
			break;
		case sStatusArmAwayDelayed:
			lstatus="Arm Away Delayed";
			break;
		case sStatusArmHome:
			lstatus="Arm Home";
			break;
		case sStatusArmHomeDelayed:
			lstatus="Arm Home Delayed";
			break;
		case sStatusDisarm:
			lstatus="Disarm";
			break;
		case sStatusLightOff:
			lstatus="Light Off";
			break;
		case sStatusLightOn:
			lstatus="Light On";
			break;
		case sStatusLight2Off:
			lstatus="Light 2 Off";
			break;
		case sStatusLight2On:
			lstatus="Light 2 On";
			break;
		case sStatusDark:
			lstatus="Dark detected";
			break;
		case sStatusLight:
			lstatus="Light Detected";
			break;
		case sStatusBatLow:
			lstatus="Battery low MS10 or XX18 sensor";
			break;
		case sStatusPairKD101:
			lstatus="Pair KD101";
			break;
		case sStatusNormalTamper:
			lstatus="Normal + Tamper";
			break;
		case sStatusNormalDelayedTamper:
			lstatus="Normal Delayed + Tamper";
			break;
		case sStatusAlarmTamper:
			lstatus="Alarm + Tamper";
			break;
		case sStatusAlarmDelayedTamper:
			lstatus="Alarm Delayed + Tamper";
			break;
		case sStatusMotionTamper:
			lstatus="Motion + Tamper";
			break;
		case sStatusNoMotionTamper:
			lstatus="No Motion + Tamper";
			break;
		}
		break;
	case pTypeRego6XXValue:
		switch (nValue)
		{
		case 0:
			lstatus="Off";
			break;
		case 1:
			lstatus="On";
			break;
		}
		break;
	case pTypeCurtain:
		switch (nValue)
		{
		case curtain_sOpen:
			lstatus="Off";
			break;
		case curtain_sClose:
			lstatus="On";
			break;
		case curtain_sStop:
			lstatus="Stop";
			break;
		}
		break;
	case pTypeBlinds:
		switch (nValue)
		{
		case blinds_sOpen:
			lstatus="Off";
			break;
		case blinds_sClose:
			lstatus="On";
			break;
		case blinds_sStop:
			lstatus="Stop";
			break;
		case blinds_sConfirm:
			lstatus="Confirm";
			break;
		case blinds_sLimit:
			lstatus="Limit";
			break;
		case blinds_slowerLimit:
			lstatus="Lower Limit";
			break;
		case blinds_sDeleteLimits:
			lstatus="Delete Limits";
			break;
		case blinds_sChangeDirection:
			lstatus="Change Direction";
			break;
		case blinds_sLeft:
			lstatus="Left";
			break;
		case blinds_sRight:
			lstatus="Right";
			break;
		}
		break;
	case pTypeRFY:
		switch (nValue)
		{
		case rfy_sUp:
			lstatus="Off";
			break;
		case rfy_sDown:
			lstatus="On";
			break;
		case rfy_sStop:
			lstatus="Stop";
			break;
		case rfy_s05SecUp:
			if (switchtype == STYPE_VenetianBlindsUS)
			{
				lstatus = "Off";
			}
			break;
		case rfy_s2SecUp:
			if (switchtype == STYPE_VenetianBlindsEU)
			{
				lstatus = "Off";
			}
			break;
		case rfy_s05SecDown:
			if (switchtype == STYPE_VenetianBlindsUS)
			{
				lstatus = "On";
			}
			break;
		case rfy_s2SecDown:
			if (switchtype == STYPE_VenetianBlindsEU)
			{
				lstatus = "On";
			}
			break;
		}
		break;
	case pTypeChime:
		lstatus="On";
		break;
	case pTypeRemote:
		lstatus="On";
		break;
	case pTypeThermostat3:
		switch (nValue)
		{
		case thermostat3_sOff:
			lstatus="Off";
			break;
		case thermostat3_sOn:
			lstatus="On";
			break;
		case thermostat3_sUp:
			lstatus="Up";
			break;
		case thermostat3_sDown:
			lstatus="Down";
			break;
		case thermostat3_sRunUp:
			if (dSubType==sTypeMertikG6RH4T1)
				lstatus="Run Up";
			else
				lstatus="2nd Off";
			break;
		case thermostat3_sRunDown:
			if (dSubType==sTypeMertikG6RH4T1)
				lstatus="Run Down";
			else
				lstatus="2nd On";
			break;
		case thermostat3_sStop:
			lstatus="Stop";
			break;
		}
		break;
	}
}

bool GetLightCommand(
	const unsigned char dType, 
	const unsigned char dSubType, 
	_eSwitchType switchtype, 
	std::string switchcmd,
	unsigned char &cmd
	)
{
	if (switchtype==STYPE_Contact)
		return false;	//we can not (or will not) switch this type

	switch (dType)
	{
	case pTypeLighting1:
		if (switchtype==STYPE_Doorbell)
		{
			if (dSubType==sTypeARC)
			{
				if ((switchcmd=="On")||(switchcmd=="Group On")||(switchcmd=="Chime"))
				{
					cmd=light1_sChime;
					return true;
				}
			}
			else
			{
				//not sure yet, maybe more devices need the above chime command
				if ((switchcmd=="On")||(switchcmd=="Group On"))
				{
					cmd=light1_sAllOn;
					return true;
				}
			}
			//no other combinations for the door switch
			return false;
		}
		else if (switchtype==STYPE_X10Siren)
		{
			if ((switchcmd=="On")||(switchcmd=="All On"))
			{
				cmd=light1_sAllOn;
				return true;
			}
			else if ((switchcmd=="Off")||(switchcmd=="All Off"))
			{
				cmd=light1_sAllOff;
				return true;
			}
			return false;
		}
		if (switchcmd=="Off")
		{
			cmd=light1_sOff;
			return true;
		} else if (switchcmd=="On") {
			cmd=light1_sOn;
			return true;
		} else if (switchcmd=="Dim") {
			cmd=light1_sDim;
			return true;
		} else if (switchcmd=="Bright") {
			cmd=light1_sBright;
			return true;
		} else if (switchcmd=="All On") {
			cmd=light1_sAllOn;
			return true;
		} else if (switchcmd=="All Off") {
			cmd=light1_sAllOff;
			return true;
		} else if (switchcmd=="Chime") {
			cmd=light1_sChime;
			return true;
		} else
			return false;
		break;
	case pTypeLighting2:
		if (switchtype==STYPE_Doorbell)
		{
			if ((switchcmd=="On")||(switchcmd=="Group On"))
			{
				cmd=light2_sGroupOn;
				return true;
			}
			//no other combinations for the door switch
			return false;
		}
		else if (switchtype==STYPE_X10Siren)
		{
			if ((switchcmd=="On")||(switchcmd=="Group On"))
			{
				cmd=light2_sGroupOn;
				return true;
			}
			else if ((switchcmd=="Off")||(switchcmd=="Group Off"))
			{
				cmd=light2_sGroupOff;
				return true;
			}
			return false;
		}
		if (switchcmd=="Off")
		{
			cmd=light2_sOff;
			return true;
		}
		else if (switchcmd=="On")
		{
			cmd=light2_sOn;
			return true;
		}
		else if (switchcmd=="Set Level")
		{
			cmd=light2_sSetLevel;
			return true;
		}
		else if (switchcmd=="Group Off")
		{
			cmd=light2_sGroupOff;
			return true;
		}
		else if (switchcmd=="Group On")
		{
			cmd=light2_sGroupOn;
			return true;
		}
		else if (switchcmd=="Set Group Level")
		{
			cmd=light2_sSetGroupLevel;
			return true;
		}
		else
			return false;
		break;
	case pTypeLighting4:
		cmd=light2_sOn;
		return true;
	case pTypeLighting5:
		if (dSubType==sTypeLivolo)
		{
			if (switchcmd=="Set Level")
			{
				cmd=light5_sLivoloGang2Toggle;
				return true;
			}
		}
		else if (dSubType==sTypeTRC02)
		{
			if (switchcmd=="Set Color")
			{
				cmd=light5_sRGBcolormin+1; //color set is light5_sRGBcolormin+1 till 255?
				return true;
			}
		}
		else if (dSubType!=sTypeLightwaveRF)
		{
			//Only LightwaveRF devices have a set-level
			if (switchcmd=="Set Level")
				switchcmd="On";
		}

		if (switchtype==STYPE_Doorbell)
		{
			if ((switchcmd=="On")||(switchcmd=="Group On"))
			{
				cmd=light5_sGroupOn;
				return true;
			}
			//no other combinations for the door switch
			return false;
		}
		else if (switchtype==STYPE_X10Siren)
		{
			if ((switchcmd=="On")||(switchcmd=="Group On"))
			{
				cmd=light5_sGroupOn;
				return true;
			}
			else if ((switchcmd=="Off")||(switchcmd=="Group Off"))
			{
				cmd=light5_sGroupOff;
				return true;
			}
			return false;
		}
		if (switchcmd=="Off")
		{
			cmd=light5_sOff;
			return true;
		}
		else if (switchcmd=="On")
		{
			cmd=light5_sOn;
			return true;
		}
		else if (switchcmd=="Set Level")
		{
			cmd=light5_sSetLevel;
			return true;
		}
		else if (switchcmd=="Group Off")
		{
			cmd=light5_sGroupOff;
			return true;
		}
		else if (switchcmd=="Group On")
		{
			cmd=light5_sGroupOn;
			return true;
		}
		else
			return false;
		break;
	case pTypeLighting6:
		if (switchcmd=="Off")
		{
			cmd=light6_sOff;
			return true;
		}
		else if (switchcmd=="On")
		{
			cmd=light6_sOn;
			return true;
		}
		else if (switchcmd=="Group Off")
		{
			cmd=light6_sGroupOff;
			return true;
		}
		else if (switchcmd=="Group On")
		{
			cmd=light6_sGroupOn;
			return true;
		}
		else
			return false;
		break;
	case pTypeLimitlessLights:
		if (switchcmd=="Off")
		{
			cmd=Limitless_LedOff;
			return true;
		}
		else if (switchcmd=="On")
		{
			cmd=Limitless_LedOn;
			return true;
		}
		else if (switchcmd=="Set Color")
		{
			cmd=Limitless_SetRGBColour;
			return true;
		}
		else if (
			(switchcmd=="Set Brightness")||
			(switchcmd=="Set Level")
			)
		{
			cmd=Limitless_SetBrightnessLevel;
			return true;
		}
		else if (switchcmd == "Set White")
		{
			cmd = Limitless_SetColorToWhite;
			return true;
		}
		else if (switchcmd == "Set Full")
		{
			cmd=Limitless_SetColorToWhite;
			return true;
		}
		else if (switchcmd == "Set Night")
		{
			cmd = Limitless_NightMode;
			return true;
		}
		else if (switchcmd == "Bright Up")
		{
			cmd = Limitless_SetBrightUp;
			return true;
		}
		else if (switchcmd == "Bright Down")
		{
			cmd = Limitless_SetBrightDown;
			return true;
		}
		else if (switchcmd == "Disco Up")
		{
			cmd = Limitless_RGBDiscoNext;
			return true;
		}
		else if (switchcmd == "Disco Down")
		{
			cmd = Limitless_RGBDiscoPrevious;
			return true;
		}
		else if (switchcmd == "Speed Up")
		{
			cmd = Limitless_DiscoSpeedFaster;
			return true;
		}
		else if (switchcmd == "Speed Up Long")
		{
			cmd = Limitless_DiscoSpeedFasterLong;
			return true;
		}
		else if (switchcmd == "Speed Down")
		{
			cmd = Limitless_DiscoSpeedSlower;
			return true;
		}
		else if (switchcmd == "Warmer")
		{
			cmd = Limitless_WarmWhiteIncrease;
			return true;
		}
		else if (switchcmd == "Cooler")
		{
			cmd = Limitless_CoolWhiteIncrease;
			return true;
		}
		else
			return false;
		break;
	case pTypeSecurity1:
		if (
			(dSubType==sTypeKD101)||
			(dSubType==sTypeSA30)
			)
		{
			if ((switchcmd=="On")||(switchcmd=="All On"))
			{
				cmd=sStatusPanic;
				return true;
			}
		}
		else if (dSubType==sTypeSecX10M)
		{
			if (switchcmd=="Motion")
			{
				cmd=sStatusMotion;
				return true;
			}
			else if (switchcmd=="No Motion")
			{
				cmd=sStatusNoMotion;
				return true;
			}
		}
		else if ((dSubType==sTypeSecX10R)||(dSubType==sTypeMeiantech))
		{
			if (switchcmd=="On")
			{
				cmd=sStatusArmAway;
				return true;
			}
			else if (switchcmd=="Off")
			{
				cmd=sStatusDisarm;
				return true;
			}
			else if (switchcmd=="Arm Home")
			{
				cmd=sStatusArmHome;
				return true;
			}
			else if (switchcmd=="Arm Away")
			{
				cmd=sStatusArmAway;
				return true;
			}
			else if (switchcmd == "Panic")
			{
				cmd = sStatusPanic;
				return true;
			}
			else if (switchcmd == "Disarm")
			{
				cmd = sStatusDisarm;
				return true;
			}
		}
		else if (dSubType==sTypeSecX10)
		{
			if (switchcmd=="Normal")
			{
				cmd=sStatusNormal;
				return true;
			}
			else if (switchcmd=="Alarm")
			{
				cmd=sStatusAlarm;
				return true;
			}
			else if (switchcmd=="Normal Delayed")
			{
				cmd=sStatusNormalDelayed;
				return true;
			}
			else if (switchcmd=="Alarm Delayed")
			{
				cmd=sStatusAlarmDelayed;
				return true;
			}
		}
		break;
	case pTypeCurtain:
		{
			if (switchcmd=="On")
			{
				cmd=curtain_sClose;
			}
			else if (switchcmd=="Off")
			{
				cmd=curtain_sOpen;
			}
			else
			{
				cmd=curtain_sStop;
			}
			return true;
		}
		break;
	case pTypeBlinds:
		{
			if (switchcmd=="On")
			{
				cmd=blinds_sClose;
			}
			else if (switchcmd=="Off")
			{
				cmd=blinds_sOpen;
			}
			else
			{
				cmd=blinds_sStop;
			}
			return true;
		}
		break;
	case pTypeRFY:
		{
		/*
		Venetian Blind in US mode:
		-up / down(transmit < 0.5 seconds) : open or close
		-up / down(transmit > 2seconds) : change angle

		Venetian Blind in Europe mode :
		-up / down(transmit < 0.5 seconds) : change angle
		-up / down(transmit > 2seconds) : open or close
		*/
			if (switchcmd == "On")
			{
				if (switchtype == STYPE_VenetianBlindsUS)
				{
					cmd = rfy_s05SecDown;
				}
				else if (switchtype == STYPE_VenetianBlindsEU)
				{
					cmd = rfy_s2SecDown;
				}
				else
				{
					cmd = rfy_sDown;
				}
			}
			else if (switchcmd=="Off")
			{
				if (switchtype == STYPE_VenetianBlindsUS)
				{
					cmd = rfy_s05SecUp;
				}
				else if (switchtype == STYPE_VenetianBlindsEU)
				{
					cmd = rfy_s2SecUp;
				}
				else
				{
					cmd = rfy_sUp;
				}
			}
			else if (switchcmd == "Stop")
			{
				cmd = rfy_sStop;
			}
			else if (switchcmd == "Up")
			{
				cmd = rfy_sUp;
			}
			else if (switchcmd == "UpStop")
			{
				cmd = rfy_sUpStop;
			}
			else if (switchcmd == "Down")
			{
				cmd = rfy_sDown;
			}
			else if (switchcmd == "DownStop")
			{
				cmd = rfy_sDownStop;
			}
			else if (switchcmd == "UpDown")
			{
				cmd = rfy_sUpDown;
			}
			else if (switchcmd == "ListRemotes")
			{
				cmd = rfy_sListRemotes;
			}
			else if (switchcmd == "Program")
			{
				cmd = rfy_sProgram;
			}
			else if (switchcmd == "Program2Seconds")
			{
				cmd = rfy_s2SecProgram;
			}
			else if (switchcmd == "Program7Seconds")
			{
				cmd = rfy_s7SecProgram;
			}
			else if (switchcmd == "Stop2Seconds")
			{
				cmd = rfy_s2SecStop;
			}
			else if (switchcmd == "Stop5Seconds")
			{
				cmd = rfy_s5SecStop;
			}
			else if (switchcmd == "UpDown5Seconds")
			{
				cmd = rfy_s5SecUpDown;
			}
			else if (switchcmd == "EraseThis") //from the RFXtrx
			{
				cmd = rfy_sEraseThis;
			}
			else if (switchcmd == "EraseAll") //from the RFXtrx
			{
				cmd = rfy_sEraseAll;
			}
			else if (switchcmd == "Up05Seconds")
			{
				cmd = rfy_s05SecUp;
			}
			else if (switchcmd == "Down05Seconds")
			{
				cmd = rfy_s05SecDown;
			}
			else if (switchcmd == "Up2Seconds")
			{
				cmd = rfy_s2SecUp;
			}
			else if (switchcmd == "Down2Seconds")
			{
				cmd = rfy_s2SecDown;
			}
			else
			{
				cmd=rfy_sStop;
			}
			return true;
		}
		break;
	case pTypeRemote:
		cmd=light2_sOn;
		break;
	case pTypeThermostat3:
		{
			if (switchcmd=="On")
			{
				cmd=thermostat3_sOn;
			}
			else if (switchcmd=="Off")
			{
				cmd=thermostat3_sOff;
			}
			else
			{
				cmd=thermostat3_sOff;
			}
			return true;
		}
		break;
	}
	//unknown command
	return false;
}

bool IsLightSwitchOn(const std::string &lstatus)
{
	return (
		(lstatus=="On")||
		(lstatus=="Group On")||
		(lstatus=="All On")||
		(lstatus=="Chime")||
		(lstatus=="Motion")||
		(lstatus=="Alarm")||
		(lstatus=="Panic")||
		(lstatus=="Light On")||
		(lstatus=="Light 2 On")||
		(lstatus=="Open inline relay")||
		(lstatus.find("Set Level")!=std::string::npos)||
		(lstatus.find("Set Group Level")!=std::string::npos)
		);
}

const char *Get_Moisture_Desc(const int moisture)
{
	if (moisture<10)
		return "saturated";
	else if (moisture<20)
		return "adequately wet";
	else if (moisture<60)
		return "irrigation advise";
	else if (moisture<100)
		return "irrigation";
	else
		return "dangerously dry";
}

