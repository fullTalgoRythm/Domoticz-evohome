define(['app'], function (app) {
	app.controller('HardwareController', [ '$scope', '$rootScope', '$location', '$http', '$interval', function($scope,$rootScope,$location,$http,$interval) {

		DeleteHardware = function(idx)
		{
			bootbox.confirm($.i18n("Are you sure to delete this Hardware?\n\nThis action can not be undone...\nAll Devices attached will be removed!"), function(result) {
				if (result==true) {
					$.ajax({
						 url: "json.htm?type=command&param=deletehardware&idx=" + idx,
						 async: false, 
						 dataType: 'json',
						 success: function(data) {
							RefreshHardwareTable();
						 },
						 error: function(){
								HideNotify();
								ShowNotify($.i18n('Problem deleting hardware!'), 2500, true);
						 }     
					});
				}
			});
		}

		UpdateHardware= function(idx,Mode1,Mode2,Mode3,Mode4,Mode5)
		{
			var name=$("#hardwarecontent #hardwareparamstable #hardwarename").val();
			if (name=="")
			{
				ShowNotify($.i18n('Please enter a Name!'), 2500, true);
				return;
			}

			var hardwaretype=$("#hardwarecontent #hardwareparamstable #combotype option:selected").val();
			if (typeof hardwaretype == 'undefined') {
				ShowNotify($.i18n('Unknown device selected!'), 2500, true);
				return;
			}
			
			var bEnabled=$('#hardwarecontent #hardwareparamstable #enabled').is(":checked");
			
			var datatimeout=$('#hardwarecontent #hardwareparamstable #combodatatimeout').val();
			
			var text = $("#hardwarecontent #hardwareparamstable #combotype option:selected").text();
			if ((text.indexOf("TE923") >= 0)||(text.indexOf("Volcraft") >= 0)||(text.indexOf("1-Wire") >= 0)||(text.indexOf("BMP085") >= 0)||(text.indexOf("Dummy") >= 0)||(text.indexOf("PiFace") >= 0)||(text.indexOf("Motherboard") >= 0))
			{
				$.ajax({
					 url: "json.htm?type=command&param=updatehardware&htype=" + hardwaretype +
						"&port=1&name=" + name + 
						"&enabled=" + bEnabled + 
						"&idx=" + idx +
						"&datatimeout=" + datatimeout +
						"&Mode1=" + Mode1 + "&Mode2=" + Mode2 + "&Mode3=" + Mode3 + "&Mode4=" + Mode4 + "&Mode5=" + Mode5,
					 async: false, 
					 dataType: 'json',
					 success: function(data) {
						RefreshHardwareTable();
					 },
					 error: function(){
							ShowNotify($.i18n('Problem updating hardware!'), 2500, true);
					 }     
				});
			}
			else if (text.indexOf("USB") >= 0)
			{
				var serialport=$("#hardwarecontent #divserial #comboserialport option:selected").val();
				if (typeof serialport == 'undefined')
				{
					ShowNotify($.i18n('No serial port selected!'), 2500, true);
					return;
				}
				$.ajax({
					 url: "json.htm?type=command&param=updatehardware&htype=" + hardwaretype +
						"&port=" + serialport + 
						"&name=" + name + 
						"&enabled=" + bEnabled + 
						"&idx=" + idx +
						"&datatimeout=" + datatimeout +
						"&Mode1=" + Mode1 + "&Mode2=" + Mode2 + "&Mode3=" + Mode3 + "&Mode4=" + Mode4 + "&Mode5=" + Mode5,
					 async: false, 
					 dataType: 'json',
					 success: function(data) {
						RefreshHardwareTable();
					 },
					 error: function(){
							ShowNotify($.i18n('Problem updating hardware!'), 2500, true);
					 }     
				});
			}
			else if (text.indexOf("LAN") >= 0 && text.indexOf("YouLess") == -1)
			{
				var address=$("#hardwarecontent #divremote #tcpaddress").val();
				if (address=="")
				{
					ShowNotify($.i18n('Please enter an Address!'), 2500, true);
					return;
				}
				var port=$("#hardwarecontent #divremote #tcpport").val();
				if (port=="")
				{
					ShowNotify($.i18n('Please enter an Port!'), 2500, true);
					return;
				}
				var intRegex = /^\d+$/;
				if(!intRegex.test(port)) {
					ShowNotify($.i18n('Please enter an Valid Port!'), 2500, true);
					return;
				}		
				$.ajax({
					 url: "json.htm?type=command&param=updatehardware&htype=" + hardwaretype + 
						"&address=" + address + 
						"&port=" + port + 
						"&name=" + name + 
						"&enabled=" + bEnabled + 
						"&idx=" + idx + 
						"&datatimeout=" + datatimeout +
						"&Mode1=" + Mode1 + "&Mode2=" + Mode2 + "&Mode3=" + Mode3 + "&Mode4=" + Mode4 + "&Mode5=" + Mode5,
					 async: false, 
					 dataType: 'json',
					 success: function(data) {
						RefreshHardwareTable();
					 },
					 error: function(){
							ShowNotify($.i18n('Problem updating hardware!'), 2500, true);
					 }     
				});
			}
			else if (text.indexOf("LAN") >= 0 && text.indexOf("YouLess") >= 0 )
			{
				var address=$("#hardwarecontent #divremote #tcpaddress").val();
				if (address=="")
				{
					ShowNotify($.i18n('Please enter an Address!'), 2500, true);
					return;
				}
				var port=$("#hardwarecontent #divremote #tcpport").val();
				if (port=="")
				{
					ShowNotify($.i18n('Please enter an Port!'), 2500, true);
					return;
				}
				var intRegex = /^\d+$/;
				if(!intRegex.test(port)) {
					ShowNotify($.i18n('Please enter an Valid Port!'), 2500, true);
					return;
				}
				var password=$("#hardwarecontent #divlogin #password").val();		
				$.ajax({
					 url: "json.htm?type=command&param=updatehardware&htype=" + hardwaretype + 
						"&address=" + address + 
						"&port=" + port + 
						"&name=" + name + 
						"&password=" + password +
						"&enabled=" + bEnabled + 
						"&idx=" + idx + 
						"&datatimeout=" + datatimeout +
						"&Mode1=" + Mode1 + "&Mode2=" + Mode2 + "&Mode3=" + Mode3 + "&Mode4=" + Mode4 + "&Mode5=" + Mode5,
					 async: false, 
					 dataType: 'json',
					 success: function(data) {
						RefreshHardwareTable();
					 },
					 error: function(){
							ShowNotify($.i18n('Problem updating hardware!'), 2500, true);
					 }     
				});
			}
			else if ((text.indexOf("Domoticz") >= 0)|| (text.indexOf("Harmony") >= 0))
			{
				var address=$("#hardwarecontent #divremote #tcpaddress").val();
				if (address=="")
				{
					ShowNotify($.i18n('Please enter an Address!'), 2500, true);
					return;
				}
				var port=$("#hardwarecontent #divremote #tcpport").val();
				if (port=="")
				{
					ShowNotify($.i18n('Please enter an Port!'), 2500, true);
					return;
				}
				var intRegex = /^\d+$/;
				if(!intRegex.test(port)) {
					ShowNotify($.i18n('Please enter an Valid Port!'), 2500, true);
					return;
				}		
				var username=$("#hardwarecontent #divlogin #username").val();
				var password=$("#hardwarecontent #divlogin #password").val();
				$.ajax({
					 url: "json.htm?type=command&param=updatehardware&htype=" + hardwaretype +
						"&address=" + address + 
						"&port=" + port + 
						"&username=" + username + 
						"&password=" + password + 
						"&name=" + name + 
						"&enabled=" + bEnabled + 
						"&idx=" + idx + 
						"&datatimeout=" + datatimeout +
						"&Mode1=" + Mode1 + "&Mode2=" + Mode2 + "&Mode3=" + Mode3 + "&Mode4=" + Mode4 + "&Mode5=" + Mode5,
					 async: false, 
					 dataType: 'json',
					 success: function(data) {
						RefreshHardwareTable();
					 },
					 error: function(){
							ShowNotify($.i18n('Problem updating hardware!'), 2500, true);
					 }     
				});
			}
			else if (text.indexOf("Philips Hue") >= 0)
			{
				var address=$("#hardwarecontent #divremote #tcpaddress").val();
				if (address=="")
				{
					ShowNotify($.i18n('Please enter an Address!'), 2500, true);
					return;
				}
				var port=$("#hardwarecontent #divremote #tcpport").val();
				if (port=="")
				{
					ShowNotify($.i18n('Please enter an Port!'), 2500, true);
					return;
				}
				var intRegex = /^\d+$/;
				if(!intRegex.test(port)) {
					ShowNotify($.i18n('Please enter an Valid Port!'), 2500, true);
					return;
				}		
				var username=$("#hardwarecontent #hardwareparamsphilipshue #username").val();
				if (username == "") {
					ShowNotify($.i18n('Please enter a username!'), 2500, true);
					return;
				}
				
				$.ajax({
					 url: "json.htm?type=command&param=updatehardware&htype=" + hardwaretype +
						"&address=" + address + 
						"&port=" + port + 
						"&username=" + username + 
						"&name=" + name + 
						"&enabled=" + bEnabled + 
						"&idx=" + idx + 
						"&datatimeout=" + datatimeout +
						"&Mode1=" + Mode1 + "&Mode2=" + Mode2 + "&Mode3=" + Mode3 + "&Mode4=" + Mode4 + "&Mode5=" + Mode5,
					 async: false, 
					 dataType: 'json',
					 success: function(data) {
						RefreshHardwareTable();
					 },
					 error: function(){
							ShowNotify($.i18n('Problem updating hardware!'), 2500, true);
					 }     
				});
			}
			else if ((text.indexOf("Underground") >= 0)||(text.indexOf("Forecast") >= 0))
			{
				var apikey=$("#hardwarecontent #divunderground #apikey").val();
				if (apikey=="")
				{
					ShowNotify($.i18n('Please enter an API Key!'), 2500, true);
					return;
				}
				var location=$("#hardwarecontent #divunderground #location").val();
				if (location=="")
				{
					ShowNotify($.i18n('Please enter an Location!'), 2500, true);
					return;
				}
				$.ajax({
					 url: "json.htm?type=command&param=updatehardware&htype=" + hardwaretype +
						"&port=1" + 
						"&username=" + apikey + 
						"&password=" + location +
						"&name=" + name + 
						"&enabled=" + bEnabled + 
						"&idx=" + idx +
						"&datatimeout=" + datatimeout +
						"&Mode1=" + Mode1 + "&Mode2=" + Mode2 + "&Mode3=" + Mode3 + "&Mode4=" + Mode4 + "&Mode5=" + Mode5,
					 async: false, 
					 dataType: 'json',
					 success: function(data) {
						RefreshHardwareTable();
					 },
					 error: function(){
							ShowNotify($.i18n('Problem updating hardware!'), 2500, true);
					 }     
				});
			}
			else if (text.indexOf("SBFSpot") >= 0)
			{
				var configlocation=$("#hardwarecontent #divlocation #location").val();
				if (configlocation=="")
				{
					ShowNotify($.i18n('Please enter an Location!'), 2500, true);
					return;
				}
				$.ajax({
					 url: "json.htm?type=command&param=updatehardware&htype=" + hardwaretype +
						"&port=1" + 
						"&username=" + encodeURIComponent(configlocation) + 
						"&name=" + name + 
						"&enabled=" + bEnabled + 
						"&idx=" + idx +
						"&datatimeout=" + datatimeout +
						"&Mode1=" + Mode1 + "&Mode2=" + Mode2 + "&Mode3=" + Mode3 + "&Mode4=" + Mode4 + "&Mode5=" + Mode5,
					 async: false, 
					 dataType: 'json',
					 success: function(data) {
						RefreshHardwareTable();
					 },
					 error: function(){
							ShowNotify($.i18n('Problem updating hardware!'), 2500, true);
					 }     
				});
			}
			else if ((text.indexOf("ICY") >= 0) || (text.indexOf("Toon") >= 0) || (text.indexOf("PVOutput") >= 0)) {
				var username = $("#hardwarecontent #divlogin #username").val();
				var password = $("#hardwarecontent #divlogin #password").val();
				$.ajax({
					url: "json.htm?type=command&param=updatehardware&htype=" + hardwaretype +
					   "&port=1" +
					   "&username=" + username +
					   "&password=" + password +
					   "&name=" + name +
					   "&enabled=" + bEnabled +
					   "&idx=" + idx +
					   "&datatimeout=" + datatimeout +
					   "&Mode1=" + Mode1 + "&Mode2=" + Mode2 + "&Mode3=" + Mode3 + "&Mode4=" + Mode4 + "&Mode5=" + Mode5,
					async: false,
					dataType: 'json',
					success: function (data) {
						RefreshHardwareTable();
					},
					error: function () {
						ShowNotify($.i18n('Problem updating hardware!'), 2500, true);
					}
				});
			}
		}

		AddHardware = function()
		{
			var name=$("#hardwarecontent #hardwareparamstable #hardwarename").val();
			if (name=="")
			{
				ShowNotify($.i18n('Please enter a Name!'), 2500, true);
				return false;
			}

			var hardwaretype=$("#hardwarecontent #hardwareparamstable #combotype option:selected").val();
			if (typeof hardwaretype == 'undefined') {
				ShowNotify($.i18n('Unknown device selected!'), 2500, true);
				return;
			}
			
			var bEnabled=$('#hardwarecontent #hardwareparamstable #enabled').is(":checked");
			var datatimeout=$('#hardwarecontent #hardwareparamstable #combodatatimeout').val();
			
			var text = $("#hardwarecontent #hardwareparamstable #combotype option:selected").text();
			if (text.indexOf("Motherboard") >= 0) {
				ShowNotify($.i18n('This device is maintained by the system. Please do not add it manually.'), 3000, true);
				return;
			}

			if ((text.indexOf("TE923") >= 0)||(text.indexOf("Volcraft") >= 0)||(text.indexOf("1-Wire") >= 0)||(text.indexOf("BMP085") >= 0)||(text.indexOf("Dummy") >= 0)||(text.indexOf("PiFace") >= 0)||(text.indexOf("GPIO") >= 0))
			{
				$.ajax({
					 url: "json.htm?type=command&param=addhardware&htype=" + hardwaretype + "&port=1&name=" + name + "&enabled=" + bEnabled + "&datatimeout=" + datatimeout,
					 async: false, 
					 dataType: 'json',
					 success: function(data) {
						RefreshHardwareTable();
					 },
					 error: function(){
							ShowNotify($.i18n('Problem adding hardware!'), 2500, true);
					 }     
				});
			}
			else if (text.indexOf("USB") >= 0)
			{
				var serialport=$("#hardwarecontent #divserial #comboserialport option:selected").val();
				if (typeof serialport == 'undefined')
				{
					ShowNotify($.i18n('No serial port selected!'), 2500, true);
					return;
				}
				$.ajax({
					 url: "json.htm?type=command&param=addhardware&htype=" + hardwaretype + "&port=" + serialport + "&name=" + name + "&enabled=" + bEnabled + "&datatimeout=" + datatimeout,
					 async: false, 
					 dataType: 'json',
					 success: function(data) {
						RefreshHardwareTable();
					 },
					 error: function(){
							ShowNotify($.i18n('Problem adding hardware!'), 2500, true);
					 }     
				});
			}
			else if (text.indexOf("LAN") >= 0 && text.indexOf("YouLess") == -1)
			{
				var address=$("#hardwarecontent #divremote #tcpaddress").val();
				if (address=="")
				{
					ShowNotify($.i18n('Please enter an Address!'), 2500, true);
					return;
				}
				var port=$("#hardwarecontent #divremote #tcpport").val();
				if (port=="")
				{
					ShowNotify($.i18n('Please enter an Port!'), 2500, true);
					return;
				}
				var intRegex = /^\d+$/;
				if(!intRegex.test(port)) {
					ShowNotify($.i18n('Please enter an Valid Port!'), 2500, true);
					return;
				}		
				$.ajax({
					 url: "json.htm?type=command&param=addhardware&htype=" + hardwaretype + "&address=" + address + "&port=" + port + "&name=" + name + "&enabled=" + bEnabled + "&datatimeout=" + datatimeout,
					 async: false, 
					 dataType: 'json',
					 success: function(data) {
						RefreshHardwareTable();
					 },
					 error: function(){
							ShowNotify($.i18n('Problem adding hardware!'), 2500, true);
					 }     
				});
			}
			else if (text.indexOf("LAN") >= 0 && text.indexOf("YouLess") >= 0)
			{
				var address=$("#hardwarecontent #divremote #tcpaddress").val();
				if (address=="")
				{
					ShowNotify($.i18n('Please enter an Address!'), 2500, true);
					return;
				}
				var port=$("#hardwarecontent #divremote #tcpport").val();
				if (port=="")
				{
					ShowNotify($.i18n('Please enter an Port!'), 2500, true);
					return;
				}
				var intRegex = /^\d+$/;
				if(!intRegex.test(port)) {
					ShowNotify($.i18n('Please enter an Valid Port!'), 2500, true);
					return;
				}
				var password=$("#hardwarecontent #divlogin #password").val();
				$.ajax({
					 url: "json.htm?type=command&param=addhardware&htype=" + hardwaretype + "&address=" + address + "&port=" + port + "&name=" + name + "&password=" + password + "&enabled=" + bEnabled + "&datatimeout=" + datatimeout,
					 async: false, 
					 dataType: 'json',
					 success: function(data) {
						RefreshHardwareTable();
					 },
					 error: function(){
							ShowNotify($.i18n('Problem adding hardware!'), 2500, true);
					 }     
				});
			}
			else if (text.indexOf("Philips Hue") >= 0)
			{
				var address=$("#hardwarecontent #divremote #tcpaddress").val();
				if (address=="")
				{
					ShowNotify($.i18n('Please enter an Address!'), 2500, true);
					return;
				}
				var port=$("#hardwarecontent #divremote #tcpport").val();
				if (port=="")
				{
					ShowNotify($.i18n('Please enter an Port!'), 2500, true);
					return;
				}
				var intRegex = /^\d+$/;
				if(!intRegex.test(port)) {
					ShowNotify($.i18n('Please enter an Valid Port!'), 2500, true);
					return;
				}		
				var username=$("#hardwarecontent #hardwareparamsphilipshue #username").val();

				if (username == "") {
					ShowNotify($.i18n('Please enter a username!'), 2500, true);
					return;
				}
				$.ajax({
					 url: "json.htm?type=command&param=addhardware&htype=" + hardwaretype + "&address=" + address + "&port=" + port + "&username=" + username + "&name=" + name + "&enabled=" + bEnabled + "&datatimeout=" + datatimeout,
					 async: false, 
					 dataType: 'json',
					 success: function(data) {
						RefreshHardwareTable();
					 },
					 error: function(){
							ShowNotify($.i18n('Problem adding hardware!'), 2500, true);
					 }     
				});
			}
			else if ((text.indexOf("Domoticz") >= 0) || (text.indexOf("Harmony") >= 0))
			{
				var address=$("#hardwarecontent #divremote #tcpaddress").val();
				if (address=="")
				{
					ShowNotify($.i18n('Please enter an Address!'), 2500, true);
					return;
				}
				var port=$("#hardwarecontent #divremote #tcpport").val();
				if (port=="")
				{
					ShowNotify($.i18n('Please enter an Port!'), 2500, true);
					return;
				}
				var intRegex = /^\d+$/;
				if(!intRegex.test(port)) {
					ShowNotify($.i18n('Please enter an Valid Port!'), 2500, true);
					return;
				}		
				var username=$("#hardwarecontent #divlogin #username").val();
				var password = $("#hardwarecontent #divlogin #password").val();

				if ((text.indexOf("Harmony") >= 0) && (username == "")) {
					ShowNotify($.i18n('Please enter a username!'), 2500, true);
					return;
				}

				if ((text.indexOf("Harmony") >= 0) && (password == "")) {
					ShowNotify($.i18n('Please enter a password!'), 2500, true);
					return;
				}
				
				$.ajax({
					 url: "json.htm?type=command&param=addhardware&htype=" + hardwaretype + "&address=" + address + "&port=" + port + "&username=" + username + "&password=" + password + "&name=" + name + "&enabled=" + bEnabled + "&datatimeout=" + datatimeout,
					 async: false, 
					 dataType: 'json',
					 success: function(data) {
						RefreshHardwareTable();
					 },
					 error: function(){
							ShowNotify($.i18n('Problem adding hardware!'), 2500, true);
					 }     
				});
			}
			else if ((text.indexOf("Underground") >= 0)||(text.indexOf("Forecast") >= 0))
			{
				var apikey=$("#hardwarecontent #divunderground #apikey").val();
				if (apikey=="")
				{
					ShowNotify($.i18n('Please enter an API Key!'), 2500, true);
					return;
				}
				var location=$("#hardwarecontent #divunderground #location").val();
				if (location=="")
				{
					ShowNotify($.i18n('Please enter an Location!'), 2500, true);
					return;
				}
				$.ajax({
					 url: "json.htm?type=command&param=addhardware&htype=" + hardwaretype + "&port=1" + "&username=" + apikey + "&password=" + location + "&name=" + name + "&enabled=" + bEnabled + "&datatimeout=" + datatimeout,
					 async: false, 
					 dataType: 'json',
					 success: function(data) {
						RefreshHardwareTable();
					 },
					 error: function(){
							ShowNotify($.i18n('Problem adding hardware!'), 2500, true);
					 }     
				});
			}
			else if (text.indexOf("SBFSpot") >= 0)
			{
				var configlocation=$("#hardwarecontent #divlocation #location").val();
				if (configlocation=="")
				{
					ShowNotify($.i18n('Please enter an Location!'), 2500, true);
					return;
				}
				$.ajax({
					 url: "json.htm?type=command&param=addhardware&htype=" + hardwaretype +
						"&port=1" + 
						"&username=" + encodeURIComponent(configlocation) + 
						"&name=" + name + 
						"&enabled=" + bEnabled +
						"&datatimeout=" + datatimeout,
					 async: false, 
					 dataType: 'json',
					 success: function(data) {
						RefreshHardwareTable();
					 },
					 error: function(){
							ShowNotify($.i18n('Problem updating hardware!'), 2500, true);
					 }     
				});
			}
			else if ((text.indexOf("ICY") >= 0)||(text.indexOf("Toon") >= 0)||(text.indexOf("PVOutput") >= 0))
			{
				var username=$("#hardwarecontent #divlogin #username").val();
				var password=$("#hardwarecontent #divlogin #password").val();
				$.ajax({
					 url: "json.htm?type=command&param=addhardware&htype=" + hardwaretype +
					 "&port=1" + 
					 "&username=" + username + 
					 "&password=" + password + 
					 "&name=" + name + 
					 "&enabled=" + bEnabled +
					 "&datatimeout=" + datatimeout,
					 async: false, 
					 dataType: 'json',
					 success: function(data) {
						RefreshHardwareTable();
					 },
					 error: function(){
							ShowNotify($.i18n('Problem adding hardware!'), 2500, true);
					 }     
				});
			}
		}

		EditRFXCOMMode = function(idx,name,Mode1,Mode2,Mode3,Mode4,Mode5)
		{
			cursordefault();
			var htmlcontent = '';
			htmlcontent='<p><center><h2><span data-i18n="Device"></span>: ' + name + '</h2></center></p>\n';
			htmlcontent+=$('#rfxhardwaremode').html();
			$('#hardwarecontent').html(GetBackbuttonHTMLTable('ShowHardware')+htmlcontent);
			$('#hardwarecontent').i18n();

			$('#hardwarecontent #submitbutton').click(function (e) {
				e.preventDefault();
				SetRFXCOMMode();
			});


			$('#hardwarecontent #idx').val(idx);
			$('#hardwarecontent #undecon').prop('checked',((Mode3 & 0x80)!=0));
			$('#hardwarecontent #X10').prop('checked',((Mode5 & 0x01)!=0));
			$('#hardwarecontent #ARC').prop('checked',((Mode5 & 0x02)!=0));
			$('#hardwarecontent #AC').prop('checked',((Mode5 & 0x04)!=0));
			$('#hardwarecontent #HomeEasyEU').prop('checked',((Mode5 & 0x08)!=0));
			$('#hardwarecontent #Meiantech').prop('checked',((Mode5 & 0x10)!=0));
			$('#hardwarecontent #OregonScientific').prop('checked',((Mode5 & 0x20)!=0));
			$('#hardwarecontent #ATIremote').prop('checked',((Mode5 & 0x40)!=0));
			$('#hardwarecontent #Visonic').prop('checked',((Mode5 & 0x80)!=0));
			$('#hardwarecontent #Mertik').prop('checked',((Mode4 & 0x01)!=0));
			$('#hardwarecontent #ADLightwaveRF').prop('checked',((Mode4 & 0x02)!=0));
			$('#hardwarecontent #HidekiUPM').prop('checked',((Mode4 & 0x04)!=0));
			$('#hardwarecontent #LaCrosse').prop('checked',((Mode4 & 0x08)!=0));
			$('#hardwarecontent #FS20').prop('checked',((Mode4 & 0x10)!=0));
			$('#hardwarecontent #ProGuard').prop('checked',((Mode4 & 0x20)!=0));
			$('#hardwarecontent #BlindT0').prop('checked',((Mode4 & 0x40)!=0));
			$('#hardwarecontent #BlindT1T2T3T4').prop('checked',((Mode4 & 0x80)!=0));
			$('#hardwarecontent #AEBlyss').prop('checked',((Mode3 & 0x01)!=0));
			$('#hardwarecontent #Rubicson').prop('checked',((Mode3 & 0x02)!=0));
			$('#hardwarecontent #FineOffsetViking').prop('checked',((Mode3 & 0x04)!=0));
			$('#hardwarecontent #Lighting4').prop('checked',((Mode3 & 0x08)!=0));
			$('#hardwarecontent #RSL').prop('checked',((Mode3 & 0x10)!=0));
			$('#hardwarecontent #ByronSX').prop('checked',((Mode3 & 0x20)!=0));
			$('#hardwarecontent #rfu6').prop('checked',((Mode3 & 0x40)!=0));

			$('#hardwarecontent #defaultbutton').click(function (e) {
				e.preventDefault();
				$('#hardwarecontent #undecon').prop('checked',false);
				$('#hardwarecontent #X10').prop('checked',true);
				$('#hardwarecontent #ARC').prop('checked',true);
				$('#hardwarecontent #AC').prop('checked',true);
				$('#hardwarecontent #HomeEasyEU').prop('checked',true);
				$('#hardwarecontent #Meiantech').prop('checked',false);
				$('#hardwarecontent #OregonScientific').prop('checked',true);
				$('#hardwarecontent #ATIremote').prop('checked',false);
				$('#hardwarecontent #Visonic').prop('checked',false);
				$('#hardwarecontent #Mertik').prop('checked',false);
				$('#hardwarecontent #ADLightwaveRF').prop('checked',false);
				$('#hardwarecontent #HidekiUPM').prop('checked',true);
				$('#hardwarecontent #LaCrosse').prop('checked',true);
				$('#hardwarecontent #FS20').prop('checked',false);
				$('#hardwarecontent #ProGuard').prop('checked',false);
				$('#hardwarecontent #BlindT0').prop('checked',false);
				$('#hardwarecontent #BlindT1T2T3T4').prop('checked',false);
				$('#hardwarecontent #AEBlyss').prop('checked',false);
				$('#hardwarecontent #Rubicson').prop('checked',false);
				$('#hardwarecontent #FineOffsetViking').prop('checked',false);
				$('#hardwarecontent #Lighting4').prop('checked',false);
				$('#hardwarecontent #RSL').prop('checked',false);
				$('#hardwarecontent #ByronSX').prop('checked',false);
				$('#hardwarecontent #rfu6').prop('checked',false);
			});
		}

		EditRego6XXType = function(idx,name,Mode1,Mode2,Mode3,Mode4,Mode5)
		{
			cursordefault();
			var htmlcontent = '';
			htmlcontent='<p><center><h2><span data-i18n="Device"></span>: ' + name + '</h2></center></p>\n';
			htmlcontent+=$('#rego6xxtypeedit').html();
			$('#hardwarecontent').html(GetBackbuttonHTMLTable('ShowHardware')+htmlcontent);
			$('#hardwarecontent').i18n();

			$('#hardwarecontent #submitbuttonrego').click(function (e) {
				e.preventDefault();
				SetRego6XXType();
			});

			$('#hardwarecontent #idx').val(idx);
			$('#hardwarecontent #comborego6xxtype').val(Mode1);
		}

		SetP1USBType = function()
		{
		  $.post("setp1usbtype.webem", $("#hardwarecontent #p1usbtype").serialize(), function(data) {
		   ShowHardware();
		  });
		}

		AddWOLNode = function()
		{
			var name=$("#hardwarecontent #nodeparamstable #nodename").val();
			if (name=="")
			{
				ShowNotify($.i18n('Please enter a Name!'), 2500, true);
				return;
			}
			var mac=$("#hardwarecontent #nodeparamstable #nodemac").val();
			if (mac=="")
			{
				ShowNotify($.i18n('Please enter a MAC Address!'), 2500, true);
				return;
			}

			$.ajax({
				 url: "json.htm?type=command&param=woladdnode" +
					"&idx=" + $.devIdx +
					"&name=" + name + 
					"&mac=" + mac,
				 async: false, 
				 dataType: 'json',
				 success: function(data) {
					RefreshWOLNodeTable();
				 },
				 error: function(){
					ShowNotify($.i18n('Problem Adding Node!'), 2500, true);
				 }     
			});
		}

		WOLDeleteNode = function(nodeid)
		{
			if ($('#updelclr #nodedelete').attr("class")=="btnstyle3-dis") {
				return;
			}
			bootbox.confirm($.i18n("Are you sure to remove this Node?"), function(result) {
				if (result==true) {
					$.ajax({
						 url: "json.htm?type=command&param=wolremovenode" +
							"&idx=" + $.devIdx +
							"&nodeid=" + nodeid,
						 async: false, 
						 dataType: 'json',
						 success: function(data) {
							RefreshWOLNodeTable();
						 },
						 error: function(){
							ShowNotify($.i18n('Problem Deleting Node!'), 2500, true);
						 }     
					});
				}
			});
		}

		WOLClearNodes = function()
		{
			bootbox.confirm($.i18n("Are you sure to delete ALL Nodes?\n\nThis action can not be undone!"), function(result) {
				if (result==true) {
					$.ajax({
						 url: "json.htm?type=command&param=wolclearnodes" +
							"&idx=" + $.devIdx,
						 async: false, 
						 dataType: 'json',
						 success: function(data) {
							RefreshWOLNodeTable();
						 }     
					});
				}
			});
		}

		WOLUpdateNode = function(nodeid)
		{
			if ($('#updelclr #nodedelete').attr("class")=="btnstyle3-dis") {
				return;
			}
			
			var name=$("#hardwarecontent #nodeparamstable #nodename").val();
			if (name=="")
			{
				ShowNotify($.i18n('Please enter a Name!'), 2500, true);
				return;
			}
			var mac=$("#hardwarecontent #nodeparamstable #nodemac").val();
			if (mac=="")
			{
				ShowNotify($.i18n('Please enter a MAC Address!'), 2500, true);
				return;
			}

			$.ajax({
				 url: "json.htm?type=command&param=wolupdatenode" +
					"&idx=" + $.devIdx +
					"&nodeid=" + nodeid +
					"&name=" + name + 
					"&mac=" + mac,
				 async: false, 
				 dataType: 'json',
				 success: function(data) {
					RefreshWOLNodeTable();
				 },
				 error: function(){
					ShowNotify($.i18n('Problem Updating Node!'), 2500, true);
				 }     
			});
		}

		RefreshWOLNodeTable = function()
		{
		  $('#modal').show();
			$('#updelclr #nodeupdate').attr("class", "btnstyle3-dis");
			$('#updelclr #nodedelete').attr("class", "btnstyle3-dis");
			$("#hardwarecontent #nodeparamstable #nodename").val("");
			$("#hardwarecontent #nodeparamstable #nodemac").val("");

		  var oTable = $('#nodestable').dataTable();
		  oTable.fnClearTable();

		  $.ajax({
			 url: "json.htm?type=command&param=wolgetnodes&idx="+$.devIdx,
			 async: false, 
			 dataType: 'json',
			 success: function(data) {
			  if (typeof data.result != 'undefined') {
				$.each(data.result, function(i,item){
					var addId = oTable.fnAddData( {
						"DT_RowId": item.idx,
						"Name": item.Name,
						"Mac": item.Mac,
						"0": item.idx,
						"1": item.Name,
						"2": item.Mac
					} );
				});
			  }
			 }
		  });

			/* Add a click handler to the rows - this could be used as a callback */
			$("#nodestable tbody").off();
			$("#nodestable tbody").on( 'click', 'tr', function () {
				$('#updelclr #nodedelete').attr("class", "btnstyle3-dis");
				if ( $(this).hasClass('row_selected') ) {
					$(this).removeClass('row_selected');
					$('#updelclr #nodeupdate').attr("class", "btnstyle3-dis");
					$("#hardwarecontent #nodeparamstable #nodename").val("");
					$("#hardwarecontent #nodeparamstable #nodemac").val("");
				}
				else {
					var oTable = $('#nodestable').dataTable();
					oTable.$('tr.row_selected').removeClass('row_selected');
					$(this).addClass('row_selected');
					$('#updelclr #nodeupdate').attr("class", "btnstyle3");
					var anSelected = fnGetSelected( oTable );
					if ( anSelected.length !== 0 ) {
						var data = oTable.fnGetData( anSelected[0] );
						var idx= data["DT_RowId"];
						$.myglobals.SelectedTimerIdx=idx;
						$("#updelclr #nodeupdate").attr("href", "javascript:WOLUpdateNode(" + idx + ")");
						$('#updelclr #nodedelete').attr("class", "btnstyle3");
						$("#updelclr #nodedelete").attr("href", "javascript:WOLDeleteNode(" + idx + ")");
						$("#hardwarecontent #nodeparamstable #nodename").val(data["1"]);
						$("#hardwarecontent #nodeparamstable #nodemac").val(data["2"]);
					}
				}
			}); 

		  $('#modal').hide();
		}

		EditWOL = function(idx,name,Mode1,Mode2,Mode3,Mode4,Mode5)
		{
			$.devIdx=idx;
			cursordefault();
			var htmlcontent = '';
			htmlcontent='<p><center><h2><span data-i18n="Device"></span>: ' + name + '</h2></center></p>\n';
			htmlcontent+=$('#wakeonlan').html();
			$('#hardwarecontent').html(GetBackbuttonHTMLTable('ShowHardware')+htmlcontent);
			$('#hardwarecontent').i18n();

			var oTable = $('#nodestable').dataTable( {
			  "sDom": '<"H"lfrC>t<"F"ip>',
			  "oTableTools": {
				"sRowSelect": "single",
			  },
			  "aaSorting": [[ 0, "desc" ]],
			  "bSortClasses": false,
			  "bProcessing": true,
			  "bStateSave": true,
			  "bJQueryUI": true,
			  "aLengthMenu": [[25, 50, 100, -1], [25, 50, 100, "All"]],
			  "iDisplayLength" : 25,
			  "sPaginationType": "full_numbers"
			} );

			$('#hardwarecontent #idx').val(idx);
			
			RefreshWOLNodeTable();
		}

		EditSBFSpot = function(idx,name,Mode1,Mode2,Mode3,Mode4,Mode5)
		{
			$.devIdx=idx;
			cursordefault();
			var htmlcontent = '';
			htmlcontent='<p><center><h2><span data-i18n="Device"></span>: ' + name + '</h2></center></p>\n';
			htmlcontent+=$('#sbfspot').html();
			$('#hardwarecontent').html(GetBackbuttonHTMLTable('ShowHardware')+htmlcontent);
			$('#hardwarecontent').i18n();
			$('#hardwarecontent #idx').val(idx);
			$('#hardwarecontent #btnimportolddata').click(function (e) {
				e.preventDefault();
				bootbox.alert($.i18n('Importing old data, this could take a while!<br>You should automaticly return on the Dashboard'));
				$.post("sbfspotimportolddata.webem", $("#hardwarecontent #sbfspot").serialize(), function(data) {
					SwitchLayout('Dashboard');
				});
			});
		}

		EditP1USB = function(idx,name,Mode1,Mode2,Mode3,Mode4,Mode5)
		{
			$.devIdx=idx;
			cursordefault();
			var htmlcontent = '';
			htmlcontent='<p><center><h2><span data-i18n="Device"></span>: ' + name + '</h2></center></p>\n';
			htmlcontent+=$('#p1usbeedit').html();
			$('#hardwarecontent').html(GetBackbuttonHTMLTable('ShowHardware')+htmlcontent);
			$('#hardwarecontent').i18n();

			$('#hardwarecontent #submitbuttonp1usb').click(function (e) {
				e.preventDefault();
				SetP1USBType();
			});

			$('#hardwarecontent #idx').val(idx);
			$('#hardwarecontent #P1Baudrate').val(Mode1);
		}

		EditS0MeterType = function(idx,name,Mode1,Mode2,Mode3,Mode4,Mode5)
		{
			cursordefault();
			var htmlcontent = '';
			htmlcontent='<p><center><h2><span data-i18n="Device"></span>: ' + name + '</h2></center></p>\n';
			htmlcontent+=$('#s0metertypeedit').html();
			$('#hardwarecontent').html(GetBackbuttonHTMLTable('ShowHardware')+htmlcontent);
			$('#hardwarecontent').i18n();

			$('#hardwarecontent #submitbuttons0meter').click(function (e) {
				e.preventDefault();
				SetS0MeterType();
			});

			$('#hardwarecontent #idx').val(idx);
			$('#hardwarecontent #combom1type').val(Mode1);
			if (Mode2!=0) {
				$('#hardwarecontent #M1PulsesPerHour').val(Mode2);
			}
			else {
				$('#hardwarecontent #M1PulsesPerHour').val(2000);
			}

			$('#hardwarecontent #combom2type').val(Mode3);
			if (Mode4!=0) {
				$('#hardwarecontent #M2PulsesPerHour').val(Mode4);
			}
			else {
				$('#hardwarecontent #M2PulsesPerHour').val(2000);
			}
			$('#hardwarecontent #S0Baudrate').val(Mode5);
		}

		EditLimitlessType = function(idx,name,Mode1,Mode2,Mode3,Mode4,Mode5)
		{
			cursordefault();
			var htmlcontent = '';
			htmlcontent='<p><center><h2><span data-i18n="Device"></span>: ' + name + '</h2></center></p>\n';
			htmlcontent+=$('#limitlessmetertype').html();
			$('#hardwarecontent').html(GetBackbuttonHTMLTable('ShowHardware')+htmlcontent);
			$('#hardwarecontent').i18n();

			$('#hardwarecontent #submitbuttonlimitless').click(function (e) {
				e.preventDefault();
				SetLimitlessType();
			});

			$('#hardwarecontent #idx').val(idx);
			$('#hardwarecontent #combom1type').val(Mode1);
		}

		DeleteNode = function(idx)
		{
			if ($('#updelclr #nodedelete').attr("class")=="btnstyle3-dis") {
				return;
			}
			bootbox.confirm($.i18n("Are you sure to remove this Node?"), function(result) {
				if (result==true) {
				  $.ajax({
					url: "json.htm?type=command&param=deletezwavenode" +
						"&idx=" + idx,
					 async: false, 
					 dataType: 'json',
					 success: function(data) {
						bootbox.alert($.i18n('Node marked for Delete. This could take some time!'));
						RefreshOpenZWaveNodeTable();
					 }
				  });
				}
			});
		}

		UpdateNode = function(idx)
		{
			if ($('#updelclr #nodeupdate').attr("class")=="btnstyle3-dis") {
				return;
			}
			var name=$("#hardwarecontent #nodeparamstable #nodename").val();
			if (name=="")
			{
				ShowNotify($.i18n('Please enter a Name!'), 2500, true);
				return;
			}

			var bEnablePolling=$('#hardwarecontent #nodeparamstable #EnablePolling').is(":checked");
			$.ajax({
				 url: "json.htm?type=command&param=updatezwavenode" +
					"&idx=" + idx +
					"&name=" + name + 
					"&EnablePolling=" + bEnablePolling,
				 async: false, 
				 dataType: 'json',
				 success: function(data) {
					RefreshOpenZWaveNodeTable();
				 },
				 error: function(){
					ShowNotify($.i18n('Problem updating Node!'), 2500, true);
				 }     
			});
		}

		RequestZWaveConfiguration = function(idx)
		{
			$.ajax({
				 url: "json.htm?type=command&param=requestzwavenodeconfig" +
					"&idx=" + idx,
				 async: false, 
				 dataType: 'json',
				 success: function(data) {
					bootbox.alert($.i18n('Configuration requested from Node. If the Node is asleep, this could take a while!'));
					RefreshOpenZWaveNodeTable();
				 },
				 error: function(){
						ShowNotify($.i18n('Problem requesting Node Configuration!'), 2500, true);
				 }     
			});
		}

		ApplyZWaveConfiguration = function(idx)
		{
			var valueList="";
			var $list = $('#hardwarecontent #configuration input');
			if (typeof $list != 'undefined') {
				var ControlCnt = $list.length;
				// Now loop through list of controls
				
				$list.each( function() {
					var id = $(this).prop("id");      // get id
					var value = encodeURIComponent(btoa($(this).prop("value")));      // get value
					
					valueList+=id+"_"+value+"__";
				});
			}

			//Now for the Lists
			$list = $('#hardwarecontent #configuration select');
			if (typeof $list != 'undefined') {
				var ControlCnt = $list.length;
				// Now loop through list of controls
				$list.each( function() {
					var id = $(this).prop("id");      // get id
					var value = encodeURIComponent(btoa($(this).find(":selected").text()));      // get value
					valueList+=id+"_"+value+"__";
				});
			}

			if (valueList!="") {
				$.ajax({
					 url: "json.htm?type=command&param=applyzwavenodeconfig" +
						"&idx=" + idx +
						"&valuelist=" + valueList,
					 async: false, 
					 dataType: 'json',
					 success: function(data) {
						bootbox.alert($.i18n('Configuration send to node. If the node is asleep, this could take a while!'));
					 },
					 error: function(){
							ShowNotify($.i18n('Problem updating Node Configuration!'), 2500, true);
					 }     
				});
			}
		}

		ZWaveIncludeNode = function()
		{
			$.ajax({
				 url: "json.htm?type=command&param=zwaveinclude&idx=" + $.devIdx,
				 async: false, 
				 dataType: 'json',
				 success: function(data) {
					bootbox.alert($.i18n('Inclusion mode Started. You have 20 seconds to include the device...!'));
				 }
			});
		}
		ZWaveExcludeNode = function()
		{
			$.ajax({
				 url: "json.htm?type=command&param=zwaveexclude&idx=" + $.devIdx,
				 async: false, 
				 dataType: 'json',
				 success: function(data) {
					bootbox.alert($.i18n('Exclusion mode Started. You have 20 seconds to exclude the device...!'));
				 }
			});
		}

		ZWaveSoftResetNode = function()
		{
			$.ajax({
				 url: "json.htm?type=command&param=zwavesoftreset&idx=" + $.devIdx,
				 async: false, 
				 dataType: 'json',
				 success: function(data) {
					bootbox.alert($.i18n('Soft resetting controller device...!'));
				 }
			});
		}
		ZWaveHardResetNode = function()
		{
			bootbox.confirm($.i18n("Are you sure you want to hard reset the controller?\n(All associated nodes will be removed)"), function(result) {
				if (result==true) {
					$.ajax({
						 url: "json.htm?type=command&param=zwavehardreset&idx=" + $.devIdx,
						 async: false, 
						 dataType: 'json',
						 success: function(data) {
							bootbox.alert($.i18n('Hard resetting controller device...!'));
						 }
					});
				}
			});


		}

		ZWaveHealNetwork = function()
		{
			$.ajax({
				 url: "json.htm?type=command&param=zwavenetworkheal&idx=" + $.devIdx,
				 async: false, 
				 dataType: 'json',
				 success: function(data) {
					bootbox.alert($.i18n('Initiating network heal...!'));
				 }
			});
		}

		ZWaveHealNode = function(node)
		{
			$.ajax({
				 url: "json.htm?type=command&param=zwavenodeheal&idx=" + $.devIdx + "&node=" + node,
				 async: false, 
				 dataType: 'json',
				 success: function(data) {
					bootbox.alert($.i18n('Initiating node heal...!'));
				 }
			});
		} 


		ZWaveReceiveConfiguration = function()
		{
			$.ajax({
				 url: "json.htm?type=command&param=zwavereceiveconfigurationfromothercontroller&idx=" + $.devIdx,
				 async: false, 
				 dataType: 'json',
				 success: function(data) {
					bootbox.alert($.i18n('Initiating Receive Configuration...!'));
				 }
			});
		}

		ZWaveSendConfiguration = function()
		{
			$.ajax({
				 url: "json.htm?type=command&param=zwavesendconfigurationtosecondcontroller&idx=" + $.devIdx,
				 async: false, 
				 dataType: 'json',
				 success: function(data) {
					bootbox.alert($.i18n('Initiating Send Configuration...!'));
				 }
			});
		}

		ZWaveTransferPrimaryRole = function()
		{
			bootbox.confirm($.i18n("Are you sure you want to transfer the primary role?"), function(result) {
				if (result==true) {
					$.ajax({
						 url: "json.htm?type=command&param=zwavetransferprimaryrole&idx=" + $.devIdx,
						 async: false, 
						 dataType: 'json',
						 success: function(data) {
							bootbox.alert($.i18n('Initiating Transfer Primary Role...!'));
						 }
					});
				}
			});
		}

		ZWaveTopology = function()
		{
			$.ajax({
				 url: "json.htm?type=command&param=zwavestatecheck&idx=" + $.devIdx,
				 async: false, 
				 dataType: 'json',
				 success: function(data) {
					if (data.status == 'OK') {
						var topologywindow = "<center>ZWave Network Information</center><p><p><iframe src='../zwavetopology.html?hwid="+$.devIdx+"' name='topoframe' frameBorder='0' height='"+window.innerHeight*0.7+"' width='100%'/>";
						noty({
							text: topologywindow,
							type: 'alert',
							modal: true,
							buttons: [
								{addClass: 'btn btn-primary', text: 'Close', onClick: function($noty) 
									{$noty.close();
													
									}
								}]
						});
					}
					else {
						ShowNotify($.i18n('Error communicating with zwave controller!'), 2500, true);
					}
				 }
			});
		}

		RefreshOpenZWaveNodeTable = function()
		{
		  $('#modal').show();

			$('#updelclr #nodeupdate').attr("class", "btnstyle3-dis");
			$('#updelclr #nodedelete').attr("class", "btnstyle3-dis");
			$("#hardwarecontent #configuration").html("");
			$("#hardwarecontent #nodeparamstable #nodename").val("");
			
		  var oTable = $('#nodestable').dataTable();
		  oTable.fnClearTable();
		  
		  $.ajax({
			 url: "json.htm?type=openzwavenodes&idx="+$.devIdx,
			 async: false, 
			 dataType: 'json',
			 success: function(data) {
			  if (typeof data.result != 'undefined') {

				if (data.NodesQueried == true) {
					$("#zwavenodesqueried").hide();
				}
				else {
					$("#zwavenodesqueried").show();
				}
			  
				$.each(data.result, function(i,item){
					var status="ok";
					if (item.State == "Dead") {
						status="failed";
					}
					else if (item.State == "Sleep") {
						status="sleep";
					}
					else if (item.State == "Unknown") {
						status="unknown";
					}
					var statusImg='<img src="images/' + status + '.png" />';
					var healButton='<img src="images/heal.png" onclick="ZWaveHealNode('+item.NodeID+')" class="lcursor" title="'+$.i18n("Heal node")+'" />';
					
					var nodeStr = addLeadingZeros(item.NodeID,3) + " (0x" + addLeadingZeros(item.NodeID.toString(16),2) + ")";
					var addId = oTable.fnAddData( {
						"DT_RowId": item.idx,
						"Name": item.Name,
						"PollEnabled": item.PollEnabled,
						"Config": item.config,
						"State": item.State,
						"NodeID": item.NodeID,
						"HaveUserCodes": item.HaveUserCodes,
						"0": nodeStr,
						"1": item.Name,
						"2": item.Description,
						"3": item.LastUpdate,
						"4": item.PollEnabled,
						"5": statusImg+'&nbsp;&nbsp;'+healButton,
					} );
				});
			  }
			 }
		  });

			/* Add a click handler to the rows - this could be used as a callback */
			$("#nodestable tbody").off();
			$("#nodestable tbody").on( 'click', 'tr', function () {
				$('#updelclr #nodedelete').attr("class", "btnstyle3-dis");
				if ( $(this).hasClass('row_selected') ) {
					$(this).removeClass('row_selected');
					$('#updelclr #nodeupdate').attr("class", "btnstyle3-dis");
					$("#hardwarecontent #configuration").html("");
					$("#hardwarecontent #nodeparamstable #nodename").val("");
					$('#hardwarecontent #usercodegrp').hide();
				}
				else {
				  var oTable = $('#nodestable').dataTable();
					oTable.$('tr.row_selected').removeClass('row_selected');
					$(this).addClass('row_selected');
					$('#updelclr #nodeupdate').attr("class", "btnstyle3");
					var anSelected = fnGetSelected( oTable );
					if ( anSelected.length !== 0 ) {
						var data = oTable.fnGetData( anSelected[0] );
						var idx= data["DT_RowId"];
						$.myglobals.SelectedTimerIdx=idx;
						var iNode=parseInt(data["NodeID"]);
						$("#updelclr #nodeupdate").attr("href", "javascript:UpdateNode(" + idx + ")");
						$("#hardwarecontent #zwavecodemanagement").attr("href", "javascript:ZWaveUserCodeManagement(" + idx + ")");
						if (iNode>1) {
							$('#updelclr #nodedelete').attr("class", "btnstyle3");
							$("#updelclr #nodedelete").attr("href", "javascript:DeleteNode(" + idx + ")");
						}
						$("#hardwarecontent #nodeparamstable #nodename").val(data["1"]);
						$('#hardwarecontent #nodeparamstable #EnablePolling').prop('checked',(data["PollEnabled"]=="true"));
						if (iNode<2) {
							$("#hardwarecontent #nodeparamstable #trEnablePolling").hide();
						}
						else {
							$("#hardwarecontent #nodeparamstable #trEnablePolling").show();
						}
						
						if (data["HaveUserCodes"] == true) {
							$('#hardwarecontent #usercodegrp').show();
						}
						else {
							$('#hardwarecontent #usercodegrp').hide();
						}

						var szConfig="";
						if (typeof data["Config"] != 'undefined') {
							//Create configuration setup
							szConfig='<a class="btnstyle3" id="noderequeststoredvalues" data-i18n="RequestConfiguration" onclick="RequestZWaveConfiguration(' + idx + ');">Request current stored values from device</a><br /><br />';
							var bHaveConfiguration=false;
							$.each(data["Config"], function(i,item){
								bHaveConfiguration=true;
								if (item.type=="list") {
									szConfig+="<b>"+item.index+". "+item.label+":</b><br>";
									szConfig+='<select style="width:100%" class="combobox ui-corner-all" id="'+item.index+'">';
									var iListItem=0;
									var totListItems=parseInt(item.list_items);
									for (iListItem=0; iListItem<totListItems; iListItem++)
									{
										var szComboOption='<option value="' + iListItem + '"';
										var szOptionTxt=item.listitem[iListItem];
										if (szOptionTxt==item.value) {
											szComboOption+=' selected="selected"';
										}
										szComboOption+='>' + szOptionTxt +'</option>';
										szConfig+=szComboOption;
									}
									szConfig+='</select>'
									if (item.units!="") {
										szConfig+=' (' + item.units + ')';
									}
								}
								else if (item.type=="bool") {
									szConfig+="<b>"+item.index+". "+item.label+":</b><br>";
									szConfig+='<select style="width:100%" class="combobox ui-corner-all" id="'+item.index+'">';
									
									var szComboOption='<option value="False"';
									if (item.value=="False") {
										szComboOption+=' selected="selected"';
									}
									szComboOption+='>False</option>';
									szConfig+=szComboOption;

									szComboOption='<option value="True"';
									if (item.value=="True") {
										szComboOption+=' selected="selected"';
									}
									szComboOption+='>True</option>';
									szConfig+=szComboOption;

									szConfig+='</select>'
									if (item.units!="") {
										szConfig+=' (' + item.units + ')';
									}
								}
								else if (item.type=="string") {
									szConfig+="<b>"+item.index+". "+item.label+":</b><br>";
									szConfig+='<input type="text" id="'+item.index+'" value="' + item.value + '" style="width: 600px; padding: .2em;" class="text ui-widget-content ui-corner-all" /><br>';
									
									if (item.units!="") {
										szConfig+=' (' + item.units + ')';
									}
									szConfig+=" (" + $.i18n("actual") + ": " + item.value + ")";
								}
								else {
									szConfig+="<b>"+item.index+". "+item.label+":</b> ";
									szConfig+='<input type="text" id="'+item.index+'" value="' + item.value + '" style="width: 50px; padding: .2em;" class="text ui-widget-content ui-corner-all" />';
									if (item.units!="") {
										szConfig+=' (' + item.units + ')';
									}
									szConfig+=" (" + $.i18n("actual") + ": " + item.value + ")";
								}
								szConfig+="<br /><br />";
								if (item.help!="") {
									szConfig+=item.help+"<br>";
								}
								szConfig+="Last Update: " + item.LastUpdate;
								szConfig+="<br /><br />";
							});
							if (bHaveConfiguration==true) {
								szConfig+='<a class="btnstyle3" id="nodeapplyconfiguration" data-i18n="ApplyConfiguration" onclick="ApplyZWaveConfiguration(' + idx + ');" >Apply configuration for this device</a><br />';
							}
						}
						$("#hardwarecontent #configuration").html(szConfig);
					}
				}
			}); 

		  $('#modal').hide();
		}

		ZWaveStartUserCodeEnrollment = function()
		{
			$.ajax({
				 url: "json.htm?type=command&param=zwavestartusercodeenrollmentmode&idx=" + $.devIdx,
				 async: false, 
				 dataType: 'json',
				 success: function(data) {
					bootbox.alert($.i18n('User Code Enrollment started. You have 30 seconds to include the new key...!'));
				 }
			});
		}

		RemoveUserCode = function(index)
		{
			bootbox.confirm($.i18n("Are you sure to delete this User Code?"), function(result) {
				if (result==true) {
					$.ajax({
						 url: "json.htm?type=command&param=zwaveremoveusercode&idx=" + $.nodeIdx +"&codeindex=" + index,
						 async: false, 
						 dataType: 'json',
						 success: function(data) {
							RefreshHardwareTable();
						 },
						 error: function(){
								HideNotify();
								ShowNotify($.i18n('Problem deleting User Code!'), 2500, true);
						 }     
					});
				}
			});
		}

		RefreshOpenZWaveUserCodesTable = function()
		{
		  $('#modal').show();

		  var oTable = $('#codestable').dataTable();
		  oTable.fnClearTable();
		  $.ajax({
			 url: "json.htm?type=command&param=zwavegetusercodes&idx="+$.nodeIdx,
			 dataType: 'json',
			 async: false, 
			 success: function(data) {
				if (typeof data.result != 'undefined') {
					$.each(data.result, function(i,item){
						var removeButton='<span class="label label-info lcursor" onclick="RemoveUserCode(' + item.index + ');">Remove</span>';
						var addId = oTable.fnAddData( {
							"DT_RowId": item.index,
							"Code": item.index,
							"Value": item.code,
							"0": item.index,
							"1": item.code,
							"2": removeButton
						} );
					});
				}
			 }
		  });
			/* Add a click handler to the rows - this could be used as a callback */
			$("#codestable tbody").off();
			$("#codestable tbody").on( 'click', 'tr', function () {
				if ( $(this).hasClass('row_selected') ) {
					$(this).removeClass('row_selected');
				}
				else {
					var oTable = $('#codestable').dataTable();
					oTable.$('tr.row_selected').removeClass('row_selected');
					$(this).addClass('row_selected');
					var anSelected = fnGetSelected( oTable );
					if ( anSelected.length !== 0 ) {
						var data = oTable.fnGetData( anSelected[0] );
						//var idx= data["DT_RowId"];
					}
				}
			}); 
		  $('#modal').hide();
		}

		ZWaveUserCodeManagement = function(idx)
		{
			$.nodeIdx=idx;
			cursordefault();
			var htmlcontent = '';
			htmlcontent+=$('#openzwaveusercodes').html();
			var bString="EditOpenZWave("+$.devIdx+",'"+$.devName + "',0,0,0,0,0)";
			$('#hardwarecontent').html(GetBackbuttonHTMLTable(bString)+htmlcontent);
			$('#hardwarecontent').i18n();
			$('#hardwarecontent #nodeidx').val(idx);
			var oTable = $('#codestable').dataTable( {
			  "sDom": '<"H"lfrC>t<"F"ip>',
			  "oTableTools": {
				"sRowSelect": "single",
			  },
			  "aaSorting": [[ 0, "desc" ]],
			  "bSortClasses": false,
			  "bProcessing": true,
			  "bStateSave": true,
			  "bJQueryUI": true,
			  "aLengthMenu": [[25, 50, 100, -1], [25, 50, 100, "All"]],
			  "iDisplayLength" : 25,
			  "sPaginationType": "full_numbers"
			} );
			RefreshOpenZWaveUserCodesTable();
		}

		EditOpenZWave = function(idx,name,Mode1,Mode2,Mode3,Mode4,Mode5)
		{
			$.devIdx=idx;
			$.devName=name;
			cursordefault();
			var htmlcontent = '';
			htmlcontent='<p><center><h2><span data-i18n="Device"></span>: ' + name + '</h2></center></p>\n';
			htmlcontent+=$('#openzwave').html();
			$('#hardwarecontent').html(GetBackbuttonHTMLTable('ShowHardware')+htmlcontent);
			$('#hardwarecontent #zwave_configdownload').attr("href", "zwavegetconfig.php?idx="+idx);
			$('#hardwarecontent').i18n();

			$('#hardwarecontent #usercodegrp').hide();

			var oTable = $('#nodestable').dataTable( {
			  "sDom": '<"H"lfrC>t<"F"ip>',
			  "oTableTools": {
				"sRowSelect": "single",
			  },
			  "aaSorting": [[ 0, "desc" ]],
			  "bSortClasses": false,
			  "bProcessing": true,
			  "bStateSave": true,
			  "bJQueryUI": true,
			  "aLengthMenu": [[25, 50, 100, -1], [25, 50, 100, "All"]],
			  "iDisplayLength" : 25,
			  "sPaginationType": "full_numbers"
			} );

			$('#hardwarecontent #idx').val(idx);
			
			RefreshOpenZWaveNodeTable();
		}

		SetOpenThermSettings = function()
		{
		  $.post("setopenthermsettings.webem", $("#hardwarecontent #openthermform").serialize(), function(data) {
		   ShowHardware();
		  });
		}

		EditOpenTherm = function(idx,name,Mode1,Mode2,Mode3,Mode4,Mode5)
		{
		//Mode1=Outside Temperature Sensor DeviceIdx, 0=Not Using
			$.devIdx=idx;
			cursordefault();
			var htmlcontent = '';
			htmlcontent='<p><center><h2><span data-i18n="Device"></span>: ' + name + '</h2></center></p>\n';
			htmlcontent+=$('#opentherm').html();
			$('#hardwarecontent').html(GetBackbuttonHTMLTable('ShowHardware')+htmlcontent);
			$('#hardwarecontent').i18n();

			$('#hardwarecontent #idx').val(idx);
			$('#hardwarecontent #combooutsidesensor >option').remove();
			var option = $('<option />');
			option.attr('value', 0).text("Use Build In");
			$("#hardwarecontent #combooutsidesensor").append(option);
			
			$('#hardwarecontent #submitbuttonopentherm').click(function (e) {
				e.preventDefault();
				SetOpenThermSettings();
			});
			
			//Get Temperature Sensors
			$.ajax({
				 url: "json.htm?type=devices&filter=temp&used=true&order=Name",
				 async: false, 
				 dataType: 'json',
				 success: function(data) {
					if (typeof data.result != 'undefined') 
					{
						$.each(data.result, function(i,item){
							if (typeof item.Temp != 'undefined') {
								var option = $('<option />');
								option.attr('value', item.idx).text(item.Name+" ("+item.Temp +"\u00B0)");
								$("#hardwarecontent #combooutsidesensor").append(option);
							}
						});
					}
					$("#hardwarecontent #combooutsidesensor").val(Mode1);
				 }
			}); 
			$("#hardwarecontent #combooutsidesensor").val(Mode1);
		}

		SetRFXCOMMode = function()
		{
		  $.post("setrfxcommode.webem", $("#hardwarecontent #settings").serialize(), function(data) {
		   SwitchLayout('Dashboard');
		  });
		}

		SetRego6XXType = function()
		{
		  $.post("setrego6xxtype.webem", $("#hardwarecontent #regotype").serialize(), function(data) {
		   ShowHardware();
		  });
		}

		SetS0MeterType = function()
		{
		  $.post("sets0metertype.webem", $("#hardwarecontent #s0metertype").serialize(), function(data) {
		   ShowHardware();
		  });
		}

		SetLimitlessType = function()
		{
		  $.post("setlimitlesstype.webem", $("#hardwarecontent #limitform").serialize(), function(data) {
		   ShowHardware();
		  });
		}

		CreateDummySensors = function(idx,name)
		{
			$.devIdx=idx;
			$( "#dialog-createsensor" ).dialog({
				  autoOpen: false,
				  width: 380,
				  height: 160,
				  modal: true,
				  resizable: false,
				  buttons: {
					  "OK": function() {
						  var bValid = true;
						  $( this ).dialog( "close" );
						  
							var SensorType=$("#dialog-createsensor #sensortype option:selected").val();
							if (typeof SensorType == 'undefined') {
								bootbox.alert($.i18n('No Sensor Type Selected!'));
								return ;
							}
							$.ajax({
								 url: "json.htm?type=createvirtualsensor&idx=" + $.devIdx + "&sensortype=" + SensorType,
								 async: false, 
								 dataType: 'json',
								 success: function(data) {
									if (data.status == 'OK') {
										ShowNotify($.i18n('Sensor Created, and can be found in the devices tab!'), 2500);
									}
									else {
										ShowNotify($.i18n('Problem creating Sensor!'), 2500, true);
									}
								 },
								 error: function(){
										HideNotify();
										ShowNotify($.i18n('Problem creating Sensor!'), 2500, true);
								 }     
							});
					  },
					  Cancel: function() {
						  $( this ).dialog( "close" );
					  }
				  },
				  close: function() {
					$( this ).dialog( "close" );
				  }
			});
			
			$( "#dialog-createsensor" ).i18n();
			$( "#dialog-createsensor" ).dialog( "open" );
		}

		RefreshHardwareTable = function()
		{
		  $('#modal').show();

			$('#updelclr #hardwareupdate').attr("class", "btnstyle3-dis");
			$('#updelclr #hardwaredelete').attr("class", "btnstyle3-dis");

		  var oTable = $('#hardwaretable').dataTable();
		  oTable.fnClearTable();
		  
		  $.ajax({
			 url: "json.htm?type=hardware", 
			 async: false, 
			 dataType: 'json',
			 success: function(data) {
				
			  if (typeof data.result != 'undefined') {
				$.each(data.result, function(i,item){

					var HwTypeStrOrg=$.myglobals.HardwareTypesStr[item.Type];
					var HwTypeStr=HwTypeStrOrg;
				
					if (typeof HwTypeStr == 'undefined') {
						HwTypeStr="???? Unknown (NA/Not supported)";
					}
				
					var SerialName="Unknown!?";
					if ((HwTypeStr.indexOf("LAN") >= 0)||(HwTypeStr.indexOf("Domoticz") >= 0) ||(HwTypeStr.indexOf("Harmony") >= 0)||(HwTypeStr.indexOf("Philips Hue") >= 0))
					{
						SerialName=item.Port;
					}
					else if ((item.Type == 7)||(item.Type == 11))
					{
						SerialName="USB";
					}
					else if (item.Type == 12)
					{
						SerialName="System";
					}
					else if (item.Type == 13)
					{
						SerialName="I2C";
					}
					else if ((item.Type == 14)||(item.Type == 25)||(item.Type == 28)||(item.Type == 30)||(item.Type == 34))
					{
						SerialName="WWW";
					}
					else if ((item.Type == 15)||(item.Type == 23)||(item.Type == 26)||(item.Type == 27))
					{
						SerialName="";
					}
					else if ((item.Type == 16) || (item.Type == 32))
					{
						SerialName="GPIO";
					}
					else
					{
						var serpos=jQuery.inArray(item.Port, $.myglobals.SerialPortVal);
						if (serpos!=-1) {
							SerialName=$.myglobals.SerialPortStr[serpos];
						}
					}

					var enabledstr="No";
					if (item.Enabled=="true") {
						enabledstr="Yes";
					}
					if (HwTypeStr.indexOf("RFXCOM") >= 0)
					{
						HwTypeStr+='<br>Firmware version: ' + item.Mode2;
						HwTypeStr+=' <span class="label label-info lcursor" onclick="EditRFXCOMMode(' + item.idx + ',\'' + item.Name + '\',' + item.Mode1 + ',' + item.Mode2+ ',' + item.Mode3+ ',' + item.Mode4+ ',' + item.Mode5 + ');">Set Mode</span>';
					}
					else if (HwTypeStr.indexOf("S0 Meter USB") >= 0) {
						HwTypeStr+=' <span class="label label-info lcursor" onclick="EditS0MeterType(' + item.idx + ',\'' + item.Name + '\',' + item.Mode1 + ',' + item.Mode2+ ',' + item.Mode3+ ',' + item.Mode4+ ',' + item.Mode5 + ');">Set Mode</span>';
					}
					else if (HwTypeStr.indexOf("Limitless") >= 0) {
						HwTypeStr+=' <span class="label label-info lcursor" onclick="EditLimitlessType(' + item.idx + ',\'' + item.Name + '\',' + item.Mode1 + ',' + item.Mode2+ ',' + item.Mode3+ ',' + item.Mode4+ ',' + item.Mode5 + ');">Set Mode</span>';
					}
					else if (HwTypeStr.indexOf("OpenZWave") >= 0) {
						if (typeof item.NodesQueried != 'undefined') {
							var lblStatus="label-info";
							if (item.NodesQueried != true) {
								lblStatus="label-important";
							}
							HwTypeStr+=' <span class="label ' + lblStatus + ' lcursor" onclick="EditOpenZWave(' + item.idx + ',\'' + item.Name + '\',' + item.Mode1 + ',' + item.Mode2+ ',' + item.Mode3+ ',' + item.Mode4+ ',' + item.Mode5 + ');">Setup</span>';
						}
					}
					else if (HwTypeStr.indexOf("SBFSpot") >= 0) {
						HwTypeStr+=' <span class="label label-info lcursor" onclick="EditSBFSpot(' + item.idx + ',\'' + item.Name + '\',' + item.Mode1 + ',' + item.Mode2+ ',' + item.Mode3+ ',' + item.Mode4+ ',' + item.Mode5 + ');">Setup</span>';
					}
					else if (HwTypeStr.indexOf("OpenTherm") >= 0) {
						HwTypeStr+=' <span class="label label-info lcursor" onclick="EditOpenTherm(' + item.idx + ',\'' + item.Name + '\',' + item.Mode1 + ',' + item.Mode2+ ',' + item.Mode3+ ',' + item.Mode4+ ',' + item.Mode5 + ');">Setup</span>';
					}
					else if (HwTypeStr.indexOf("Wake-on-LAN") >= 0) {
						HwTypeStr+=' <span class="label label-info lcursor" onclick="EditWOL(' + item.idx + ',\'' + item.Name + '\',' + item.Mode1 + ',' + item.Mode2+ ',' + item.Mode3+ ',' + item.Mode4+ ',' + item.Mode5 + ');">Setup</span>';
					}
					else if (HwTypeStr.indexOf("P1 Smart Meter USB") >= 0) {
						HwTypeStr+=' <span class="label label-info lcursor" onclick="EditP1USB(' + item.idx + ',\'' + item.Name + '\',' + item.Mode1 + ',' + item.Mode2+ ',' + item.Mode3+ ',' + item.Mode4+ ',' + item.Mode5 + ');">Setup</span>';
					}
					else if (HwTypeStr.indexOf("Dummy") >= 0) {
						HwTypeStr+=' <span class="label label-info lcursor" onclick="CreateDummySensors(' + item.idx + ',\'' + item.Name + '\');">Create Virtual Sensors</span>';
					}
					else if (HwTypeStr.indexOf("Rego 6XX") >= 0)
					{
						HwTypeStr+='<br>Type: ';
						if (item.Mode1=="0")
						{
							HwTypeStr+='600-635, 637 single language';
						}
						else if(item.Mode1=="1")
						{
							HwTypeStr+='636';
						}
						else if(item.Mode1=="2")
						{
							HwTypeStr+='637 multi language';
						}
						HwTypeStr+=' <span class="label label-info lcursor" onclick="EditRego6XXType(' + item.idx + ',\'' + item.Name + '\',' + item.Mode1 + ',' + item.Mode2+ ',' + item.Mode3+ ',' + item.Mode4+ ',' + item.Mode5 + ');">Change Type</span>';
					}
					
					var sDataTimeout="";
					if (item.DataTimeout==0) {
						sDataTimeout=$.i18n("Disabled");
					}
					else if (item.DataTimeout<60) {
						sDataTimeout=item.DataTimeout + " " + $.i18n("Seconds");
					}
					else if (item.DataTimeout<3600) {
						var minutes=item.DataTimeout/60;
						if (minutes==1) {
							sDataTimeout=minutes + " " + $.i18n("Minute");
						}
						else {
							sDataTimeout=minutes + " " + $.i18n("Minutes");
						}
					}
					else if (item.DataTimeout<=86400) {
						var hours=item.DataTimeout/3600;
						if (hours==1) {
							sDataTimeout=hours + " " + $.i18n("Hour");
						}
						else {
							sDataTimeout=hours + " " + $.i18n("Hours");
						}
					}
					else {
						var days=item.DataTimeout/86400;
						if (days==1) {
							sDataTimeout=days + " " + $.i18n("Day");
						}
						else {
							sDataTimeout=days + " " + $.i18n("Days");
						}
					}
							
					var addId = oTable.fnAddData( {
						"DT_RowId": item.idx,
						"Username": item.Username,
						"Password": item.Password,
						"Enabled": item.Enabled,
						"Mode1": item.Mode1,
						"Mode2": item.Mode2,
						"Mode3": item.Mode3,
						"Mode4": item.Mode4,
						"Mode5": item.Mode5,
						"Type" : HwTypeStrOrg,
						"IntPort": item.Port,
						"DataTimeout": item.DataTimeout,
						"0": item.Name,
						"1": enabledstr,
						"2": HwTypeStr,
						"3": item.Address,
						"4": SerialName,
						"5": sDataTimeout
					} );
				});
			  }
			 }
		  });

			/* Add a click handler to the rows - this could be used as a callback */
			$("#hardwaretable tbody").off();
			$("#hardwaretable tbody").on( 'click', 'tr', function () {
				if ( $(this).hasClass('row_selected') ) {
					$(this).removeClass('row_selected');
					$('#updelclr #hardwareupdate').attr("class", "btnstyle3-dis");
					$('#updelclr #hardwaredelete').attr("class", "btnstyle3-dis");
				}
				else {
					var oTable = $('#hardwaretable').dataTable();
					oTable.$('tr.row_selected').removeClass('row_selected');
					$(this).addClass('row_selected');
					$('#updelclr #hardwareupdate').attr("class", "btnstyle3");
					$('#updelclr #hardwaredelete').attr("class", "btnstyle3");
					var anSelected = fnGetSelected( oTable );
					if ( anSelected.length !== 0 ) {
						var data = oTable.fnGetData( anSelected[0] );
						var idx= data["DT_RowId"];
						$.myglobals.SelectedTimerIdx=idx;
						$("#updelclr #hardwareupdate").attr("href", "javascript:UpdateHardware(" + idx + "," + data["Mode1"] + "," + data["Mode2"] + "," + data["Mode3"] + "," + data["Mode4"] + "," + data["Mode5"] + ")");
						$("#updelclr #hardwaredelete").attr("href", "javascript:DeleteHardware(" + idx + ")");
						$("#hardwarecontent #hardwareparamstable #hardwarename").val(data["0"]);
						$("#hardwarecontent #hardwareparamstable #combotype").val(jQuery.inArray(data["Type"], $.myglobals.HardwareTypesStr));

						$('#hardwarecontent #hardwareparamstable #enabled').prop('checked',(data["Enabled"]=="true"));
						$('#hardwarecontent #hardwareparamstable #combodatatimeout').val(data["DataTimeout"]);

						UpdateHardwareParamControls();
						if ((data["Type"].indexOf("TE923") >= 0)||(data["Type"].indexOf("Volcraft") >= 0)||(data["Type"].indexOf("1-Wire") >= 0)||(data["Type"].indexOf("BMP085") >= 0)||(data["Type"].indexOf("Dummy") >= 0) ||(data["Type"].indexOf("PiFace") >= 0))
						{
							//nothing to be set
						}
						else if (data["Type"].indexOf("USB") >= 0) {
							$("#hardwarecontent #hardwareparamsserial #comboserialport").val(data["IntPort"]);
						}
						else if (((data["Type"].indexOf("LAN") >= 0) && (data["Type"].indexOf("YouLess") == -1)) ||(data["Type"].indexOf("Domoticz") >= 0) ||(data["Type"].indexOf("Harmony") >= 0)) {
							$("#hardwarecontent #hardwareparamsremote #tcpaddress").val(data["3"]);
							$("#hardwarecontent #hardwareparamsremote #tcpport").val(data["4"]);
						}
						else if (((data["Type"].indexOf("LAN") >= 0) && (data["Type"].indexOf("YouLess") >= 0)) ||(data["Type"].indexOf("Domoticz") >= 0) ||(data["Type"].indexOf("Harmony") >= 0)) {
							$("#hardwarecontent #hardwareparamsremote #tcpaddress").val(data["3"]);
							$("#hardwarecontent #hardwareparamsremote #tcpport").val(data["4"]);
							$("#hardwarecontent #hardwareparamslogin #password").val(data["Password"]);
						}
						else if ((data["Type"].indexOf("Underground") >= 0)||(data["Type"].indexOf("Forecast") >= 0)) {
							$("#hardwarecontent #hardwareparamsunderground #apikey").val(data["Username"]);
							$("#hardwarecontent #hardwareparamsunderground #location").val(data["Password"]);
						}
						else if (data["Type"].indexOf("SBFSpot") >= 0) {
							$("#hardwarecontent #hardwareparamslocation #location").val(data["Username"]);
						}
						else if (data["Type"].indexOf("Philips Hue") >= 0) {
							$("#hardwarecontent #hardwareparamsremote #tcpaddress").val(data["3"]);
							$("#hardwarecontent #hardwareparamsremote #tcpport").val(data["4"]);
							$("#hardwarecontent #hardwareparamsphilipshue #username").val(data["Username"]);
						}
						if ((data["Type"].indexOf("Domoticz") >= 0)||(data["Type"].indexOf("ICY") >= 0) ||(data["Type"].indexOf("Harmony") >= 0)||(data["Type"].indexOf("Toon") >= 0)||(data["Type"].indexOf("PVOutput") >= 0)) {
							$("#hardwarecontent #hardwareparamslogin #username").val(data["Username"]);
							$("#hardwarecontent #hardwareparamslogin #password").val(data["Password"]);
						}
					}
				}
			}); 

		  $('#modal').hide();
		}

		RegisterPhilipsHue = function()
		{
			var username=$("#hardwarecontent #hardwareparamsphilipshue #username").val();
			$.ajax({
				url: "json.htm?type=command&param=registerhue" +
					"&idx=" + $.myglobals.SelectedTimerIdx +
					"&username=" + username,
				 async: false, 
				 dataType: 'json',
				 success: function(data) {
					if (data.status=="ERR") {
						ShowNotify(data.statustext, 2500, true);
						return;
					}
					$("#hardwarecontent #hardwareparamsphilipshue #username").val(data.username)
					ShowNotify($.i18n('Registration successful!'),2500);
				 },
				 error: function(){
						HideNotify();
						ShowNotify($.i18n('Problem registrating with the Philips Hue bridge!'), 2500, true);
				 }     
			});
		}

		UpdateHardwareParamControls = function()
		{
			var text = $("#hardwarecontent #hardwareparamstable #combotype option:selected").text();

			$("#hardwarecontent #username").show();
			$("#hardwarecontent #lblusername").show();
					
			$("#hardwarecontent #divlocation").hide();
			$("#hardwarecontent #divphilipshue").hide();

			if ((text.indexOf("TE923") >= 0)||(text.indexOf("Volcraft") >= 0)||(text.indexOf("BMP085") >= 0)||(text.indexOf("Dummy") >= 0)||(text.indexOf("PiFace") >= 0))
			{
				$("#hardwarecontent #divserial").hide();
				$("#hardwarecontent #divremote").hide();
				$("#hardwarecontent #divlogin").hide();
				$("#hardwarecontent #divunderground").hide();
			}
			else if (text.indexOf("USB") >= 0)
			{
				$("#hardwarecontent #divserial").show();
				$("#hardwarecontent #divremote").hide();
				$("#hardwarecontent #divlogin").hide();
				$("#hardwarecontent #divunderground").hide();
			}
			else if (text.indexOf("LAN") >= 0 && text.indexOf("YouLess") == -1)
			{
				$("#hardwarecontent #divserial").hide();
				$("#hardwarecontent #divremote").show();
				$("#hardwarecontent #divlogin").hide();
				$("#hardwarecontent #divunderground").hide();
			}
			else if (text.indexOf("LAN") >= 0 && text.indexOf("YouLess") >= 0)
			{
				$("#hardwarecontent #divserial").hide();
				$("#hardwarecontent #divremote").show();
				$("#hardwarecontent #divlogin").show();
				$("#hardwarecontent #username").hide();
				$("#hardwarecontent #lblusername").hide();
				$("#hardwarecontent #divunderground").hide();
			}
			else if ((text.indexOf("Domoticz") >= 0) || (text.indexOf("Harmony") >= 0))
			{
				$("#hardwarecontent #divserial").hide();
				$("#hardwarecontent #divremote").show();
				$("#hardwarecontent #divlogin").show();
				$("#hardwarecontent #divunderground").hide();
			}
			else if (text.indexOf("SBFSpot") >= 0)
			{
				$("#hardwarecontent #divlocation").show();
				$("#hardwarecontent #divserial").hide();
				$("#hardwarecontent #divremote").hide();
				$("#hardwarecontent #divlogin").hide();
				$("#hardwarecontent #divunderground").hide();
				$("#hardwarecontent #username").hide();
				$("#hardwarecontent #lblusername").hide();
			}
			else if ((text.indexOf("ICY") >= 0)||(text.indexOf("Toon") >= 0)||(text.indexOf("PVOutput") >= 0))
			{
				$("#hardwarecontent #divserial").hide();
				$("#hardwarecontent #divremote").hide();
				$("#hardwarecontent #divlogin").show();
				$("#hardwarecontent #divunderground").hide();
			}
			else if ((text.indexOf("Underground") >= 0)||(text.indexOf("Forecast") >= 0))
			{
				$("#hardwarecontent #divserial").hide();
				$("#hardwarecontent #divremote").hide();
				$("#hardwarecontent #divlogin").hide();
				$("#hardwarecontent #divunderground").show();
			}
			else if (text.indexOf("Philips Hue") >= 0)
			{
				$("#hardwarecontent #divserial").hide();
				$("#hardwarecontent #divremote").show();
				$("#hardwarecontent #divlogin").hide();
				$("#hardwarecontent #divphilipshue").show();
				$("#hardwarecontent #divunderground").hide();
				$("#hardwarecontent #hardwareparamsremote #tcpport").val(80);
			}
			else
			{
				$("#hardwarecontent #divserial").hide();
				$("#hardwarecontent #divremote").hide();
				$("#hardwarecontent #divlogin").hide();
				$("#hardwarecontent #divunderground").hide();
			}
		}

		ShowHardware = function()
		{
			$('#modal').show();
			var htmlcontent = "";
			htmlcontent+=$('#hardwaremain').html();
			$('#hardwarecontent').html(htmlcontent);
			$('#hardwarecontent').i18n();
			var oTable = $('#hardwaretable').dataTable( {
			  "sDom": '<"H"lfrC>t<"F"ip>',
			  "oTableTools": {
				"sRowSelect": "single",
			  },
			  "aaSorting": [[ 0, "desc" ]],
			  "bSortClasses": false,
			  "bProcessing": true,
			  "bStateSave": true,
			  "bJQueryUI": true,
			  "aLengthMenu": [[25, 50, 100, -1], [25, 50, 100, "All"]],
			  "iDisplayLength" : 25,
			  "sPaginationType": "full_numbers"
			} );

			$("#hardwarecontent #hardwareparamstable #combotype").change(function() { 
				UpdateHardwareParamControls();
			});
			
			$('#modal').hide();
			RefreshHardwareTable();
			UpdateHardwareParamControls();
		}

		init();

		function init()
		{
			//global var
			$.devIdx=0;
			$.myglobals = {
				HardwareTypesStr : [],
				SerialPortVal : [],
				SerialPortStr : [],
				SelectedHardwareIdx: 0
			};
			$('#hardwareparamstable #combotype > option').each(function() {
				 $.myglobals.HardwareTypesStr[$(this).val()]=$(this).text();
			});
			
			//Get Serial devices
			$("#hardwareparamsserial #comboserialport").html("");
			$.ajax({
			 url: "json.htm?type=command&param=serial_devices",
			 async: false, 
			 dataType: 'json',
			 success: function(data) {
				if (typeof data.result != 'undefined') {
					$.each(data.result, function(i,item) {
						var option = $('<option />');
						option.attr('value', item.value).text(item.name);
						$("#hardwareparamsserial #comboserialport").append(option);
					});
				}
			 }
			});
			
			$('#hardwareparamsserial #comboserialport > option').each(function() {
				 $.myglobals.SerialPortStr.push($(this).text());
				 $.myglobals.SerialPortVal.push(parseInt($(this).val()));
			});
			
			ShowHardware();
		
		};
	} ]);
});