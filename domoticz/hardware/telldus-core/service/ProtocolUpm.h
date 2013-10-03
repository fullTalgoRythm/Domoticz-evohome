//
// Copyright (C) 2012 Telldus Technologies AB. All rights reserved.
//
// Copyright: See COPYING file that comes with this distribution
//
//
#ifndef TELLDUS_CORE_SERVICE_PROTOCOLUPM_H_
#define TELLDUS_CORE_SERVICE_PROTOCOLUPM_H_

#include <string>
#include "service/Protocol.h"

class ProtocolUpm : public Protocol {
public:
	int methods() const;
	virtual std::string getStringForMethod(int method, unsigned char data, Controller *controller);
};

#endif  // TELLDUS_CORE_SERVICE_PROTOCOLUPM_H_
