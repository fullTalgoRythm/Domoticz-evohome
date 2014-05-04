/*
This code implements basic I/O hardware via the Raspberry Pi's GPIO port, using the wiringpi library.
WiringPi is Copyright (c) 2012-2013 Gordon Henderson. <projects@drogon.net>
It must be installed beforehand following instructions at http://wiringpi.com/download-and-install/

    Copyright (C) 2014 Vicne <vicnevicne@gmail.com>

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
    MA 02110-1301 USA.

This is a derivative work based on the samples included with wiringPi and distributed 
under the GNU Lesser General Public License version 3
Source: http://wiringpi.com

Connection information:
	This hardware uses the pins of the Raspebrry Pi's GPIO port.
	Please read:
	http://wiringpi.com/pins/special-pin-functions/
	http://wiringpi.com/pins/ for more information
	As we cannot assume domoticz runs as root (which is bad), we won't take advantage of wiringPi's numbering.
	Consequently, we will always use the internal GPIO pin numbering as noted the board, including in the commands below

	Pins have to be exported and configured beforehand and upon each reboot of the Pi, like so:
	- For output pins, only one command is needed:
	gpio export <pin> out

	- For input pins, 2 commands are needed (one to export as input, and one to trigger interrupts on both edges):
	gpio export <pin> in
	gpio edge <pin> both
	
	Note: If you wire a pull-up, make sure you use 3.3V from P1-01, NOT the 5V pin ! The inputs are 3.3V max !
*/
#include "stdafx.h"
#ifdef WITH_GPIO
#include "Gpio.h"
#include "GpioPin.h"
#include <wiringPi.h>
#include "../main/Helper.h"
#include "../main/Logger.h"
#include "hardwaretypes.h"
#include "../main/RFXtrx.h"

#define NO_INTERRUPT   -1


// List of GPIO pin numbers, ordered as listed
std::vector<CGpioPin> CGpio::pins;

// Queue of GPIO numbers which have triggered at least an interrupt to be processed.
std::vector<int> gpioInterruptQueue;

boost::mutex interruptQueueMutex;
boost::condition_variable interruptCondition;


/*
 * Direct GPIO implementation, inspired by other hardware implementations such as PiFace and EnOcean
 */
CGpio::CGpio(const int ID)
{
	m_stoprequested=false;
	m_HwdID=ID;

	//Prepare a generic packet info for LIGHTING1 packet, so we do not have to do it for every packet
	IOPinStatusPacket.LIGHTING1.packetlength = sizeof(IOPinStatusPacket.LIGHTING1) -1;
	IOPinStatusPacket.LIGHTING1.housecode = 0;
	IOPinStatusPacket.LIGHTING1.packettype = pTypeLighting1;
	IOPinStatusPacket.LIGHTING1.subtype = sTypeIMPULS;
	IOPinStatusPacket.LIGHTING1.rssi = 12;
	IOPinStatusPacket.LIGHTING1.seqnbr = 0;
}

CGpio::~CGpio(void)
{
}

/*
 * interrupt handlers:
 *********************************************************************************
 */

 void pushInterrupt(int gpioId) {
	boost::mutex::scoped_lock lock(interruptQueueMutex);

	if(std::find(gpioInterruptQueue.begin(), gpioInterruptQueue.end(), gpioId) != gpioInterruptQueue.end()) {
	    _log.Log(LOG_NORM, "GPIO: Interrupt for GPIO %d already queued. Ignoring...", gpioId);
	}
	else {
	    // Queue interrupt. Note that as we make sure it contains only unique numbers, it can never "overflow".
	    _log.Log(LOG_NORM, "GPIO: Queuing interrupt for GPIO %d.", gpioId);
		gpioInterruptQueue.push_back(gpioId);
		interruptCondition.notify_one();
	}
    _log.Log(LOG_NORM, "GPIO: %d interrupts in queue.", gpioInterruptQueue.size());
}


void interruptHandler0 (void) { pushInterrupt(0); }
void interruptHandler1 (void) { pushInterrupt(1); }
void interruptHandler2 (void) { pushInterrupt(2); }
void interruptHandler3 (void) { pushInterrupt(3); }
void interruptHandler4 (void) { pushInterrupt(4); }

void interruptHandler7 (void) { pushInterrupt(7); }
void interruptHandler8 (void) { pushInterrupt(8); }
void interruptHandler9 (void) { pushInterrupt(9); }
void interruptHandler10(void) { pushInterrupt(10); }
void interruptHandler11(void) { pushInterrupt(11); }

void interruptHandler14(void) { pushInterrupt(14); }
void interruptHandler15(void) { pushInterrupt(15); }

void interruptHandler17(void) { pushInterrupt(17); }
void interruptHandler18(void) { pushInterrupt(18); }

void interruptHandler21(void) { pushInterrupt(21); }
void interruptHandler22(void) { pushInterrupt(22); }
void interruptHandler23(void) { pushInterrupt(23); }
void interruptHandler24(void) { pushInterrupt(24); }
void interruptHandler25(void) { pushInterrupt(25); }

void interruptHandler27(void) { pushInterrupt(27); }
void interruptHandler28(void) { pushInterrupt(28); }
void interruptHandler29(void) { pushInterrupt(29); }
void interruptHandler30(void) { pushInterrupt(30); }
void interruptHandler31(void) { pushInterrupt(31); }


bool CGpio::StartHardware()
{
	// TODO make sure the WIRINGPI_CODES environment variable is set, otherwise WiringPi makes the program exit upon error
	// Note : We're using the wiringPiSetupSys variant as it does not require root privilege
	if (wiringPiSetupSys() != 0) {
		_log.Log(LOG_ERROR, "GPIO: Error initializing wiringPi !");
		return false;
	}

	m_stoprequested=false;

	//Start worker thread that will be responsible for interrupt handling
	m_thread = boost::shared_ptr<boost::thread>(new boost::thread(boost::bind(&CGpio::Do_Work, this)));

	m_bIsStarted=true;

	//Hook up interrupt call-backs for each input GPIO

	for(std::vector<CGpioPin>::iterator it = pins.begin(); it != pins.end(); ++it) {
		if (it->GetIsExported() && it->GetIsInput()) {
			_log.Log(LOG_NORM, "GPIO: Hooking interrupt handler for GPIO %d.", it->GetId());
			switch (it->GetId()) {
				case 0:	wiringPiISR(0, INT_EDGE_SETUP, &interruptHandler0); break;
				case 1: wiringPiISR(1, INT_EDGE_SETUP, &interruptHandler1); break;
				case 2: wiringPiISR(2, INT_EDGE_SETUP, &interruptHandler2); break;
				case 3: wiringPiISR(3, INT_EDGE_SETUP, &interruptHandler3); break;	
				case 4: wiringPiISR(4, INT_EDGE_SETUP, &interruptHandler4); break;

				case 7: wiringPiISR(7, INT_EDGE_SETUP, &interruptHandler7); break;
				case 8: wiringPiISR(8, INT_EDGE_SETUP, &interruptHandler8); break;
				case 9: wiringPiISR(9, INT_EDGE_SETUP, &interruptHandler9); break;
				case 10: wiringPiISR(10, INT_EDGE_SETUP, &interruptHandler10); break;
				case 11: wiringPiISR(11, INT_EDGE_SETUP, &interruptHandler11); break;

				case 14: wiringPiISR(14, INT_EDGE_SETUP, &interruptHandler14); break;
				case 15: wiringPiISR(15, INT_EDGE_SETUP, &interruptHandler15); break;

				case 17: wiringPiISR(17, INT_EDGE_SETUP, &interruptHandler17); break;
				case 18: wiringPiISR(18, INT_EDGE_SETUP, &interruptHandler18); break;

				case 21: wiringPiISR(21, INT_EDGE_SETUP, &interruptHandler21); break;
				case 22: wiringPiISR(22, INT_EDGE_SETUP, &interruptHandler22); break;
				case 23: wiringPiISR(23, INT_EDGE_SETUP, &interruptHandler23); break;
				case 24: wiringPiISR(24, INT_EDGE_SETUP, &interruptHandler24); break;
				case 25: wiringPiISR(25, INT_EDGE_SETUP, &interruptHandler25); break;

				case 27: wiringPiISR(27, INT_EDGE_SETUP, &interruptHandler27); break;
				case 28: wiringPiISR(28, INT_EDGE_SETUP, &interruptHandler28); break;
				case 29: wiringPiISR(29, INT_EDGE_SETUP, &interruptHandler29); break;
				case 30: wiringPiISR(30, INT_EDGE_SETUP, &interruptHandler30); break;
				case 31: wiringPiISR(31, INT_EDGE_SETUP, &interruptHandler31); break;

				default:
					_log.Log(LOG_ERROR, "GPIO: Error hooking interrupt handler for unknown GPIO %d.", it->GetId());
			}
		}
	}

	sOnConnected(this);

	_log.Log(LOG_NORM, "GPIO: WiringPi is now initialized");
	return (m_thread!=NULL);
}


bool CGpio::StopHardware()
{

	m_stoprequested=true;
	_log.Log(LOG_NORM, "'m_stoprequested=true;' Done");
/* XTH
	interruptCondition.notify_one();
	_log.Log(LOG_NORM, "'interruptCondition.notify_one();' Done");

    sleep_milliseconds(100);
	_log.Log(LOG_NORM, "'sleep_milliseconds(100);' Done");
*/

	if (m_thread != NULL) {
		m_thread->interrupt();
		m_thread->join();
	}

	boost::this_thread::sleep(boost::posix_time::millisec(500));
	_log.Log(LOG_NORM, "'sleep(500);' Done");

	m_bIsStarted=false;
	_log.Log(LOG_NORM, "'m_bIsStarted=false;' Done");
	
	return true;
}


void CGpio::WriteToHardware(const char *pdata, const unsigned char length)
{
	tRBUF *pCmd=(tRBUF*) pdata;

	if ((pCmd->LIGHTING1.packettype == pTypeLighting1) && (pCmd->LIGHTING1.subtype == sTypeIMPULS)) {
		unsigned char housecode = (pCmd->LIGHTING1.housecode);
		if (housecode == 0) {
			int gpioId = pCmd->LIGHTING1.unitcode;
			_log.Log(LOG_NORM,"GPIO: WriteToHardware housecode %d, packetlength %d", pCmd->LIGHTING1.housecode, pCmd->LIGHTING1.packetlength);

			int oldValue = digitalRead(gpioId);
			_log.Log(LOG_NORM,"GPIO: pin #%d state was %d", gpioId, oldValue);

			int newValue = (int)(pCmd->LIGHTING1.cmnd);
			digitalWrite(gpioId, newValue);

			_log.Log(LOG_NORM,"GPIO: WriteToHardware housecode %d, GPIO %d, previously %d, set %d", (int)housecode, (int)gpioId, oldValue, newValue);
		}
		else {
			_log.Log(LOG_NORM,"GPIO: wrong housecode %d", (int)housecode);
		}
	}
	else {
		_log.Log(LOG_NORM,"GPIO: WriteToHardware packet type %d or subtype %d unknown", pCmd->LIGHTING1.packettype, pCmd->LIGHTING1.subtype);
	}
}


void CGpio::ProcessInterrupt(int gpioId) {
	_log.Log(LOG_NORM, "GPIO: Processing interrupt for GPIO %d...", gpioId);

	// Read GPIO data
	int value = digitalRead(gpioId);

	if (value != 0) {
		IOPinStatusPacket.LIGHTING1.cmnd = light1_sOn;
	}
	else {
		IOPinStatusPacket.LIGHTING1.cmnd = light1_sOff;
	}

	unsigned char seqnr = IOPinStatusPacket.LIGHTING1.seqnbr;
	seqnr++;
	IOPinStatusPacket.LIGHTING1.seqnbr = seqnr;
	IOPinStatusPacket.LIGHTING1.unitcode = gpioId;

	sDecodeRXMessage(this, (const unsigned char *)&IOPinStatusPacket);

	_log.Log(LOG_NORM, "GPIO: Done processing interrupt for GPIO %d.", gpioId);
}


int waitAndGetGpioNumberToProcess()
{
    int interruptNumber = NO_INTERRUPT;

	boost::mutex::scoped_lock lock(interruptQueueMutex);

    if (gpioInterruptQueue.size() == 0) {
		_log.Log(LOG_NORM, "GPIO: Queue empty. Waiting...");
        interruptCondition.wait(lock);
		_log.Log(LOG_NORM, "GPIO: Waking up.");
    }
    else {
    	// acknowledge interrupt
    	interruptNumber = gpioInterruptQueue.front();
		_log.Log(LOG_NORM, "GPIO: Acknowledging interrupt for GPIO %d.", interruptNumber);
    	gpioInterruptQueue.erase(gpioInterruptQueue.begin());
    }
    _log.Log(LOG_NORM, "GPIO: (%d interrupts in queue)", gpioInterruptQueue.size());

	lock.unlock();
    return interruptNumber;
}


void CGpio::Do_Work()
{
	_log.Log(LOG_NORM,"GPIO: Worker started...");
	while (!m_stoprequested) {
    	int interruptNumber = waitAndGetGpioNumberToProcess();
		if (m_stoprequested) 
			break;
    	if (interruptNumber != NO_INTERRUPT) {
			// process
    		CGpio::ProcessInterrupt(interruptNumber);
        }
    	else {
    		// Does this really occur ?
    		_log.Log(LOG_NORM, "GPIO: Got an interrupt processing request but no GPIO number...");
    		boost::this_thread::sleep(boost::posix_time::millisec(500));
    	}
    }
	_log.Log(LOG_NORM,"GPIO: Worker stopped...");
}


/*
 * static
 * One-shot method to initialize pins
 *
 */

bool CGpio::InitPins()
{
	char buf[256];
	bool exports[30];	
	int gpioNumber;
	int i;

	// 1. List exports
	for (i = 0; i < sizeof(exports); i++) {
		exports[i] = false;
	}
	
	FILE *cmd = popen("gpio exports", "r");
	
	// And parse the result
	while (fgets(buf, sizeof(buf), cmd) != 0) {		
		// Decode GPIO pin number from the output formatted as follows:
		//
		// GPIO Pins exported:
		//   17: out  0  none
		//   18: in   1  none
		//
		// 00000000001111111111
		// 01234567890123456789

//		std::string exportLine(buf);
//		std::cout << "Processing line: " << exportLine;
		
		// check if not on header line
		if (buf[4] == ':') {
			buf[4] = '\0';
			gpioNumber = atoi(buf);
			if (gpioNumber >= 0) {
				exports[gpioNumber] = true;
			}
		}
	}
	if (pclose(cmd) != 0) {
	    _log.Log(LOG_ERROR, "GPIO: Error calling 'gpio exports'!");
		return false;
	}
	else {	
		// 2. List the full pin set
		
		// Execute the command "gpio readall"
		FILE *cmd = popen("gpio readall", "r");
		
		// And parse the result
		while (fgets(buf, sizeof(buf), cmd) != 0) {
			// Decode IN and OUT lines from the output formatted as follows:
			// 
			// +----------+-Rev1-+------+--------+------+-------+
			// | wiringPi | GPIO | Phys | Name   | Mode | Value |
			// +----------+------+------+--------+------+-------+
			// |      0   |  17  |  11  | GPIO 0 | OUT  | Low   |
			// |      1   |  18  |  12  | GPIO 1 | IN   | High  |
			// |      2   |  21  |  13  | GPIO 2 | IN   | Low   |
			// |      3   |  22  |  15  | GPIO 3 | IN   | Low   |
			// |      4   |  23  |  16  | GPIO 4 | IN   | Low   |
			// |      5   |  24  |  18  | GPIO 5 | IN   | Low   |
			// |      6   |  25  |  22  | GPIO 6 | IN   | High  |
			// |      7   |   4  |   7  | GPIO 7 | IN   | Low   |
			// |      8   |   0  |   3  | SDA    | IN   | High  |
			// |      9   |   1  |   5  | SCL    | IN   | High  |
			// |     10   |   8  |  24  | CE0    | IN   | High  |
			// |     11   |   7  |  26  | CE1    | IN   | High  |
			// |     12   |  10  |  19  | MOSI   | IN   | Low   |
			// |     13   |   9  |  21  | MISO   | IN   | Low   |
			// |     14   |  11  |  23  | SCLK   | IN   | High  |
			// |     15   |  14  |   8  | TxD    | ALT0 | High  |
			// |     16   |  15  |  10  | RxD    | ALT0 | High  |
			// +----------+------+------+--------+------+-------+
			//
			// 00000000001111111111222222222233333333334444444444
			// 01234567890123456789012345678901234567890123456789
			
			std::string line(buf);
//			std::cout << "Processing line: " << line;	
			
			std::vector<std::string> fields;
			StringSplit(line, "|", fields);
			// Check if we're on a separator line (starting with '+')
//			std::cout << "# fields: " << fields.size() << std::endl;
			if (fields.size()==7) {
				// trim each field
				for (int i = 0; i < fields.size(); i++) {
					boost::algorithm::trim(fields[i]);
//					std::cout << "fields[" << i << "] = " << fields[i] << std::endl;
				}
				// check if not on header line
				if (fields[0] != "wiringPi") {
					std::string connector("P1");
					if (   (fields[0] == "17")
						|| (fields[0] == "18")
						|| (fields[0] == "19")
						|| (fields[0] == "20")
					   ) {
						connector = "P2";
					}
					gpioNumber = atoi(fields[1].c_str());
					if (gpioNumber >= 0) {
						pins.push_back(CGpioPin(gpioNumber, fields[3] + " on pin " + connector + "." + fields[2], fields[4] == "IN", fields[4] == "OUT", exports[gpioNumber]));
					}
				}
			}
		}
// debug
//		for(std::vector<CGpioPin>::iterator it = pins.begin(); it != pins.end(); ++it) {
//			CGpioPin pin=*it;
//			std::cout << "Pin " << pin.GetId() << " : " << pin.GetLabel() << ", " << pin.GetIsInput() << ", " << pin.GetIsOutput() << ", " << pin.GetIsExported() << std::endl;
//		}
		if (pclose(cmd) != 0) {
		    _log.Log(LOG_ERROR, "GPIO: Error calling 'gpio readall'!");
			return false;
		}
	}
	return true;
}

/* static */
std::vector<CGpioPin> CGpio::GetPinList()
{
	return pins;
}

/* static */
CGpioPin* CGpio::GetPPinById(int id)
{
	for(std::vector<CGpioPin>::iterator it = pins.begin(); it != pins.end(); ++it) {
		if (it->GetId() == id) {
			return &(*it);
		}
	}
	return NULL;
}



// Make sure init is done once at startup
bool dummy = CGpio::InitPins();

#endif // WITH_GPIO
