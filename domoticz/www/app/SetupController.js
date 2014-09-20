define(['app'], function (app) {
	app.controller('SetupController', [ '$scope', '$window', '$location', '$http', '$interval', function($scope,$window,$location,$http,$interval) {

		googleMapsCallback = function() {
				$( "#dialog-findlatlong" ).dialog( "open" );
		  };

		$scope.GetGeoLocation = function() {
		  $.ajax({
				url: "https://maps.googleapis.com/maps/api/js?v=3&callback=googleMapsCallback&sensor=false",
				dataType: "script",
				cache: true
		  });
		}

		$scope.AllowNewHardware = function(minutes)
		{
			$.ajax({
				 url: "json.htm?type=command&param=allownewhardware&timeout=" + minutes,
				 async: false, 
				 dataType: 'json',
				 success: function(data) {
					SwitchLayout('Log');
					var msg=$.i18n('Allowing new sensors for ') + minutes + ' ' + $.i18n('Minutes');
					ShowNotify(msg, 3000);
				 }
			});
		}

		$scope.TestProwlNotification = function()
		{
		  var ProwlAPI=$("#prowltable #apikey").val();
		  if (ProwlAPI=="") {
			ShowNotify($.i18n('Please enter the API key!...'), 3500, true);
			return;
		  }
		  var url="http://api.prowlapp.com/publicapi/add?apikey=" + ProwlAPI + "&priority=0&application=Domoticz&event=Test Message&description=This is a test message!";
		  $.get(url, function(data) {
		  });  
		  ShowNotify($.i18n('Notification send!<br>Should arrive at your device soon...'), 3000);
		}

		$scope.TestNMANotification= function()
		{
		  var NMAAPI=$("#nmatable #apikey").val();
		  if (NMAAPI=="") {
			ShowNotify($.i18n('Please enter the API key!...'), 3500, true);
			return;
		  }
		  var url="http://www.notifymyandroid.com/publicapi/notify?apikey=" + NMAAPI + "&priority=0&application=Domoticz&event=Test Message&description=This is a test message!";
		  $.get(url, function(data) {
		  });  
		  ShowNotify($.i18n('Notification send!<br>Should arrive at your device soon...'), 3000);
		}

		$scope.TestPushoverNotification= function()
		{
		  var POAPI=$("#pushovertable #apikey").val();
		  if (POAPI=="") {
			ShowNotify($.i18n('Please enter the API key!...'), 3500, true);
			return;
		  }
		  var POUSERID=$("#pushovertable #pouserid").val();
		  if (POUSERID=="") {
			ShowNotify($.i18n('Please enter the user id!...'), 3500, true);
			return;
		  }
			$.ajax({
				url: "json.htm?type=command&param=testpushover&poapi="+POAPI+"&pouser="+POUSERID,
				async: false, 
				dataType: 'json',
				success: function(data) {
					if (data.status != "OK") {
						HideNotify();
						ShowNotify($.i18n('Problem sending notification, please check credentials!'), 3000, true);
						return;
					}
					else {
						HideNotify();
						ShowNotify($.i18n('Notification send!<br>Should arrive at your device soon...'), 3000);
					}
				},
				error: function(){
					HideNotify();
					ShowNotify($.i18n('Problem sending notification, please check credentials!'), 3000, true);
				}
			});
		  
		}

		$scope.TestEmailNotification = function()
		{
			var EmailServer=$("#emailtable #EmailServer").val();
			if (EmailServer=="") {
				ShowNotify($.i18n('Invalid Email Settings...'), 2000, true);
				return;
			}
			var EmailPort=$("#emailtable #EmailPort").val();
			if (EmailPort=="") {
				ShowNotify($.i18n('Invalid Email Settings...'), 2000, true);
				return;
			}
			var EmailFrom=$("#emailtable #EmailFrom").val();
			var EmailTo=$("#emailtable #EmailTo").val();
			var EmailUsername=$("#emailtable #EmailUsername").val();
			var EmailPassword=$("#emailtable #EmailPassword").val();
			if ((EmailFrom=="")||(EmailTo=="")) {
				ShowNotify($.i18n('Invalid Email From/To Settings...'), 2000, true);
				return;
			}
			if ((EmailUsername!="")&&(EmailPassword=="")) {
				ShowNotify($.i18n('Please enter an Email Password...'), 2000, true);
				return;
			}
			$.ajax({
				url: "json.htm?type=command&param=testemail"+
					"&EmailFrom="+EmailFrom+
					"&EmailTo="+EmailTo+
					"&EmailServer="+EmailServer+
					"&EmailPort="+EmailPort+
					"&EmailUsername="+EmailUsername+
					"&EmailPassword="+EmailPassword, 
				async: false, 
				dataType: 'json',
				success: function(data) {
					if (data.status != "OK") {
						HideNotify();
						ShowNotify($.i18n('Problem sending Email, please check credentials!'), 2500, true);
						return;
					}
					else {
						HideNotify();
						ShowNotify($.i18n('An Email has been delivered<br>Please check your inbox!'), 2500);
					}
				},
				error: function(){
					HideNotify();
					ShowNotify($.i18n('Problem sending Email, please check credentials!'), 2500, true);
				}
			});
		}

		$scope.ShowSettings = function()
		{
		  var sunRise="";
		  var sunSet="";
		  $.ajax({
			 url: "json.htm?type=command&param=getSunRiseSet",
			 async: false, 
			 dataType: 'json',
			 success: function(data) {
				if (typeof data.Sunrise != 'undefined') {
				  sunRise=data.Sunrise;
				  sunSet=data.Sunset;
				}
			 }
		  });
		  
			var suntext="";
		  if (sunRise!="")
		  {
			suntext='<br>' + $.i18n('SunRise') + ': ' + sunRise + ', ' + $.i18n('SunSet') + ': ' + sunSet + '<br><br>\n';
			$("#sunriseset").html(suntext);
		  }
		  

		  $.ajax({
			 url: "json.htm?type=settings", 
			 async: false, 
			 dataType: 'json',
			 success: function(data) {
			  if (typeof data.Location != 'undefined') {
				$("#locationtable #Latitude").val(data.Location.Latitude);
				$("#locationtable #Longitude").val(data.Location.Longitude);
			  }
			  if (typeof data.ProwlAPI != 'undefined') {
				$("#prowltable #apikey").val(data.ProwlAPI);
			  }
			  if (typeof data.NMAAPI != 'undefined') {
				$("#nmatable #apikey").val(data.NMAAPI);
			  }
			  if (typeof data.PushoverAPI != 'undefined') {
				$("#pushovertable #apikey").val(data.PushoverAPI);
			  }
			  if (typeof data.PushoverUser != 'undefined') {
				$("#pushovertable #pouserid").val(data.PushoverUser);
			  }
			  if (typeof data.LightHistoryDays != 'undefined') {
				$("#lightlogtable #LightHistoryDays").val(data.LightHistoryDays);
			  }
			  if (typeof data.ShortLogDays != 'undefined') {
				$("#shortlogtable #comboshortlogdays").val(data.ShortLogDays);
			  }
			  if (typeof data.DashboardType != 'undefined') {
				$("#dashmodetable #combosdashtype").val(data.DashboardType);
			  }
			  if (typeof data.MobileType != 'undefined') {
				$("#mobilemodetable #combosmobiletype").val(data.MobileType);
			  }
			  if (typeof data.WebUserName != 'undefined') {
				$("#webtable #WebUserName").val(data.WebUserName);
			  }
			  if (typeof data.WebPassword != 'undefined') {
				$("#webtable #WebPassword").val(data.WebPassword);
			  }
			  if (typeof data.SecPassword != 'undefined') {
				$("#sectable #SecPassword").val(data.SecPassword);
			  }
			  if (typeof data.ProtectionPassword != 'undefined') {
				$("#protectiontable #ProtectionPassword").val(data.ProtectionPassword);
			  }
			  if (typeof data.WebLocalNetworks != 'undefined') {
				$("#weblocaltable #WebLocalNetworks").val(data.WebLocalNetworks);
			  }
			  if (typeof data.EnergyDivider != 'undefined') {
				$("#rfxmetertable #EnergyDivider").val(data.EnergyDivider);
			  }
			  if (typeof data.CostEnergy != 'undefined') {
				$("#rfxmetertable #CostEnergy").val(data.CostEnergy);
			  }
			  if (typeof data.CostEnergyT2 != 'undefined') {
				$("#rfxmetertable #CostEnergyT2").val(data.CostEnergyT2);
			  }
			  if (typeof data.GasDivider != 'undefined') {
				$("#rfxmetertable #GasDivider").val(data.GasDivider );
			  }
			  if (typeof data.CostGas!= 'undefined') {
				$("#rfxmetertable #CostGas").val(data.CostGas);
			  }
			  if (typeof data.WaterDivider != 'undefined') {
				$("#rfxmetertable #WaterDivider").val(data.WaterDivider );
			  }
			  if (typeof data.CostWater!= 'undefined') {
				$("#rfxmetertable #CostWater").val(data.CostWater);
			  }
			  if (typeof data.RandomTimerFrame != 'undefined') {
				$("#randomtable #RandomSpread").val(data.RandomTimerFrame );
			  }
			  if (typeof data.ElectricVoltage!= 'undefined') {
				$("#owl113table #ElectricVoltage").val(data.ElectricVoltage);
			  }
			  if (typeof data.CM113DisplayType != 'undefined') {
				$("#owl113table #comboscm113type").val(data.CM113DisplayType);
			  }
			  if (typeof data.WindUnit != 'undefined') {
				$("#windmetertable #comboWindUnit").val(data.WindUnit);
			  }
			  if (typeof data.TempUnit != 'undefined') {
				$("#temperaturetable #comboTempUnit").val(data.TempUnit);
			  }
			  if (typeof data.UseAutoUpdate != 'undefined') {
				$("#autoupdatetable #checkforupdates").prop('checked',data.UseAutoUpdate==1);
			  }
			  if (typeof data.UseAutoBackup != 'undefined') {
				$("#autobackuptable #enableautobackup").prop('checked',data.UseAutoBackup==1);
			  }
			  if (typeof data.EmailFrom!= 'undefined') {
				$("#emailtable #EmailFrom").val(data.EmailFrom);
			  }
			  if (typeof data.EmailTo!= 'undefined') {
				$("#emailtable #EmailTo").val(data.EmailTo);
			  }
			  if (typeof data.EmailServer!= 'undefined') {
				$("#emailtable #EmailServer").val(data.EmailServer);
			  }
			  if (typeof data.EmailPort!= 'undefined') {
				$("#emailtable #EmailPort").val(data.EmailPort);
			  }
			  if (typeof data.EmailUsername!= 'undefined') {
				$("#emailtable #EmailUsername").val(data.EmailUsername);
			  }
			  if (typeof data.EmailPassword!= 'undefined') {
				$("#emailtable #EmailPassword").val(data.EmailPassword);
			  }
			  if (typeof data.UseEmailInNotifications != 'undefined') {
				$("#emailtable #useemailinnotificationsalerts").prop('checked',data.UseEmailInNotifications==1);
			  }
			  if (typeof data.EmailAsAttachment != 'undefined') {
				$("#emailtable #checkEmailAsAttachment").prop('checked',data.EmailAsAttachment==1);
			  }
			  if (typeof data.ActiveTimerPlan != 'undefined') {
				$("#timerplantable #comboTimerplan").val(data.ActiveTimerPlan);
			  }
			  if (typeof data.DoorbellCommand != 'undefined') {
				$("#doorbelltable #comboDoorbellCommand").val(data.DoorbellCommand);
			  }
			  if (typeof data.SmartMeterType != 'undefined') {
				$("#p1metertable #comboP1MeterType").val(data.SmartMeterType);
			  }
			  if (typeof data.EnableTabFloorplans != 'undefined') {
				$("#activemenustable #EnableTabFloorplans").prop('checked',data.EnableTabFloorplans==1);
			  }
			  if (typeof data.EnableTabLights != 'undefined') {
				$("#activemenustable #EnableTabLights").prop('checked',data.EnableTabLights==1);
			  }
			  if (typeof data.EnableTabScenes != 'undefined') {
				$("#activemenustable #EnableTabScenes").prop('checked',data.EnableTabScenes==1);
			  }
			  if (typeof data.EnableTabTemp != 'undefined') {
				$("#activemenustable #EnableTabTemp").prop('checked',data.EnableTabTemp==1);
			  }
			  if (typeof data.EnableTabWeather != 'undefined') {
				$("#activemenustable #EnableTabWeather").prop('checked',data.EnableTabWeather==1);
			  }
			  if (typeof data.EnableTabUtility != 'undefined') {
				$("#activemenustable #EnableTabUtility").prop('checked',data.EnableTabUtility==1);
			  }
			  if (typeof data.NotificationSensorInterval != 'undefined') {
				$("#nitable #comboNotificationSensorInterval").val(data.NotificationSensorInterval);
			  }
			  if (typeof data.NotificationSwitchInterval != 'undefined') {
				$("#nitable #comboNotificationSwitchesInterval").val(data.NotificationSwitchInterval);
			  }
			  if (typeof data.RemoteSharedPort != 'undefined') {
				$("#remotesharedtable #RemoteSharedPort").val(data.RemoteSharedPort);
			  }
			  if (typeof data.Language != 'undefined') {
				$("#languagetable #combolanguage").val(data.Language);
			  }
			  if (typeof data.AuthenticationMethod != 'undefined') {
				$("#webtable #comboauthmethod").val(data.AuthenticationMethod);
			  }
			  if (typeof data.ReleaseChannel != 'undefined') {
				$("#autoupdatetable #comboReleaseChannel").val(data.ReleaseChannel);
			  }
			  if (typeof data.RaspCamParams != 'undefined') {
				$("#picamtable #RaspCamParams").val(data.RaspCamParams );
			  }
			  if (typeof data.AcceptNewHardware != 'undefined') {
				$("#acceptnewhardwaretable #AcceptNewHardware").prop('checked',data.AcceptNewHardware==1);
			  }
			  if (typeof data.HideDisabledHardwareSensors!= 'undefined') {
				$("#acceptnewhardwaretable #HideDisabledHardwareSensors").prop('checked',data.HideDisabledHardwareSensors==1);
			  }
			  if (typeof data.DisableEventScriptSystem!= 'undefined') {
				$("#eventsystemtable #DisableEventScriptSystem").prop('checked',data.DisableEventScriptSystem==1);
			  }
			  if (typeof data.FloorplanPopupDelay!= 'undefined') {
				$("#floorplanoptionstable #FloorplanPopupDelay").val(data.FloorplanPopupDelay);
			  }
			  if (typeof data.FloorplanFullscreenMode!= 'undefined') {
				$("#floorplanoptionstable #FloorplanFullscreenMode").prop('checked',data.FloorplanFullscreenMode==1);
			  }
			  if (typeof data.FloorplanAnimateZoom!= 'undefined') {
				$("#floorplanoptionstable #FloorplanAnimateZoom").prop('checked',data.FloorplanAnimateZoom==1);
			  }
			  if (typeof data.FloorplanShowSensorValues!= 'undefined') {
				$("#floorplandisplaytable #FloorplanShowSensorValues").prop('checked',data.FloorplanShowSensorValues==1);
			  }
			  if (typeof data.FloorplanShowSwitchValues!= 'undefined') {
				$("#floorplandisplaytable #FloorplanShowSwitchValues").prop('checked',data.FloorplanShowSwitchValues==1);
			  }
			  if (typeof data.FloorplanRoomColour!= 'undefined') {
				$("#floorplancolourtable #FloorplanRoomColour").val(data.FloorplanRoomColour);
			  }
			  if (typeof data.FloorplanActiveOpacity != 'undefined') {
				$("#floorplancolourtable #FloorplanActiveOpacity").val(data.FloorplanActiveOpacity);
			  }
			  if (typeof data.FloorplanInactiveOpacity != 'undefined') {
				$("#floorplancolourtable #FloorplanInactiveOpacity").val(data.FloorplanInactiveOpacity);
			  }
			  
			  if (typeof data.AllowWidgetOrdering != 'undefined') {
				$("#dashmodetable #AllowWidgetOrdering").prop('checked',data.AllowWidgetOrdering==1);
			  }
			  if (typeof data.SecOnDelay != 'undefined') {
				$("#sectable #SecOnDelay").val(data.SecOnDelay);
			  }
			 }
		  });
		}

		$scope.StoreSettings = function(formname)
		{
		  var Latitude=$("#locationtable #Latitude").val();
		  var Longitude=$("#locationtable #Longitude").val();
		  if (
			  ((Latitude=="")||(Longitude==""))||
			  ( isNaN(Latitude)||isNaN(Longitude) )
			)
		  {
			ShowNotify($.i18n('Invalid Location Settings...'), 2000, true);
			return;
		  }
		  
		  var secpanel=$("#sectable #SecPassword").val();
		  if (secpanel != "") {
			if (!$.isNumeric(secpanel)) {
				ShowNotify($.i18n('Security Panel password can only contain numbers...'), 2000, true);
				return;
			}
		  }

		  var switchprotection=$("#protectiontable #ProtectionPassword").val();
		  
		  //Check email settings
		  var EmailServer=$("#emailtable #EmailServer").val();
		  if (EmailServer!="")
		  {
			var EmailPort=$("#emailtable #EmailPort").val();
			if (EmailPort=="") {
				ShowNotify($.i18n('Please enter an Email Port...'), 2000, true);
				return;
			}
			var EmailFrom=$("#emailtable #EmailFrom").val();
			var EmailTo=$("#emailtable #EmailTo").val();
			var EmailUsername=$("#emailtable #EmailUsername").val();
			var EmailPassword=$("#emailtable #EmailPassword").val();
			if ((EmailFrom=="")||(EmailTo=="")) {
				ShowNotify($.i18n('Invalid Email From/To Settings...'), 2000, true);
				return;
			}
			if ((EmailUsername!="")&&(EmailPassword=="")) {
				ShowNotify($.i18n('Please enter an Email Password...'), 2000, true);
				return;
			}
		  }
		  
		  var popupDelay=$("#floorplanoptionstable #FloorplanPopupDelay").val();
		  if (popupDelay != "") {
			if (!$.isNumeric(popupDelay)) {
				ShowNotify($.i18n('Popup Delay can only contain numbers...'), 2000, true);
				return;
			}
		  }

		  $.post("storesettings.webem", $("#settings").serialize(), function(data) {
				$scope.$apply(function() {
					$window.location = '/#Dashboard';
					$window.location.reload();
				});
			});
		}

		$scope.MakeScrollLink = function(nameclick,namescroll)
		{
			$(nameclick).click(function(e){
				var position = $(namescroll).offset();
				scroll(0,position.top-60);
				e.preventDefault();
			});
		}

		init();

		function init()
		{
		  $scope.MakeScrollLink("#idsystem","#system");
		  $scope.MakeScrollLink("#idloghistory","#loghistory");
		  $scope.MakeScrollLink("#idnotifications","#notifications");
		  $scope.MakeScrollLink("#idemailsetup","#emailsetup");
		  $scope.MakeScrollLink("#idmetercounters","#metercounters");
		  $scope.MakeScrollLink("#idfloorplans","#floorplans");
		  $scope.MakeScrollLink("#idothersettings","#othersettings");
		  $scope.MakeScrollLink("#idrestoredatabase","#restoredatabase");

			$( "#dialog-findlatlong" ).dialog({
				  autoOpen: false,
				  width: 480,
				  height: 280,
				  modal: true,
				  resizable: false,
				  buttons: {
					  "OK": function() {
						  var bValid = true;
						  bValid = bValid && checkLength( $("#dialog-findlatlong #latitude"), 3, 100 );
						  bValid = bValid && checkLength( $("#dialog-findlatlong #longitude"), 3, 100 );
						  if ( bValid ) {
							$("#locationtable #Latitude").val($( '#dialog-findlatlong #latitude' ).val());
							$("#locationtable #Longitude").val($( '#dialog-findlatlong #longitude' ).val());
							$( this ).dialog( "close" );
						  } else
						  {
							bootbox.alert($.i18n('Please enter a Latitude and Longitude!...'), 3500, true);
						  }
					  },
					  Cancel: function() {
						  $( this ).dialog( "close" );
					  }
				  },
				  open: function() {
						$( '#getlatlong' ).click( function()
						{
								var address = $( '#dialog-findlatlong #address' ).val();
								if (address=="")
								{
									bootbox.alert($.i18n('Please enter a Address to search for!...'), 3500, true);
									return false;
								}
								geocoder = new google.maps.Geocoder();
								geocoder.geocode( { 'address': address}, function(results, status) {
									if (status == google.maps.GeocoderStatus.OK) {
											$( '#dialog-findlatlong #latitude' ).val(results[0].geometry.location.lat().toFixed(6));
											$( '#dialog-findlatlong #longitude' ).val(results[0].geometry.location.lng().toFixed(6));
									} else {
										bootbox.alert($.i18n('Geocode was not successful for the following reason') + ': ' +status);
									}
								});
								return false;
						} );              
				  },
				  close: function() {
					$( this ).dialog( "close" );
				  }
			});
			$("#maindiv").i18n();
			$scope.ShowSettings();
		};
	} ]);
});