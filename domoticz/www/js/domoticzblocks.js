

// Extensions to Blockly's language and JavaScript generator.

Blockly.JavaScript = Blockly.Generator.get('JavaScript');

var switchesAF = [];
var switchesGL = [];
var switchesMR = [];
var switchesSZ = [];

var temperatures = [];
var humidity = [];
var barometer = [];
var weather = [];
var utilities = [];
var scenes = [];
var groups = [];

$.ajax({
	url: "json.htm?type=devices&filter=light&used=true&order=Name", 
	async: false, 
	dataType: 'json',
	success: function(data) {
		if (typeof data.result != 'undefined') {
			$.each(data.result, function(i,item){
				if ("ghijkl".indexOf(item.Name.charAt(0).toLowerCase()) > -1) {
					switchesGL.push([item.Name,item.idx])
				}
				else if ("mnopqr".indexOf(item.Name.charAt(0).toLowerCase()) > -1) {
					switchesMR.push([item.Name,item.idx])
				}
				else if ("stuvwxyz".indexOf(item.Name.charAt(0).toLowerCase()) > -1) {
					switchesSZ.push([item.Name,item.idx])
				}
				// numbers etc with the a list
				else {
					switchesAF.push([item.Name,item.idx])
				}

			})
		}
	}
});

if (switchesAF.length === 0) {switchesAF.push(["No devices found",0]);}
if (switchesGL.length === 0) {switchesGL.push(["No devices found",0]);}
if (switchesMR.length === 0) {switchesMR.push(["No devices found",0]);}
if (switchesSZ.length === 0) {switchesSZ.push(["No devices found",0]);}

$.ajax({
	url: "json.htm?type=devices&filter=temp&used=true&order=Name", 
	async: false, 
	dataType: 'json',
	success: function(data) {
		if (typeof data.result != 'undefined') {
			$.each(data.result, function(i,item){
				if (item.Type.toLowerCase().indexOf("temp") >= 0) {
					temperatures.push([item.Name,item.idx])
				}
				if ((item.Type == "RFXSensor") && (item.SubType == "Temperature")) {
					temperatures.push([item.Name,item.idx])
				}
				if (item.Type.toLowerCase().indexOf("hum") >= 0) {
					humidity.push([item.Name,item.idx])
				}
				if (item.Type.toLowerCase().indexOf("baro") >= 0) {
					barometer.push([item.Name,item.idx])
				}
			})
		}
	}
});

$.ajax({
	url: "json.htm?type=devices&filter=weather&used=true&order=Name", 
	async: false, 
	dataType: 'json',
	success: function(data) {
		if (typeof data.result != 'undefined') {
			$.each(data.result, function(i,item){
				weather.push([item.Name,item.idx])
			})
		}
	}
});

$.ajax({
	url: "json.htm?type=devices&filter=utility&used=true&order=Name", 
	async: false, 
	dataType: 'json',
	success: function(data) {
		if (typeof data.result != 'undefined') {
			$.each(data.result, function(i,item){
				utilities.push([item.Name,item.idx])
			})
		}
	}
});

$.ajax({
	url: "json.htm?type=scenes&order=Name", 
	async: false, 
	dataType: 'json',
	success: function(data) {
		if (typeof data.result != 'undefined') {
			$.each(data.result, function(i,item){
				if (item.Type == 'Scene') {
					scenes.push([item.Name,item.idx])
				}
				else if (item.Type == 'Group') {
					groups.push([item.Name,item.idx])
				}
			})
		}
	}
});

if (temperatures.length === 0) {temperatures.push(["No temperatures found",0]);}
if (humidity.length === 0) {humidity.push(["No humidity found",0]);}
if (barometer.length === 0) {barometer.push(["No barometer found",0]);}
if (weather.length === 0) {weather.push(["No weather found",0]);}
if (utilities.length === 0) {utilities.push(["No utilities found",0]);}
if (groups.length === 0) {groups.push(["No groups found",0]);}
if (scenes.length === 0) {scenes.push(["No scenes found",0]);}

switchesAF.sort();
switchesGL.sort();
switchesMR.sort();
switchesSZ.sort();

temperatures.sort();
humidity.sort();
barometer.sort();
weather.sort();
utilities.sort();
groups.sort();
scenes.sort();

Blockly.Language.switchvariablesAF = {
  // Variable getter.
  category: null,  // Variables are handled specially.
  init: function() {
    this.setColour(30);
    this.appendDummyInput()
	    .appendTitle('A-F ')    
        .appendTitle(new Blockly.FieldDropdown(switchesAF), 'Switch');
    this.setOutput(true, null);
    this.setTooltip(Blockly.DOMOTICZSWITCHES_TOOLTIP);
  }
 };

Blockly.Language.switchvariablesGL = {
  // Variable getter.
  category: null,  // Variables are handled specially.
  init: function() {
    this.setColour(30);
    this.appendDummyInput()
	    .appendTitle('G-L ')
        .appendTitle(new Blockly.FieldDropdown(switchesGL), 'Switch');
    this.setOutput(true, null);
    this.setTooltip(Blockly.DOMOTICZSWITCHES_TOOLTIP);
  }
 };
 
 Blockly.Language.switchvariablesMR = {
  // Variable getter.
  category: null,  // Variables are handled specially.
  init: function() {
    this.setColour(30);
    this.appendDummyInput()
	    .appendTitle('M-R ')
        .appendTitle(new Blockly.FieldDropdown(switchesMR), 'Switch');
    this.setOutput(true, null);
    this.setTooltip(Blockly.DOMOTICZSWITCHES_TOOLTIP);
  }
 };

 Blockly.Language.switchvariablesSZ = {
  // Variable getter.
  category: null,  // Variables are handled specially.
  init: function() {
    this.setColour(30);
    this.appendDummyInput()
	    .appendTitle('S-Z ')
        .appendTitle(new Blockly.FieldDropdown(switchesSZ), 'Switch');
    this.setOutput(true, null);
    this.setTooltip(Blockly.DOMOTICZSWITCHES_TOOLTIP);
  }
 };

Blockly.Language.domoticzcontrols_if = {
  category: null,  // Variables are handled specially.
  init: function() {
    this.setColour(120);
    this.appendValueInput('IF0')
        .appendTitle(Blockly.DOMOTICZCONTROLS_MSG_IF);
    this.appendStatementInput('DO0')
        .appendTitle(Blockly.DOMOTICZCONTROLS_MSG_DO);
    this.setTooltip(Blockly.DOMOTICZCONTROLS_IF_TOOLTIP);
    //this.setPreviousStatement(true);
    //this.setNextStatement(true);
  }
 };
 
Blockly.Language.domoticzcontrols_ifelseif = {
  // If/elseif/else condition.
  helpUrl: Blockly.LANG_CONTROLS_IF_HELPURL,
  init: function() {
    this.setColour(120);
    this.appendValueInput('IF0')
        .appendTitle(Blockly.DOMOTICZCONTROLS_MSG_IF);
    this.appendStatementInput('DO0')
        .appendTitle(Blockly.DOMOTICZCONTROLS_MSG_DO);
    this.setMutator(new Blockly.Mutator(['controls_if_elseif']));
    // Assign 'this' to a variable for use in the tooltip closure below.
    this.setTooltip(Blockly.DOMOTICZCONTROLS_IF_TOOLTIP);
    this.elseifCount_ = 0;
    this.elseCount_ = 0;
  },
  mutationToDom: function() {
    if (!this.elseifCount_) {
      return null;
    }
    var container = document.createElement('mutation');
    if (this.elseifCount_) {
      container.setAttribute('elseif', this.elseifCount_);
    }
    return container;
  },
  domToMutation: function(xmlElement) {
    this.elseifCount_ = window.parseInt(xmlElement.getAttribute('elseif'), 10);
    for (var x = 1; x <= this.elseifCount_; x++) {
      this.appendValueInput('IF' + x)
          .appendTitle(Blockly.DOMOTICZCONTROLS_MSG_ELSEIF);
      this.appendStatementInput('DO' + x)
          .appendTitle(Blockly.DOMOTICZCONTROLS_MSG_DO);
    }
  },
  decompose: function(workspace) {
    var containerBlock = new Blockly.Block(workspace, 'controls_if_if');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var x = 1; x <= this.elseifCount_; x++) {
      var elseifBlock = new Blockly.Block(workspace, 'controls_if_elseif');
      elseifBlock.initSvg();
      connection.connect(elseifBlock.previousConnection);
      connection = elseifBlock.nextConnection;
    }
    return containerBlock;
  },
  compose: function(containerBlock) {
    // Disconnect all the elseif input blocks and remove the inputs.
    for (var x = this.elseifCount_; x > 0; x--) {
      this.removeInput('IF' + x);
      this.removeInput('DO' + x);
    }
    this.elseifCount_ = 0;
    // Rebuild the block's optional inputs.
    var clauseBlock = containerBlock.getInputTargetBlock('STACK');
    while (clauseBlock) {
      switch (clauseBlock.type) {
        case 'controls_if_elseif':
          this.elseifCount_++;
          var ifInput = this.appendValueInput('IF' + this.elseifCount_)
              .appendTitle(Blockly.DOMOTICZCONTROLS_MSG_ELSEIF);
          var doInput = this.appendStatementInput('DO' + this.elseifCount_);
          doInput.appendTitle(Blockly.DOMOTICZCONTROLS_MSG_DO);
          // Reconnect any child blocks.
          if (clauseBlock.valueConnection_) {
            ifInput.connection.connect(clauseBlock.valueConnection_);
          }
          if (clauseBlock.statementConnection_) {
            doInput.connection.connect(clauseBlock.statementConnection_);
          }
          break;
        default:
          throw 'Unknown block type.';
      }
      clauseBlock = clauseBlock.nextConnection &&
          clauseBlock.nextConnection.targetBlock();
    }
  },
  saveConnections: function(containerBlock) {
    // Store a pointer to any connected child blocks.
    var clauseBlock = containerBlock.getInputTargetBlock('STACK');
    var x = 1;
    while (clauseBlock) {
      switch (clauseBlock.type) {
        case 'controls_if_elseif':
          var inputIf = this.getInput('IF' + x);
          var inputDo = this.getInput('DO' + x);
          clauseBlock.valueConnection_ =
              inputIf && inputIf.connection.targetConnection;
          clauseBlock.statementConnection_ =
              inputDo && inputDo.connection.targetConnection;
          x++;
          break;
        default:
          throw 'Unknown block type.';
      }
      clauseBlock = clauseBlock.nextConnection &&
          clauseBlock.nextConnection.targetBlock();
    }
  }
};
 

Blockly.Language.temperaturevariables = {
  // Variable getter.
  category: null,  // Variables are handled specially.
  init: function() {
    this.setColour(330);
    this.appendDummyInput()
        .appendTitle(new Blockly.FieldDropdown(temperatures), 'Temperature');
    this.appendDummyInput()
	    .appendTitle(Blockly.DOMOTICZCONTROLS_MSG_TEMP,'TemperatureLabel');
	this.setInputsInline(true);
    this.setOutput(true, null);
    this.setTooltip(Blockly.DOMOTICZVARIABLES_TEMPERATURE_TOOLTIP);
  }
 };

Blockly.Language.humidityvariables = {
  // Variable getter.
  category: null,  // Variables are handled specially.
  init: function() {
    this.setColour(226);
    this.appendDummyInput()
        .appendTitle(new Blockly.FieldDropdown(humidity), 'Humidity');
    this.appendDummyInput()
	    .appendTitle(Blockly.DOMOTICZCONTROLS_MSG_HUM,'HumidityLabel');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setTooltip(Blockly.DOMOTICZVARIABLES_HUMIDITY_TOOLTIP);
  }
 };

Blockly.Language.barometervariables = {
  // Variable getter.
  category: null,  // Variables are handled specially.
  init: function() {
    this.setColour(68);
    this.appendDummyInput()
        .appendTitle(new Blockly.FieldDropdown(barometer), 'Barometer');
    this.appendDummyInput()
	    .appendTitle(Blockly.DOMOTICZCONTROLS_MSG_BARO,'BarometerLabel');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setTooltip(Blockly.DOMOTICZVARIABLES_BAROMETER_TOOLTIP);    
  }
 };

Blockly.Language.weathervariables = {
  // Variable getter.
  category: null,  // Variables are handled specially.
  init: function() {
    this.setColour(210);
    this.appendDummyInput()
        .appendTitle(new Blockly.FieldDropdown(weather), 'Weather');
    this.setOutput(true, null);
    this.setTooltip(Blockly.DOMOTICZVARIABLES_WEATHER_TOOLTIP); 
  }
 };
 
Blockly.Language.utilityvariables = {
  // Variable getter.
  category: null,  // Variables are handled specially.
  init: function() {
    this.setColour(290);
    this.appendDummyInput()
        .appendTitle(new Blockly.FieldDropdown(utilities), 'Utility');
    this.appendDummyInput()
	    .appendTitle(Blockly.DOMOTICZCONTROLS_MSG_UTILITY,'UtilityLabel');
	this.setInputsInline(true);
    this.setOutput(true, null);
    this.setTooltip(Blockly.DOMOTICZVARIABLES_UTILITY_TOOLTIP); 
  }
 };

Blockly.Language.scenevariables = {
  // Variable getter.
  category: null,  // Variables are handled specially.
  init: function() {
    this.setColour(100);
    this.setPreviousStatement(true);
    this.setNextStatement(true);     
    this.appendDummyInput()
	    .appendTitle(Blockly.DOMOTICZCONTROLS_MSG_SET)
	    .appendTitle(Blockly.DOMOTICZCONTROLS_MSG_SCENE)
        .appendTitle(new Blockly.FieldDropdown(scenes), 'Scene')
        .appendTitle(" = ")
    	.appendTitle(new Blockly.FieldDropdown(this.STATE), 'Status');
    this.setInputsInline(true);
    this.setTooltip(Blockly.DOMOTICZVARIABLES_SCENES_TOOLTIP);
  }
 };

Blockly.Language.scenevariables.STATE =
    [["Active", 'Active'],
    ["Inactive",'Inactive'],
     ["On", 'On']]; 
 
Blockly.Language.groupvariables = {
  // Variable getter.
  category: null,  // Variables are handled specially.
  init: function() {
    this.setColour(200);
    this.setPreviousStatement(true);
    this.setNextStatement(true);   
    this.appendDummyInput()
	    .appendTitle(Blockly.DOMOTICZCONTROLS_MSG_SET)
	    .appendTitle(Blockly.DOMOTICZCONTROLS_MSG_GROUP)
        .appendTitle(new Blockly.FieldDropdown(groups), 'Group')
        .appendTitle(" = ")
    	.appendTitle(new Blockly.FieldDropdown(this.STATE), 'Status');        
    this.setInputsInline(true);
    this.setTooltip(Blockly.DOMOTICZVARIABLES_GROUPS_TOOLTIP);
  }
 };

Blockly.Language.groupvariables.STATE =
    [["Active", 'Active'],
    ["Inactive",'Inactive'],
    ["On",'On'],
     ["Off", 'Off']]; 

Blockly.Language.logic_states = {
  helpUrl: null,
  init: function() {
    this.setColour(120);
    this.setOutput(true, null);
    this.appendDummyInput()
        .appendTitle(new Blockly.FieldDropdown(this.STATES), 'State');
    this.setTooltip(Blockly.DOMOTICZ_STATES_TOOLTIP);    
  }
};

Blockly.Language.logic_set = {
  // Comparison operator.
  init: function() {
    this.setColour(120);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendValueInput('A')
    	.appendTitle(Blockly.DOMOTICZCONTROLS_MSG_SET);
    this.appendValueInput('B')
        .appendTitle("=");
    this.setInputsInline(true);
    this.setTooltip(Blockly.DOMOTICZ_LOGIC_SET_TOOLTIP);

  }
};

Blockly.Language.logic_setdelayed = {
  // Comparison operator.
  init: function() {
    this.setColour(120);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendValueInput('A')
    	.appendTitle(Blockly.DOMOTICZCONTROLS_MSG_SET);
    this.appendValueInput('B')
        .appendTitle("=");
    this.appendValueInput('C')
        .appendTitle(Blockly.DOMOTICZCONTROLS_MSG_FOR);
    this.appendDummyInput()
	    .appendTitle(Blockly.DOMOTICZCONTROLS_MSG_MINUTES);
    this.setInputsInline(true);
    this.setTooltip(Blockly.DOMOTICZ_LOGIC_SETDELAYED_TOOLTIP);
  }
};

Blockly.Language.logic_setrandom = {
  // Comparison operator.
  init: function() {
    this.setColour(120);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendValueInput('A')
    	.appendTitle(Blockly.DOMOTICZCONTROLS_MSG_SET);
    this.appendValueInput('B')
        .appendTitle("=");
    this.appendValueInput('C')
        .appendTitle(Blockly.DOMOTICZCONTROLS_MSG_RANDOM);
    this.appendDummyInput()
	    .appendTitle(Blockly.DOMOTICZCONTROLS_MSG_MINUTES);
    this.setInputsInline(true);
    this.setTooltip(Blockly.DOMOTICZ_LOGIC_SETRANDOM_TOOLTIP);
  }
};

Blockly.Language.logic_setlevel = {
  init: function() {
    this.setColour(120);
    this.appendDummyInput()
    	.appendTitle(Blockly.DOMOTICZCONTROLS_MSG_SETLEVEL);
    this.appendDummyInput()
        .appendTitle(new Blockly.FieldTextInput('0',
        this.percentageValidator), 'NUM');
    this.setOutput(true, 'Number');
    this.setInputsInline(true);
    this.setTooltip(Blockly.DOMOTICZ_LOGIC_SETLEVEL_TOOLTIP);
  }
};

Blockly.Language.logic_setlevel.percentageValidator = function(text) {
  
  var n = parseFloat(text || 0);
  if (!isNaN(n)) {
	  if (n > 100) { n = 100}
	  if (n < 0) { n = 0}
  }
  
  return isNaN(n) ? null : String(n);
};


Blockly.Language.logic_timeofday = {
  // Comparison operator.
  init: function() {
    this.setColour(120);
    this.setOutput(true, null);
    this.appendValueInput(Blockly.DOMOTICZCONTROLS_MSG_TIME)
    	.appendTitle("Time:")
    	.appendTitle(new Blockly.FieldDropdown(this.OPERATORS), 'OP');
    this.setInputsInline(true);
    var thisBlock = this;
    this.setTooltip(function() {
      var op = thisBlock.getTitleValue('OP');
      return thisBlock.TOOLTIPS[op];
    });
  }
}; 

Blockly.Language.logic_timevalue = {
  init: function() {
    this.setColour(230);
    this.appendDummyInput()
        .appendTitle(new Blockly.FieldTextInput('00:00',
        this.TimeValidator), 'TEXT');
    this.setOutput(true, 'String');
    this.setTooltip(Blockly.DOMOTICZ_LOGIC_TIMEVALUE_TOOLTIP);
  }
};

Blockly.Language.logic_timevalue.TimeValidator = function(text) {
  if (text.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]/)) return text;
  return "00:00";
};


Blockly.Language.logic_timeofday.TOOLTIPS = {
  EQ: Blockly.LANG_LOGIC_COMPARE_TOOLTIP_EQ,
  NEQ: Blockly.LANG_LOGIC_COMPARE_TOOLTIP_NEQ,
  LT: Blockly.LANG_LOGIC_COMPARE_TOOLTIP_LT,
  LTE: Blockly.LANG_LOGIC_COMPARE_TOOLTIP_LTE,
  GT: Blockly.LANG_LOGIC_COMPARE_TOOLTIP_GT,
  GTE: Blockly.LANG_LOGIC_COMPARE_TOOLTIP_GTE
};


Blockly.Language.logic_weekday = {
  // Variable getter.
  init: function() {
    this.setColour(120);
    this.setOutput(true, null);
    this.appendDummyInput()
	    .appendTitle(Blockly.DOMOTICZCONTROLS_MSG_DAY)
	    .appendTitle(new Blockly.FieldDropdown(this.OPERATORS), 'OP')
	    .appendTitle(" ")
    	.appendTitle(new Blockly.FieldDropdown(this.DAYS), 'Weekday');
    this.setTooltip(Blockly.DOMOTICZ_LOGIC_WEEKDAY_TOOLTIP);
    }
 };   

Blockly.Language.logic_sunrisesunset = {
  init: function() {
	this.setOutput(true, null);
    this.setColour(230);
    this.appendDummyInput()
        .appendTitle(new Blockly.FieldDropdown(this.VALUES), 'SunriseSunset')
	    .appendTitle(" ");
    this.setTooltip(Blockly.DOMOTICZ_LOGIC_SUNRISESUNSET_TOOLTIP);
  }
 };
 
Blockly.Language.logic_notification_priority = {
  init: function() {
	this.setOutput(true, null);
    this.setColour(230);
    this.appendDummyInput()
        .appendTitle(new Blockly.FieldDropdown(this.PRIORITY), 'NotificationPriority')
	    .appendTitle(" ");
    this.setTooltip(Blockly.DOMOTICZ_LOGIC_NOTIFICATION_PRIORITY_TOOLTIP);
  }
 };

Blockly.Language.send_notification = {
  // Comparison operator.
  init: function() {
    this.setColour(120);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendValueInput('notificationTextSubject')
    	.appendTitle("Send notification with subject:");
    this.appendValueInput('notificationTextBody')
    	.appendTitle("and message:");
    this.appendDummyInput()
	    .appendTitle("with priority:")
    	.appendTitle(new Blockly.FieldDropdown(Blockly.Language.logic_notification_priority.PRIORITY), 'notificationPriority');
    this.appendDummyInput()
	    .appendTitle("with sound (Pushover):")
    	.appendTitle(new Blockly.FieldDropdown(Blockly.Language.logic_notification_priority.SOUND), 'notificationSound');
	this.setInputsInline(true);
    this.setTooltip(Blockly.DOMOTICZ_LOGIC_NOTIFICATION_TOOLTIP);

  }
};

Blockly.Language.send_email = {
  // Comparison operator.
  init: function() {
    this.setColour(120);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendDummyInput()
	    .appendTitle("Send email with subject:")
    	.appendTitle(new Blockly.FieldTextInput(''), 'TextSubject');
    this.appendDummyInput()
	    .appendTitle("and message:")
    	.appendTitle(new Blockly.FieldTextInput(''), 'TextBody');
    this.appendDummyInput()
	    .appendTitle("to:")
    	.appendTitle(new Blockly.FieldTextInput(''), 'TextTo');
    this.setInputsInline(true);
    this.setTooltip(Blockly.DOMOTICZ_LOGIC_EMAIL_TOOLTIP);
  }
};

Blockly.Language.open_url = {
  // Comparison operator.
  init: function() {
    this.setColour(120);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendValueInput('urlToOpen')
    	.appendTitle("Open url:");
    this.setInputsInline(true);
    this.setTooltip(Blockly.DOMOTICZ_LOGIC_OPENURL_TOOLTIP);

  }
};

Blockly.Language.url_text = {
  // Text value.
  init: function() {
    this.setColour(160);
    this.appendDummyInput()
        .appendTitle("http://")
        .appendTitle(new Blockly.FieldTextInput('',this.URLValidator), 'TEXT')
       this.setOutput(true, 'String');
    this.setTooltip(Blockly.DOMOTICZ_LOGIC_URL_TEXT_TOOLTIP);
  }
};

Blockly.Language.url_text.URLValidator = function(text) {
  if (text.substr(0, 7).toLowerCase() == "http://") {
  	text = text.substr(7);
  }
  return text; 
 
};


Blockly.Language.security_status = {
  // Variable getter.
  init: function() {
    this.setColour(120);
    this.setOutput(true, null);
    this.appendDummyInput()
	    .appendTitle(Blockly.DOMOTICZCONTROLS_MSG_SECURITY)
	    .appendTitle(new Blockly.FieldDropdown(this.OPERATORS), 'OP')
	    .appendTitle(" ")
    	.appendTitle(new Blockly.FieldDropdown(this.STATE), 'Status');
    this.setTooltip(Blockly.DOMOTICZ_SECURITY_STATUS_TOOLTIP);
    }
 };

Blockly.Language.security_status.STATE =
    [["Disarmed", '0'],
    ["Armed Home",'1'],
     ["Armed Away", '2']];
     
Blockly.Language.security_status.OPERATORS =
    [['=', 'EQ'],
     ['\u2260', 'NEQ']];
  
  
Blockly.Language.logic_weekday.DAYS =
    [["Monday", '2'],
    ["Tuesday",'3'],
    ["Wednesday",'4'],
    ["Thursday",'5'],
    ["Friday",'6'],
    ["Saturday",'7'],
     ["Sunday", '1']];

Blockly.Language.logic_sunrisesunset.VALUES =
    [["Sunrise", 'Sunrise'],
    ["Sunset",'Sunset']];
    
Blockly.Language.logic_notification_priority.PRIORITY =
    [["-2 (Prowl/NMA: Very Low, Pushover: N/A)", '-2'],
    ["-1 (Prowl/NMA: Moderate, Pushover:Quiet)",'-1'],
    ["0 (All: Normal)",'0'],
    ["1 (All: High)",'1'],
    ["2 (Prowl/NMA: Emergency, Pushover: confirm)",'2']];   
 
Blockly.Language.logic_notification_priority.SOUND =
    [["Pushover (default)", 'pushover'],
    ["Bike",'bike'],
    ["Bugle",'bugle'],
	["Cash Register",'cashregister'],
	["Classical",'classical'],
	["Cash Register",'cashregister'],
    ["Cosmic",'cosmic'],
    ["Falling",'falling'],
    ["Gamelan",'gamelan'],
    ["Incoming",'incoming'],
    ["Intermission",'intermission'],
    ["Magic",'magic'],
    ["Mechanical",'mechanical'],
    ["Piano Bar",'pianobar'],
    ["Siren",'siren'],
    ["Space Alarm",'spacealarm'],
    ["Tug Boat",'tugboat'],
    ["Alien Alarm (long)",'alien'],
    ["Climb (long)",'climb'],
    ["Persistent (long)",'persistent'],
    ["Pushover Echo (long)",'echo'],
    ["Up Down (long)",'updown'],
    ["None (silent)",'none']];

 
Blockly.Language.logic_states.STATES =
    [["On", 'On'],
     ["Off", 'Off'],
     ["Group On", 'Group On'],
     ["Group Off", 'Group Off'],
     ["Open", 'Open'],
     ["Closed", 'Closed'],
     ["Panic", 'Panic'],
     ["Panic End", 'Panic End'],
     ["Normal", 'Normal'],
     ["Alarm", 'Alarm'],
     ["Motion", 'Motion'],
	 ["No Motion", 'No Motion'],
     ["Chime", 'Chime']]; 

Blockly.Language.logic_weekday.OPERATORS =
    [['=', 'EQ'],
     ['\u2260', 'NEQ'],
     ['<', 'LT'],
     ['\u2264', 'LTE'],
     ['>', 'GT'],
     ['\u2265', 'GTE']];  


 Blockly.Language.logic_timeofday.OPERATORS =
    [['=', 'EQ'],
     ['\u2260', 'NEQ'],
     ['<', 'LT'],
     ['\u2264', 'LTE'],
     ['>', 'GT'],
     ['\u2265', 'GTE']];



