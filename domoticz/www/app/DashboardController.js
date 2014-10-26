define(['app'], function (app) {
	app.controller('DashboardController', [ '$scope', '$rootScope', '$location', '$http', '$interval', '$window', 'permissions', function($scope,$rootScope,$location,$http,$interval,$window,permissions) {

		$scope.LastUpdateTime = parseInt(0);
		
		RefreshFavorites = function()
		{
			if (typeof $scope.mytimer != 'undefined') {
				$interval.cancel($scope.mytimer);
				$scope.mytimer = undefined;
			}
		  var id="";

			$rootScope.RefreshTimeAndSun();
		  
		  $.ajax({
			 url: "json.htm?type=devices&filter=all&used=true&order=Name&plan="+window.myglobals.LastPlanSelected+"&lastupdate="+$scope.LastUpdateTime,
			 async: false,
			 dataType: 'json',
			 success: function(data) {
			  if (typeof data.result != 'undefined') {
				$.DashboardType=data.DashboardType;
			  
				if (typeof data.WindScale != 'undefined') {
					$.myglobals.windscale=parseFloat(data.WindScale);
				}
				if (typeof data.WindSign != 'undefined') {
					$.myglobals.windsign=data.WindSign;
				}
				if (typeof data.TempScale != 'undefined') {
					$.myglobals.tempscale=parseFloat(data.TempScale);
				}
				if (typeof data.TempSign != 'undefined') {
					$.myglobals.tempsign=data.TempSign;
				}
				if (typeof data.ActTime != 'undefined') {
					$scope.LastUpdateTime=parseInt(data.ActTime);
				}

				$.each(data.result, function(i,item){
								//Scenes
								if (((item.Type.indexOf('Scene') == 0)||(item.Type.indexOf('Group') == 0))&&(item.Favorite!=0))
								{
									id="#dashcontent #scene_" + item.idx;
									var obj=$(id);
									if (typeof obj != 'undefined') {
										if (($.DashboardType==2)||(window.myglobals.ismobile==true)) {
											var status="";
											if (item.Type.indexOf('Group')==0) {
												if (item.Status == 'Off') {
													status+='<button class="btn btn-mini" type="button" onclick="SwitchScene(' + item.idx + ',\'On\',RefreshFavorites, ' + item.Protected + ');">' + $.i18n("On") +'</button> ' +
															'<button class="btn btn-mini btn-info" type="button" onclick="SwitchScene(' + item.idx + ',\'Off\',RefreshFavorites, ' + item.Protected + ');">' + $.i18n("Off") +'</button>';
												}
												else {
													status+='<button class="btn btn-mini btn-info" type="button" onclick="SwitchScene(' + item.idx + ',\'On\',RefreshFavorites, ' + item.Protected + ');">' + $.i18n("On") +'</button> ' +
															'<button class="btn btn-mini" type="button" onclick="SwitchScene(' + item.idx + ',\'Off\',RefreshFavorites, ' + item.Protected + ');">' + $.i18n("Off") +'</button>';
												}
												if ($(id + " #status").html()!=status) {
													$(id + " #status").html(status);
												}
											}
										}
										else {
											if (item.Type.indexOf('Group')==0) {
												var img1="";
												var img2="";
												var onclass="";
												var offclass="";
												if (item.Status == 'On') {
													onclass="transimg";
													offclass="";
												}
												else if (item.Status == 'Off') {
													onclass="";
													offclass="transimg";
												}
												img1='<img class="lcursor ' + onclass + '" src="images/push48.png" title="' + $.i18n("Turn On") +'" onclick="SwitchScene(' + item.idx + ',\'On\',RefreshFavorites, ' + item.Protected + ');" height="40" width="40">';
												img2='<img class="lcursor ' + offclass + '"src="images/pushoff48.png" title="' + $.i18n("Turn Off") +'" onclick="SwitchScene(' + item.idx + ',\'Off\',RefreshFavorites, ' + item.Protected + ');" height="40" width="40">';
												if ($(id + " #img1").html()!=img1) {
													$(id + " #img1").html(img1);
												}
												if ($(id + " #img2").html()!=img2) {
													$(id + " #img2").html(img2);
												}
												if ($(id + " #status").html()!=TranslateStatus(item.Status)) {
													$(id + " #status").html(TranslateStatus(item.Status));
												}
												if ($(id + " #lastupdate").html()!=item.LastUpdate) {
													$(id + " #lastupdate").html(item.LastUpdate);
												}
											}
										}
									}
								}
							}); //Scene devices

				$.each(data.result, function(i,item){
							//Lights
							var isdimmer=false;
							if (((item.Type.indexOf('Light') == 0)||(item.Type.indexOf('Blind') == 0)||(item.Type.indexOf('Curtain') == 0)||(item.Type.indexOf('Thermostat 3') == 0)||(item.Type.indexOf('Chime') == 0)||(item.Type.indexOf('RFY') == 0))&&(item.Favorite!=0))
							{
								id="#dashcontent #light_" + item.idx;
								var obj=$(id);
								if (typeof obj != 'undefined') {
									if (($.DashboardType==2)||(window.myglobals.ismobile==true)) {
										var status=TranslateStatus(item.Status) + " ";
										if (item.SwitchType == "Doorbell") {
											status+='<button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Ring") +'</button>';
										}
										else if (item.SwitchType == "Push On Button") {
											if (item.InternalState=="On") {
												status='<button class="btn btn-mini btn-info" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("On") +'</button>';
											}
											else {
												status='<button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("On") +'</button>';
											}
										}
										else if (item.SwitchType == "Door Lock") {
											if (item.InternalState=="Open") {
												status='<button class="btn btn-mini btn-info" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Open") +'</button> ' + 
													'<button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Lock") +'</button>';
											}
											else {
												status='<button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Open") +'</button> ' + 
													'<button class="btn btn-mini btn-info" type="button" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Locked") +'</button>';
											}
										}
										else if (item.SwitchType == "Push Off Button") {
											status='<button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Off") +'</button>';
										}
										else if (item.SwitchType == "X10 Siren") {
											if (
												(item.Status == 'On')||
												(item.Status == 'Chime')||
												(item.Status == 'Group On')||
												(item.Status == 'All On')
											 ) {
												status='<button class="btn btn-mini btn-info" type="button">' + $.i18n("SIREN") +'</button>';
											}
											else {
												status='<button class="btn btn-mini" type="button">' + $.i18n("Silence") +'</button>';
											}
									}
										else if (item.SwitchType == "Contact") {
											if (item.Status == 'Closed') {
												status='<button class="btn btn-mini" type="button" onclick="ShowLightLog(' + item.idx + ',\'' + item.Name  + '\', \'#dashcontent\', \'ShowFavorites\');">' + $.i18n("Closed") +'</button>';
											}
											else {
												status='<button class="btn btn-mini btn-info" type="button" onclick="ShowLightLog(' + item.idx + ',\'' + item.Name  + '\', \'#dashcontent\', \'ShowFavorites\');">' + $.i18n("Open") +'</button>';
											}
										}
										else if ((item.SwitchType == "Blinds")||(item.SwitchType.indexOf("Venetian Blinds") == 0)) {
											if ((item.SubType=="RAEX")||(item.SubType.indexOf('A-OK') == 0)||(item.SubType.indexOf('RollerTrol') == 0)||(item.SubType=="Harrison")||(item.SubType.indexOf('RFY') == 0)||(item.SubType.indexOf('T6 DC') == 0)||(item.SwitchType.indexOf("Venetian Blinds") == 0)) {
												if (item.Status == 'Closed') {
												status=
													'<button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Open") +'</button> ' +
													'<button class="btn btn-mini btn-danger" type="button" onclick="SwitchLight(' + item.idx + ',\'Stop\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Stop") +'</button> ' +
													'<button class="btn btn-mini btn-info" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Closed") +'</button>';
											}
											else {
												status=
													'<button class="btn btn-mini btn-info" type="button" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Open") +'</button> ' +
													'<button class="btn btn-mini btn-danger" type="button" onclick="SwitchLight(' + item.idx + ',\'Stop\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Stop") +'</button> ' +
													'<button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Close") +'</button>';
											}
										}
										else {
											if (item.Status == 'Closed') {
												status=
													'<button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Open") +'</button> ' +
													'<button class="btn btn-mini btn-info" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Closed") +'</button>';
											}
											else {
												status=
													'<button class="btn btn-mini btn-info" type="button" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Open") +'</button> ' +
													'<button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Close") +'</button>';
											}
											}
										}
										else if (item.SwitchType == "Blinds Inverted") {
											if ((item.SubType=="RAEX")||(item.SubType.indexOf('A-OK') == 0)||(item.SubType.indexOf('RollerTrol') == 0)||(item.SubType=="Harrison")||(item.SubType.indexOf('RFY') == 0)||(item.SubType.indexOf('T6 DC') == 0)) {
												if (item.Status == 'Closed') {
													status=
														'<button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Open") +'</button> ' +
														'<button class="btn btn-mini btn-danger" type="button" onclick="SwitchLight(' + item.idx + ',\'Stop\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Stop") +'</button> ' +
														'<button class="btn btn-mini btn-info" type="button" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Closed") +'</button>';
												}
												else {
													status=
														'<button class="btn btn-mini btn-info" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Open") +'</button> ' +
														'<button class="btn btn-mini btn-danger" type="button" onclick="SwitchLight(' + item.idx + ',\'Stop\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Stop") +'</button> ' +
														'<button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Close") +'</button>';
												}
											}
											else {
												if (item.Status == 'Closed') {
													status=
														'<button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Open") +'</button> ' +
														'<button class="btn btn-mini btn-info" type="button" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Closed") +'</button>';
												}
												else {
													status=
														'<button class="btn btn-mini btn-info" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Open") +'</button> ' +
														'<button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites),' + item.Protected +';">' + $.i18n("Close") +'</button>';
												}
											}
										}
										else if (item.SwitchType == "Blinds Percentage") {
											if (item.Status == 'Closed') {
												status=
													'<button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Open") +'</button> ' +
													'<button class="btn btn-mini btn-info" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Closed") +'</button>';
											}
											else {
												status=
													'<button class="btn btn-mini btn-info" type="button" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Open") +'</button> ' +
													'<button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Close") +'</button>';
											}
										}
										else if (item.SwitchType == "Dimmer") {
											isdimmer=true;
											var img="";
											if (
													(item.Status == 'On')||
													(item.Status == 'Chime')||
													(item.Status == 'Group On')||
													(item.Status.indexOf('Set ') == 0)
												 ) {
														status=
															'<label id=\"statustext\"><button class="btn btn-mini btn-info" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("On") +'</button></label> ' +
															'<label id=\"img\"><button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Off") +'</button></label>';
											}
											else {
														status=
															'<label id=\"statustext\"><button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("On") +'</button></label> ' +
															'<label id=\"img\"><button class="btn btn-mini btn-info" type="button" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Off") +'</button></label>';
											}
										}
										else if (item.SwitchType == "Dusk Sensor") {
											if (item.Status == 'On')
											{
												status='<button class="btn btn-mini" type="button" onclick="ShowLightLog(' + item.idx + ',\'' + item.Name  + '\', \'#dashcontent\', \'ShowFavorites\');">' + $.i18n("Dark") +'</button>';
											}
											else {
												status='<button class="btn btn-mini" type="button" onclick="ShowLightLog(' + item.idx + ',\'' + item.Name  + '\', \'#dashcontent\', \'ShowFavorites\');">' + $.i18n("Sunny") +'</button>';
											}
										}
										else if (item.SwitchType == "Motion Sensor") {
											if (
													(item.Status == 'On')||
													(item.Status == 'Chime')||
													(item.Status == 'Group On')||
													(item.Status.indexOf('Set ') == 0)
												 ) {
														status='<button class="btn btn-mini btn-info" type="button" onclick="ShowLightLog(' + item.idx + ',\'' + item.Name  + '\', \'#dashcontent\', \'ShowFavorites\');">' + $.i18n("Motion") +'</button>';
											}
											else {
														status='<button class="btn btn-mini" type="button" onclick="ShowLightLog(' + item.idx + ',\'' + item.Name  + '\', \'#dashcontent\', \'ShowFavorites\');">' + $.i18n("No Motion") +'</button>';
											}
										}
										else if (item.SwitchType == "Dusk Sensor") {
											if (item.Status == 'On') {
												status='<button class="btn btn-mini" type="button" onclick="ShowLightLog(' + item.idx + ',\'' + item.Name  + '\', \'#dashcontent\', \'ShowFavorites\');">' + $.i18n("Dark") +'</button>';
											}
											else {
												status='<button class="btn btn-mini" type="button" onclick="ShowLightLog(' + item.idx + ',\'' + item.Name  + '\', \'#dashcontent\', \'ShowFavorites\');">' + $.i18n("Sunny") +'</button>';
											}
										}
										else if (item.SwitchType == "Smoke Detector") {
											if ((item.Status == "Panic")||(item.Status == "On")) {
												status='<button class="btn btn-mini btn-info" type="button" onclick="ShowLightLog(' + item.idx + ',\'' + item.Name  + '\', \'#dashcontent\', \'ShowFavorites\');">' + $.i18n("SMOKE") +'</button>';
											}
											else {
												status='<button class="btn btn-mini" type="button" onclick="ShowLightLog(' + item.idx + ',\'' + item.Name  + '\', \'#dashcontent\', \'ShowFavorites\');">' + $.i18n("No Smoke") +'</button>';
											}
										}
										else {
											if (
													(item.Status == 'On')||
													(item.Status == 'Chime')||
													(item.Status == 'Group On')||
													(item.Status.indexOf('Set ') == 0)
												 ) {
														status=
															'<button class="btn btn-mini btn-info" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("On") +'</button> ' +
															'<button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Off") +'</button>';
											}
											else {
														status=
															'<button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("On") +'</button> ' +
															'<button class="btn btn-mini btn-info" type="button" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Off") +'</button>';
											}
										}
										if (isdimmer==true) {
											var dslider=$(id + "_slider");
											if (typeof dslider != 'undefined') {
												dslider.slider( "value", item.LevelInt+1 );
											}
										}
										if ($(id + " #status").html()!=status) {
											$(id + " #status").html(status);
										}
									}
									else {
										var img="";
										var img2="";
										var img3="";
										if (item.SwitchType == "Doorbell") {
											img='<img src="images/doorbell48.png" title="' + $.i18n("Turn On") +'" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
										}
										else if (item.SwitchType == "Push On Button") {
											if (item.InternalState=="On") {
												img='<img src="images/pushon48.png" title="' + $.i18n("Turn On") +'" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
											}
											else {
												img='<img src="images/push48.png" title="' + $.i18n("Turn On") +'" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
											}
										}
										else if (item.SwitchType == "Door Lock") {
											if (item.InternalState=="Open") {
												img='<img src="images/door48open.png" title="' + $.i18n("Close Door") +'" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
											}
											else {
												img='<img src="images/door48.png" title="' + $.i18n("Open Door") +'" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
											}
										}
										else if (item.SwitchType == "Push Off Button") {
											img='<img src="images/pushoff48.png" title="' + $.i18n("Turn Off") +'" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
										}
										else if (item.SwitchType == "X10 Siren") {
											if (
													(item.Status == 'On')||
													(item.Status == 'Chime')||
													(item.Status == 'Group On')||
													(item.Status == 'All On')
												 )
											{
															img='<img src="images/siren-on.png" height="40" width="40">';
											}
											else {
															img='<img src="images/siren-off.png" height="40" width="40">';
											}
										}
										else if (item.SwitchType == "Contact") {
											if (item.Status == 'Closed') {
												img='<img src="images/contact48.png" onclick="ShowLightLog(' + item.idx + ',\'' + item.Name  + '\', \'#dashcontent\', \'ShowFavorites\');" class="lcursor" height="40" width="40" >';
											}
											else {
												img='<img src="images/contact48_open.png" onclick="ShowLightLog(' + item.idx + ',\'' + item.Name  + '\', \'#dashcontent\', \'ShowFavorites\');" class="lcursor" height="40" width="40">';
											}
										}
										else if ((item.SwitchType == "Blinds")||(item.SwitchType.indexOf("Venetian Blinds") == 0)) {
											if ((item.SubType=="RAEX")||(item.SubType.indexOf('A-OK') == 0)||(item.SubType.indexOf('RollerTrol') == 0)||(item.SubType=="Harrison")||(item.SubType.indexOf('RFY') == 0)||(item.SubType.indexOf('T6 DC') == 0)||(item.SwitchType.indexOf("Venetian Blinds") == 0)) {
												if (item.Status == 'Closed') {
													img='<img src="images/blindsopen48.png" title="' + $.i18n("Open Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
													img3='<img src="images/blinds48sel.png" title="' + $.i18n("Close Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
												}
												else {
													img='<img src="images/blindsopen48sel.png" title="' + $.i18n("Open Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
													img3='<img src="images/blinds48.png" title="' + $.i18n("Close Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
												}
											}
											else {
												if (item.Status == 'Closed') {
													img='<img src="images/blindsopen48.png" title="' + $.i18n("Open Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
													img2='<img src="images/blinds48sel.png" title="' + $.i18n("Close Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
												}
												else {
													img='<img src="images/blindsopen48sel.png" title="' + $.i18n("Open Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
													img2='<img src="images/blinds48.png" title="' + $.i18n("Close Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
												}
											}
										}
										else if (item.SwitchType == "Blinds Inverted") {
											if ((item.SubType=="RAEX")||(item.SubType.indexOf('A-OK') == 0)||(item.SubType.indexOf('RollerTrol') == 0)||(item.SubType=="Harrison")||(item.SubType.indexOf('RFY') == 0)||(item.SubType.indexOf('T6 DC') == 0)) {
												if (item.Status == 'Closed') {
													img='<img src="images/blindsopen48.png" title="' + $.i18n("Open Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
													img3='<img src="images/blinds48sel.png" title="' + $.i18n("Close Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
												}
												else {
													img='<img src="images/blindsopen48sel.png" title="' + $.i18n("Open Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
													img3='<img src="images/blinds48.png" title="' + $.i18n("Close Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
												}
											}
											else {
												if (item.Status == 'Closed') {
													img='<img src="images/blindsopen48.png" title="' + $.i18n("Open Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
													img2='<img src="images/blinds48sel.png" title="' + $.i18n("Close Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
												}
												else {
													img='<img src="images/blindsopen48sel.png" title="' + $.i18n("Open Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
													img2='<img src="images/blinds48.png" title="' + $.i18n("Close Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
												}
											}
										}
										else if (item.SwitchType == "Blinds Percentage") {
											if (item.Status == 'Closed') {
												img='<img src="images/blindsopen48.png" title="' + $.i18n("Open Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
												img2='<img src="images/blinds48sel.png" title="' + $.i18n("Close Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
											}
											else {
												img='<img src="images/blindsopen48sel.png" title="' + $.i18n("Open Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
												img2='<img src="images/blinds48.png" title="' + $.i18n("Close Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
											}
										}
										else if (item.SwitchType == "Dimmer") {
											isdimmer=true;
											if (
													(item.Status == 'On')||
													(item.Status == 'Chime')||
													(item.Status == 'Group On')||
													(item.Status.indexOf('Set ') == 0)
												 ) {
														img='<img src="images/dimmer48-on.png" title="' + $.i18n("Turn Off") +'" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
											}
											else {
														img='<img src="images/dimmer48-off.png" title="' + $.i18n("Turn On") +'" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
											}
										}
										else if (item.SwitchType == "Dusk Sensor") {
											if (
													(item.Status == 'On')
												 ) {
														img='<img src="images/uvdark.png" onclick="ShowLightLog(' + item.idx + ',\'' + item.Name  + '\', \'#dashcontent\', \'ShowFavorites\');" class="lcursor" height="40" width="40">';
											}
											else {
														img='<img src="images/uvsunny.png" onclick="ShowLightLog(' + item.idx + ',\'' + item.Name  + '\', \'#dashcontent\', \'ShowFavorites\');" class="lcursor" height="40" width="40">';
											}
										}
										else if (item.SwitchType == "Motion Sensor") {
											if (
													(item.Status == 'On')||
													(item.Status == 'Chime')||
													(item.Status == 'Group On')||
													(item.Status.indexOf('Set ') == 0)
												 ) {
														img='<img src="images/motion48-on.png" onclick="ShowLightLog(' + item.idx + ',\'' + item.Name  + '\', \'#dashcontent\', \'ShowFavorites\');" class="lcursor" height="40" width="40">';
											}
											else {
														img='<img src="images/motion48-off.png" onclick="ShowLightLog(' + item.idx + ',\'' + item.Name  + '\', \'#dashcontent\', \'ShowFavorites\');" class="lcursor" height="40" width="40">';
											}
										}
										else if (item.SwitchType == "Smoke Detector") {
												if (
														(item.Status == "Panic")||
														(item.Status == "On")
													 ) {
														img='<img src="images/smoke48on.png" onclick="ShowLightLog(' + item.idx + ',\'' + item.Name  + '\', \'#dashcontent\', \'ShowFavorites\');" class="lcursor" height="40" width="40">';
												}
												else {
														img='<img src="images/smoke48off.png" onclick="ShowLightLog(' + item.idx + ',\'' + item.Name  + '\', \'#dashcontent\', \'ShowFavorites\');" class="lcursor" height="40" width="40">';
												}
										}
										else {
											if (
													(item.Status == 'On')||
													(item.Status == 'Chime')||
													(item.Status == 'Group On')||
													(item.Status.indexOf('Set ') == 0)
												 ) {
														img='<img src="images/' + item.Image + '48_On.png" title="' + $.i18n("Turn Off") +'" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
											}
											else {
														img='<img src="images/' + item.Image + '48_Off.png" title="' + $.i18n("Turn On") +'" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
											}
										}
										if ($(id + " #img").html()!=img) {
											$(id + " #img").html(img);
										}
										if (img2!="") {
											if ($(id + " #img2").html()!=img2) {
												$(id + " #img2").html(img2);
											}
										}
										if (img3!="") {
											if ($(id + " #img3").html()!=img3) {
												$(id + " #img3").html(img3);
											}
										}
										if (isdimmer==true) {
											var dslider=$(id + " #slider");
											if (typeof dslider != 'undefined') {
												dslider.slider( "value", item.LevelInt+1 );
											}
										}
										if ($(id + " #status").html()!=TranslateStatus(item.Status)) {
											$(id + " #status").html(TranslateStatus(item.Status));
										}
										if ($(id + " #lastupdate").html()!=item.LastUpdate) {
											$(id + " #lastupdate").html(item.LastUpdate);
										}
									}
								}
							}
						}); //light devices

				//Temperature Sensors
				$.each(data.result, function(i,item){
				  if (
						((typeof item.Temp != 'undefined')||(typeof item.Humidity != 'undefined')||(typeof item.Chill != 'undefined')) &&
						(item.Favorite!=0)
					  )
				  {
								id="#dashcontent #temp_" + item.idx;
								var obj=$(id);
								if (typeof obj != 'undefined') {
									var vname=item.Name;
									if (($.DashboardType==2)||(window.myglobals.ismobile==true)) {
										var vname='<img src="images/next.png" onclick="ShowTempLog(\'#dashcontent\',\'ShowFavorites\',' + item.idx + ',\'' + item.Name + '\');" height="16" width="16">' + " " + item.Name;
									}
									if ($(id + " #name").html()!=vname) {
										$(id + " #name").html(vname);
									}
									if (($.DashboardType==2)||(window.myglobals.ismobile==true)) {
										var status="";
										var bHaveBefore=false;
										if (typeof item.Temp != 'undefined') {
												 status+=item.Temp + '&deg; ' + $.myglobals.tempsign;
												 bHaveBefore=true;
										}
										if (typeof item.Chill != 'undefined') {
											if (status!="") {
												status+=', ';
											}
											status+=$.i18n('Chill') + ': ' + item.Chill + '&deg; ' + $.myglobals.tempsign;
											bHaveBefore=true;
										}
										if (typeof item.Humidity != 'undefined') {
											if (bHaveBefore==true) {
												status+=', ';
											}
											status+=item.Humidity + ' %';
										}
										if (typeof item.HumidityStatus != 'undefined') {
											status+=' (' + $.i18n(item.HumidityStatus) + ')';
										}
										if (typeof item.DewPoint != 'undefined') {
											status+="<br>"+$.i18n("Dew Point") + ": " + item.DewPoint + '&deg; ' + $.myglobals.tempsign;
										}
									}
									else {
										var img='<img src="images/';
										if (typeof item.Temp != 'undefined') {
											img+=GetTemp48Item(item.Temp);
										}
										else {
											if (item.Type=="Humidity") {
												img+="gauge48.png";
											}
											else {
												img+=GetTemp48Item(item.Chill);
											}
										}
										img+='" class="lcursor" onclick="ShowTempLog(\'#dashcontent\',\'ShowFavorites\',' + item.idx + ',\'' + item.Name + '\');" height="40" width="40">';
										if ($(id + " #img").html()!=img) {
											$(id + " #img").html(img);
										}
										var status="";
										var bigtext="";
										var bHaveBefore=false;
										if (typeof item.Temp != 'undefined') {
												 status+=item.Temp + '&deg; ' + $.myglobals.tempsign;
												 bigtext=item.Temp + '\u00B0';
												 bHaveBefore=true;
										}
										if (typeof item.Chill != 'undefined') {
											if (bHaveBefore) {
												status+=', ';
												bigtext+=' / ';
											}
											status+=$.i18n('Chill') + ': ' + item.Chill + '&deg; ' + $.myglobals.tempsign;
											bigtext+=item.Chill + '\u00B0';
											bHaveBefore=true;
										}
										if (typeof item.Humidity != 'undefined') {
											if (bHaveBefore==true) {
												status+=', ';
												bigtext+=' / ';
											}
											status+=$.i18n('Humidity') + ': ' + item.Humidity + ' %';
											bigtext+=item.Humidity + '%';
										}
										if (typeof item.HumidityStatus != 'undefined') {
											status+=' (' + $.i18n(item.HumidityStatus) + ')';
										}
										if (typeof item.DewPoint != 'undefined') {
											status+="<br>"+$.i18n("Dew Point") + ": " + item.DewPoint + '&deg; ' + $.myglobals.tempsign;
										}
									
										var nbackcolor="#D4E1EE";
										if (item.HaveTimeout==true) {
											nbackcolor="#DF2D3A";
										}
										else {
											var BatteryLevel=parseInt(item.BatteryLevel);
											if (BatteryLevel!=255) {
												if (BatteryLevel<=10) {
													nbackcolor="#DDDF2D";
												}
											}
										}
										var obackcolor=rgb2hex($(id + " #name").css( "background-color" )).toUpperCase();
										if (obackcolor!=nbackcolor) {
											$(id + " #name").css( "background-color", nbackcolor );
										}
										
										if ($(id + " #status").html()!=status) {
											if (typeof $(id + " #bigtext") != 'undefined') {
												$(id + " #bigtext").html(bigtext);
											}
											$(id + " #status").html(status);
										}
										if ($(id + " #lastupdate").html()!=item.LastUpdate) {
											$(id + " #lastupdate").html(item.LastUpdate);
										}
									}
								}
				  }
				}); //temp devices

				//Weather Sensors
				$.each(data.result, function(i,item){
				  if (
						( (typeof item.Rain != 'undefined') || (typeof item.Visibility != 'undefined') || (typeof item.UVI != 'undefined') || (typeof item.Radiation != 'undefined') || (typeof item.Direction != 'undefined') || (typeof item.Barometer != 'undefined') ) &&
						(item.Favorite!=0)
					  )
				  {
								id="#dashcontent #weather_" + item.idx;
								var obj=$(id);
								if (typeof obj != 'undefined') {
									if ($(id + " #name").html()!=item.Name) {
										$(id + " #name").html(item.Name);
									}
									if (($.DashboardType==2)||(window.myglobals.ismobile==true)) {
										var status="";
										if (typeof item.Rain != 'undefined') {
											status=item.Rain + ' mm';
											if (typeof item.RainRate != 'undefined') {
												if (item.RainRate!=0) {
													status+=', Rate: ' + item.RainRate + ' mm/h';
												}
											}
										}
										else if (typeof item.Visibility != 'undefined') {
											status=item.Data;
										}
										else if (typeof item.UVI != 'undefined') {
											status=item.UVI + ' UVI';
										}
										else if (typeof item.Radiation != 'undefined') {
											status=item.Data;
										}
										else if (typeof item.Direction != 'undefined') {
											img='<img src="images/Wind' + item.DirectionStr + '.png" height="40" width="40">';
											status=item.Direction + ' ' + item.DirectionStr;
											if (typeof item.Speed != 'undefined') {
												status+=', ' + $.i18n('Speed') + ': ' + item.Speed + ' ' + $.myglobals.windsign;
											}
											if (typeof item.Gust != 'undefined') {
												status+=', ' + $.i18n('Gust') + ': ' + item.Gust + ' ' + $.myglobals.windsign;
											}
										}
										else if (typeof item.Barometer != 'undefined') {
											if (typeof item.ForecastStr != 'undefined') {
												status=item.Barometer + ' hPa, ' + $.i18n('Prediction') + ': ' + $.i18n(item.ForecastStr);
											}
											else {
												status=item.Barometer + ' hPa';
											}
											if (typeof item.Altitude != 'undefined') {
												status+=', Altitude: ' + item.Altitude + ' meter';
											}
										}
										if ($(id + " #status").html()!=status) {
											$(id + " #status").html(status);
										}
									}
									else {
										var img="";
										var status="";
										var bigtext="";
										if (typeof item.Rain != 'undefined') {
											img='<img src="images/rain48.png" class="lcursor" onclick="ShowRainLog(\'#dashcontent\',\'ShowFavorites\',' + item.idx + ',\'' + item.Name + '\');" height="40" width="40">';
											status=item.Rain + ' mm';
											bigtext=item.Rain + ' mm';
											if (typeof item.RainRate != 'undefined') {
												if (item.RainRate!=0) {
													status+=', Rate: ' + item.RainRate + ' mm/h';
												}
											}
										}
										else if (typeof item.Visibility != 'undefined') {
											img='<img src="images/visibility48.png" height="40" width="40">';
											status=item.Data;
											bigtext=item.Data;
										}
										else if (typeof item.UVI != 'undefined') {
											img='<img src="images/uv48.png" class="lcursor" onclick="ShowUVLog(\'#dashcontent\',\'ShowFavorites\',' + item.idx + ',\'' + item.Name + '\');" height="40" width="40">';
											status=item.UVI + ' UVI';
											bigtext=item.UVI + ' UVI';
											if (typeof item.Temp!= 'undefined') {
												status+=', Temp: ' + item.Temp + '&deg; ' + $.myglobals.tempsign;
											}
										}
										else if (typeof item.Radiation != 'undefined') {
											img='<img src="images/radiation48.png" height="40" width="40">';
											status=item.Data;
											bigtext=item.Data;
										}
										else if (typeof item.Direction != 'undefined') {
											img='<img src="images/Wind' + item.DirectionStr + '.png" class="lcursor" onclick="ShowWindLog(\'#dashcontent\',\'ShowFavorites\',' + item.idx + ',\'' + item.Name + '\');" height="40" width="40">';
											status=item.Direction + ' ' + item.DirectionStr;
											if (typeof item.Speed != 'undefined') {
												status+=', ' + $.i18n('Speed') + ': ' + item.Speed + ' ' + $.myglobals.windsign;
											}
											if (typeof item.Gust != 'undefined') {
												status+=', ' + $.i18n('Gust') + ': ' + item.Gust + ' ' + $.myglobals.windsign;
											}
											status+='<br>\n';
											if (typeof item.Temp != 'undefined') {
												status+=$.i18n('Temp') + ': ' + item.Temp + '&deg; ' + $.myglobals.tempsign;
											}
											if (typeof item.Chill != 'undefined') {
												if (typeof item.Temp != 'undefined') {
													status+=', ';
												}
												status+=$.i18n('Chill') +': ' + item.Chill + '&deg; ' + $.myglobals.tempsign;
											}
											bigtext=item.DirectionStr;
											if (typeof item.Speed != 'undefined') {
												bigtext+=' / ' + item.Speed + ' ' + $.myglobals.windsign;
											}
											else if (typeof item.Gust != 'undefined') {
												bigtext+=' / ' + item.Gust + ' ' + $.myglobals.windsign;
											}
										}
										else if (typeof item.Barometer != 'undefined') {
											img='<img src="images/baro48.png" class="lcursor" onclick="ShowBaroLog(\'#dashcontent\',\'ShowFavorites\',' + item.idx + ',\'' + item.Name + '\');" height="40" width="40">';
											bigtext=item.Barometer + ' hPa';
											if (typeof item.ForecastStr != 'undefined') {
												status=item.Barometer + ' hPa, ' + $.i18n('Prediction') + ': ' + $.i18n(item.ForecastStr);
											}
											else {
												status=item.Barometer + ' hPa';
											}
											if (typeof item.Altitude != 'undefined') {
												status+=', Altitude: ' + item.Altitude + ' meter';
											}
										}
										var nbackcolor="#D4E1EE";
										if (item.HaveTimeout==true) {
											nbackcolor="#DF2D3A";
										}
										else {
											var BatteryLevel=parseInt(item.BatteryLevel);
											if (BatteryLevel!=255) {
												if (BatteryLevel<=10) {
													nbackcolor="#DDDF2D";
												}
											}
										}
										var obackcolor=rgb2hex($(id + " #name").css( "background-color" )).toUpperCase();
										if (obackcolor!=nbackcolor) {
											$(id + " #name").css( "background-color", nbackcolor );
										}
						
										if ($(id + " #img").html()!=img) {
											$(id + " #img").html(img);
										}
										if ($(id + " #status").html()!=status) {
											$(id + " #status").html(status);
										}
										if ($(id + " #bigtext").html()!=bigtext) {
											$(id + " #bigtext").html(bigtext);
										}
										if ($(id + " #lastupdate").html()!=item.LastUpdate) {
											$(id + " #lastupdate").html(item.LastUpdate);
										}
									}
								}
				  }
				}); //weather devices
				
				//security devices
				$.each(data.result, function(i,item){
				  if ((item.Type.indexOf('Security') == 0)&&(item.Favorite!=0))
				  {
								id="#dashcontent #security_" + item.idx;
								var obj=$(id);
								if (typeof obj != 'undefined') {
									if ($(id + " #name").html()!=item.Name) {
										$(id + " #name").html(item.Name);
									}
									if (($.DashboardType==2)||(window.myglobals.ismobile==true)) {
										var tmpStatus=TranslateStatus(item.Status);
										if (item.SubType=="Security Panel") {
											tmpStatus+=' <a href="secpanel/"><img src="images/security48.png" class="lcursor" height="16" width="16"></a>';
										}
										else if (item.SubType.indexOf('remote') > 0) {
											if ((item.Status.indexOf('Arm') >= 0)||(item.Status.indexOf('Panic') >= 0)) {
												tmpStatus+=' <img src="images/remote.png" title="' + $.i18n("Turn Alarm Off") + '" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="16" width="16">';
											}
											else {
												tmpStatus+=' <img src="images/remote.png" title="' + $.i18n("Turn Alarm On") + '" onclick="ArmSystem(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="16" width="16">';
											}
										}
									
										if ($(id + " #status").html()!=tmpStatus) {
											$(id + " #status").html(tmpStatus);
										}
									}
									else {
										var img="";
										if (item.SubType=="Security Panel") {
											img='<a href="secpanel/"><img src="images/security48.png" class="lcursor" height="40" width="40"></a>';
										}
										else if (item.SubType.indexOf('remote') > 0) {
											if ((item.Status.indexOf('Arm') >= 0)||(item.Status.indexOf('Panic') >= 0)) {
												img+='<img src="images/remote48.png" title="' + $.i18n("Turn Alarm Off") + '" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">\n';
											}
											else {
												img+='<img src="images/remote48.png" title="' + $.i18n("Turn Alarm On") + '" onclick="ArmSystem(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">\n';
											}
										}
										else if (item.SwitchType == "Smoke Detector") {
												if (
														(item.Status == "Panic")||
														(item.Status == "On")
													 ) {
														img='<img src="images/smoke48on.png" title="' + $.i18n("Turn Alarm Off") + '" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
												}
												else {
														img='<img src="images/smoke48off.png" title="' + $.i18n("Turn Alarm On") + '" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
												}
										}
										else if (item.SubType == "X10 security") {
											if (item.Status.indexOf('Normal') >= 0) {
												img+='<img src="images/security48.png" title="' + $.i18n("Turn Alarm On") + '" onclick="SwitchLight(' + item.idx + ',\'' + ((item.Status == "Normal Delayed")?"Alarm Delayed":"Alarm") + '\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
											}
											else {
												img+='<img src="images/Alarm48_On.png" title="' + $.i18n("Turn Alarm Off") + '" onclick="SwitchLight(' + item.idx + ',\'' + ((item.Status == "Alarm Delayed")?"Normal Delayed":"Normal") + '\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
											}
										}
										else if (item.SubType == "X10 security motion") {
											if ((item.Status == "No Motion")) {
												img+='<img src="images/security48.png" title="' + $.i18n("Turn Alarm On") + '" onclick="SwitchLight(' + item.idx + ',\'Motion\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
											}
											else {
												img+='<img src="images/Alarm48_On.png" title="' + $.i18n("Turn Alarm Off") + '" onclick="SwitchLight(' + item.idx + ',\'No Motion\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
											}
										}
										else if ((item.Status.indexOf('Alarm') >= 0)||(item.Status.indexOf('Tamper') >= 0)) {
											img='<img src="images/Alarm48_On.png" height="40" width="40">';
										}
										else {
											if (item.SubType.indexOf('Meiantech') >= 0) {
												if ((item.Status.indexOf('Arm') >= 0)||(item.Status.indexOf('Panic') >= 0)) {
													img='<img src="images/security48.png" title="' + $.i18n("Turn Alarm Off") + '" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
												}
												else {
													img='<img src="images/security48.png" title="' + $.i18n("Turn Alarm On") + '" onclick="ArmSystemMeiantech(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40">';
												}
											}
											else {
												img='<img src="images/security48.png" height="40" width="40">';
											}
										}
										
										var nbackcolor="#D4E1EE";
										if (item.Protected==true) {
											nbackcolor="#A4B1EE";
										}
										var obackcolor=rgb2hex($(id + " #name").css( "background-color" )).toUpperCase();
										if (obackcolor!=nbackcolor) {
											$(id + " #name").css( "background-color", nbackcolor );
										}
										
										if ($(id + " #img").html()!=img) {
											$(id + " #img").html(img);
										}
										if ($(id + " #status").html()!=TranslateStatus(item.Status)) {
											$(id + " #status").html(TranslateStatus(item.Status));
										}
										if ($(id + " #lastupdate").html()!=item.LastUpdate) {
											$(id + " #lastupdate").html(item.LastUpdate);
										}
									}
								}
				  }
				}); //security devices
				
				//Utility Sensors
				$.each(data.result, function(i,item) {
				  if (
						( 
							(typeof item.Counter != 'undefined') || 
							(item.Type == "Current") || 
							(item.Type == "Energy") || 
							(item.Type == "Current/Energy") || 
							(item.Type == "Air Quality") || 
							(item.Type == "Lux") || 
							(item.Type == "Weight") || 
							(item.Type == "Usage")||
							(item.SubType=="Percentage")||
							(item.Type=="Fan")||
							((item.Type == "Thermostat")&&(item.SubType=="SetPoint"))||
							(item.SubType=="Soil Moisture")||
							(item.SubType=="Leaf Wetness")||
							(item.SubType=="Voltage")||
							(item.SubType=="Text")||
							(item.SubType=="Pressure")||
							(item.SubType=="A/D")
						) &&
						(item.Favorite!=0)
					  )
				  {
						id="#dashcontent #utility_" + item.idx;
						var obj=$(id);
						if (typeof obj != 'undefined') {
							if ($(id + " #name").html()!=item.Name) {
								$(id + " #name").html(item.Name);
							}
							if (($.DashboardType==2)||(window.myglobals.ismobile==true)) {
								var status="";
								if (typeof item.Counter != 'undefined') {
									if ($.DashboardType==0) {
										status+='' + $.i18n("Usage") + ': ' + item.CounterToday;
									}
									else {
										status+='U: T: ' + item.CounterToday;
									}
								}
								else if ((item.Type == "Current") || (item.Type == "Current/Energy")) {
									status+=item.Data;
								}
								else if (
											(item.Type == "Energy")||
											(item.Type == "Air Quality")||
											(item.Type == "Lux")||
											(item.Type == "Weight")||
											(item.Type == "Usage")||
											(item.SubType == "Percentage")||
											(item.Type == "Fan")||
											(item.SubType=="Soil Moisture")||
											(item.SubType=="Leaf Wetness")||
											(item.SubType=="Voltage")||
											(item.SubType=="Text")||
											(item.SubType=="Pressure")||
											(item.SubType=="A/D")
										) {
									status+=item.Data;
								}
								else if ((item.Type == "Thermostat")&&(item.SubType=="SetPoint")) {
									status+=item.Data + '\u00B0 ' + $.myglobals.tempsign;
								}
								if (typeof item.Usage != 'undefined') {
									if ($.DashboardType==0) {
										status+='<br>' + $.i18n("Actual") + ': ' + item.Usage;
									}
									else {
										status+=", A: " + item.Usage;
									}
								}
								if (typeof item.CounterDeliv != 'undefined') {
									if (item.CounterDeliv!=0) {
										if ($.DashboardType==0) {
											status+='<br>' + $.i18n("Return") + ': ' + item.CounterDelivToday;
											status+='<br>' + $.i18n("Actual") + ': ' + item.UsageDeliv;
										}
										else {
											status+='<br>R: T: ' + item.CounterDelivToday;
											status+=", A: " + item.UsageDeliv;
										}
									}
								}
								if ($(id + " #status").html()!=status) {
									$(id + " #status").html(status);
								}
							}
							else {
								var status="";
								var bigtext="";
								
								if (typeof item.Counter != 'undefined') {
									if ((item.SubType=="Gas")||(item.SubType == "RFXMeter counter")) {
										status="&nbsp;";
										bigtext=item.CounterToday;
									}
									else {
										status='' + $.i18n("Usage") + ': ' + item.CounterToday;
									}
								}
								else if ((item.Type == "Current") || (item.Type == "Current/Energy")) {
									status=item.Data;
								}
								else if (item.Type == "Energy") {
									status=item.Data;
								}
								else if (item.Type == "Air Quality") {
									status=item.Data + " (" + item.Quality + ")";
									bigtext=item.Data;
								}
								else if (item.SubType == "Percentage") {
									status=item.Data;
									bigtext=item.Data;
								}
								else if (item.Type == "Fan") {
									status=item.Data;
									bigtext=item.Data;
								}
								else if (item.SubType=="Soil Moisture") {
									status=item.Data;
									bigtext=item.Data;
								}
								else if (item.SubType=="Leaf Wetness") {
									status=item.Data;
									bigtext=item.Data;
								}
								else if ((item.SubType=="Voltage")||(item.SubType=="A/D")||(item.SubType=="Pressure")) {
									status=item.Data;
									bigtext=item.Data;
								}
								else if (item.SubType=="Text") {
									status=item.Data;
								}
								else if (item.Type == "Lux") {
									status=item.Data;
									bigtext=item.Data;
								}
								else if (item.Type == "Weight") {
									status=item.Data;
									bigtext=item.Data;
								}
								else if (item.Type == "Usage") {
									status=item.Data;
									bigtext=item.Data;
								}
								else if ((item.Type == "Thermostat")&&(item.SubType=="SetPoint")) {
									status=item.Data + '\u00B0 ' + $.myglobals.tempsign;
									bigtext=item.Data + '\u00B0 ' + $.myglobals.tempsign;
								}
								if (typeof item.Usage != 'undefined') {
									bigtext=item.Usage;
									if (item.Type != "P1 Smart Meter") {
										if ($.DashboardType==0) {
											//status+='<br>' + $.i18n("Actual") + ': ' + item.Usage;
											if (typeof item.CounterToday != 'undefined') {
												status+='<br>' + $.i18n("Today") + ': ' + item.CounterToday;
											}
										}
										else {
											//status+=", A: " + item.Usage;
											if (typeof item.CounterToday != 'undefined') {
												status+=', T: ' + item.CounterToday;
											}
										}
									}
								}
								if (typeof item.CounterDeliv != 'undefined') {
									if (item.CounterDeliv!=0) {
										if (item.UsageDeliv.charAt(0) != 0) {
											bigtext='-' + item.UsageDeliv;
										}
										status+='<br>';
										if (($.DashboardType==2)||(window.myglobals.ismobile==true)) {
											status+='R: ' + item.CounterDelivToday;
										}
										else {
											status+='' + $.i18n("Return") + ': ' + item.CounterDelivToday;
										}
									}
								}
								
								var nbackcolor="#D4E1EE";
								if (item.HaveTimeout==true) {
									nbackcolor="#DF2D3A";
								}
								else {
									var BatteryLevel=parseInt(item.BatteryLevel);
									if (BatteryLevel!=255) {
										if (BatteryLevel<=10) {
											nbackcolor="#DDDF2D";
										}
									}
								}
								var obackcolor=rgb2hex($(id + " #name").css( "background-color" )).toUpperCase();
								if (obackcolor!=nbackcolor) {
									$(id + " #name").css( "background-color", nbackcolor );
								}
								
								if ($(id + " #status").html()!=status) {
									$(id + " #status").html(status);
								}
								if ($(id + " #bigtext").html()!=bigtext) {
									$(id + " #bigtext").html(bigtext);
								}
								if ($(id + " #lastupdate").html()!=item.LastUpdate) {
									$(id + " #lastupdate").html(item.LastUpdate);
								}
							}
						}
				  }
				}); //Utility devices
			  }
			 }
		  });
			$scope.mytimer=$interval(function() {
				RefreshFavorites();
			}, 10000);
		}

		ShowFavorites = function()
		{
			if (typeof $scope.mytimer != 'undefined') {
				$interval.cancel($scope.mytimer);
				$scope.mytimer = undefined;
			}
		  var totdevices=0;
		  var jj=0;
		  var bHaveAddedDevider = false;
		  var bAllowWidgetReorder = true;
		  
			var htmlcontent = "";

			var bShowRoomplan=false;
			$.RoomPlans = [];
		  $.ajax({
			 url: "json.htm?type=plans",
			 async: false, 
			 dataType: 'json',
			 success: function(data) {
				if (typeof data.result != 'undefined') {
					var totalItems=data.result.length;
					if (totalItems>0) {
						bShowRoomplan=true;
		//				if (window.myglobals.ismobile==true) {
			//				bShowRoomplan=false;
				//		}
						if (bShowRoomplan==true) {
							$.each(data.result, function(i,item) {
								$.RoomPlans.push({
									idx: item.idx,
									name: item.Name
								});
							});
						}
					}
				}
			 }
		  });
		  $.ajax({
			 url: "json.htm?type=devices&filter=all&used=true&order=Name&plan="+window.myglobals.LastPlanSelected,
			 async: false,
			 dataType: 'json',
			 success: function(data) {
				if (typeof data.ActTime != 'undefined') {
					$scope.LastUpdateTime=parseInt(data.ActTime);
				}
				$.DashboardType=data.DashboardType;
				if ($.DashboardType==3) {
					$window.location = '/#Floorplans';
					return;
				}
			 
				bAllowWidgetReorder=data.AllowWidgetOrdering;
				var rowItems=3;
				if ($.DashboardType==1) {
					rowItems=4;
				}
				if (($.DashboardType==2)||(window.myglobals.ismobile==true)) {
					rowItems=1000;
				}
				$.myglobals.DashboardType=$.DashboardType;

				if (typeof data.WindScale != 'undefined') {
					$.myglobals.windscale=parseFloat(data.WindScale);
				}
				if (typeof data.WindSign != 'undefined') {
					$.myglobals.windsign=data.WindSign;
				}
				if (typeof data.TempScale != 'undefined') {
					$.myglobals.tempscale=parseFloat(data.TempScale);
				}
				if (typeof data.TempSign != 'undefined') {
					$.myglobals.tempsign=data.TempSign;
				}

			  if (typeof data.result != 'undefined') {
						//Scenes
						
				if (typeof data.WindScale != 'undefined') {
					$.myglobals.windscale=parseFloat(data.WindScale);
				}
				if (typeof data.WindSign != 'undefined') {
					$.myglobals.windsign=data.WindSign;
				}
						
				jj=0;
				bHaveAddedDevider = false;
				$.each(data.result, function(i,item) {
					//Scenes/Groups
				  if (((item.Type.indexOf('Scene') == 0)||(item.Type.indexOf('Group') == 0))&&(item.Favorite!=0))
				  {
					totdevices+=1;
					if (jj == 0)
					{
					  //first time
					  if (($.DashboardType==2)||(window.myglobals.ismobile==true)) {
										htmlcontent+='\t    <table class="mobileitem">\n';
										htmlcontent+='\t    <thead>\n';
										htmlcontent+='\t    <tr>\n';
										htmlcontent+='\t    		<th>' + $.i18n('Scenes') + '</th>\n';
										htmlcontent+='\t    		<th style="text-align:right"><a id="cLightSwitches" href="javascript:SwitchLayout(\'Scenes\')"><img src="images/next.png"></a></th>\n';
										htmlcontent+='\t    </tr>\n';
										htmlcontent+='\t    </thead>\n';
					  }
					  else {
										htmlcontent+='<h2>' + $.i18n('Scenes') + ':</h2>\n';
									}
					}
					if (jj % rowItems == 0)
					{
					  //add devider
					  if (bHaveAddedDevider == true) {
						//close previous devider
						htmlcontent+='</div>\n';
					  }
					  htmlcontent+='<div class="row divider">\n';
					  bHaveAddedDevider=true;
					}
					
					var xhtm="";
								if (($.DashboardType==2)||(window.myglobals.ismobile==true)) {
									xhtm+=
											'\t    <tr id="scene_' + item.idx +'">\n' +
											'\t      <td id="name">' + item.Name;
									xhtm+=
											 '</td>\n';
									var status="";
									if (item.Type.indexOf('Scene')==0) {
										status+='<button class="btn btn-mini" type="button" onclick="SwitchScene(' + item.idx + ',\'On\',RefreshFavorites, ' + item.Protected + ');">' + $.i18n("On") +'</button>';
									}
									else {
										if (item.Status == 'Off') {
											status+='<button class="btn btn-mini" type="button" onclick="SwitchScene(' + item.idx + ',\'On\',RefreshFavorites, ' + item.Protected + ');">' + $.i18n("On") +'</button> ' +
													'<button class="btn btn-mini btn-info" type="button" onclick="SwitchScene(' + item.idx + ',\'Off\',RefreshFavorites, ' + item.Protected + ');">' + $.i18n("Off") +'</button>';
										}
										else {
											status+='<button class="btn btn-mini btn-info" type="button" onclick="SwitchScene(' + item.idx + ',\'On\',RefreshFavorites, ' + item.Protected + ');">' + $.i18n("On") +'</button> ' +
													'<button class="btn btn-mini" type="button" onclick="SwitchScene(' + item.idx + ',\'Off\',RefreshFavorites, ' + item.Protected + ');">' + $.i18n("Off") +'</button>';
										}
									}
									xhtm+=
												'\t      <td id="status">' + status + '</td>\n' +
												'\t    </tr>\n';
								}
								else {
									if ($.DashboardType==0) {
										xhtm='\t<div class="span4 movable" id="scene_' + item.idx +'">\n';
									}
									else if ($.DashboardType==1) {
										xhtm='\t<div class="span3 movable" id="scene_' + item.idx +'">\n';
									}
									xhtm+='\t  <section>\n';
									if (item.Type.indexOf('Scene')==0) {
										xhtm+='\t    <table id="itemtablesmall" border="0" cellpadding="0" cellspacing="0">\n';
									}
									else {
										xhtm+='\t    <table id="itemtablesmalldoubleicon" border="0" cellpadding="0" cellspacing="0">\n';
									}
									var nbackcolor="#D4E1EE";
									if (item.Protected==true) {
										nbackcolor="#A4B1EE";
									}
									
									xhtm+=
											'\t    <tr>\n' +
											'\t      <td id="name" style="background-color: ' + nbackcolor + ';">' + item.Name + '</td>\n'+
											'\t      <td id="bigtext">';
									  if (item.UsedByCamera==true) {
										var streamimg='<img src="images/webcam.png" title="' + $.i18n('Stream Video') +'" height="16" width="16">';
										streamurl="<a href=\"javascript:ShowCameraLiveStream('" + item.Name + "','" + item.CameraIdx + "')\">" + streamimg + "</a>";
										xhtm+=streamurl;
									  }
									  xhtm+='</td>\n';
									if (item.Type.indexOf('Scene')==0) {
										xhtm+='<td id="img1"><img src="images/push48.png" title="Activate" onclick="SwitchScene(' + item.idx + ',\'On\',RefreshFavorites, ' + item.Protected + ');" class="lcursor" height="40" width="40"></td>\n';
										xhtm+='\t      <td id="status">&nbsp;</td>\n';
									}
									else {
										var onclass="";
										var offclass="";
										if (item.Status == 'On') {
											onclass="transimg";
											offclass="";
										}
										else if (item.Status == 'Off') {
											onclass="";
											offclass="transimg";
										}
										xhtm+='<td id="img1"><img class="lcursor ' + onclass + '" src="images/push48.png" title="' + $.i18n("Turn On") +'" onclick="SwitchScene(' + item.idx + ',\'On\',RefreshFavorites, ' + item.Protected + ');" height="40" width="40"></td>\n';
										xhtm+='<td id="img2"><img class="lcursor ' + offclass + '"src="images/pushoff48.png" title="' + $.i18n("Turn Off") +'" onclick="SwitchScene(' + item.idx + ',\'Off\',RefreshFavorites, ' + item.Protected + ');" height="40" width="40"></td>\n';
										xhtm+='\t      <td id="status">' + TranslateStatus(item.Status) + '</td>\n';
									}
									xhtm+='\t      <td id="lastupdate">' + item.LastUpdate + '</td>\n';
									xhtm+=
												'\t    </tr>\n' +
												'\t    </table>\n' +
												'\t  </section>\n' +
												'\t</div>\n';
								}
					htmlcontent+=xhtm;
					jj+=1;
				  }
				}); //scenes
				if (bHaveAddedDevider == true) {
				  //close previous devider
				  htmlcontent+='</div>\n';
				}
				if (($.DashboardType==2)||(window.myglobals.ismobile==true)) {
							htmlcontent+='\t    </table>\n';
				}
				
				//light devices
				jj=0;
				bHaveAddedDevider = false;
				$.each(data.result, function(i,item){
				  if (
						(item.Favorite!=0)&&
						((item.Type.indexOf('Light') == 0)||(item.Type.indexOf('Blind') == 0)||(item.Type.indexOf('Curtain') == 0)||(item.Type.indexOf('Thermostat 3') == 0)||(item.Type.indexOf('Chime') == 0)||(item.Type.indexOf('RFY') == 0)||((item.Type.indexOf('Value') == 0) && (typeof item.SwitchType != 'undefined')))
					  )
				  {
					totdevices+=1;
					if (jj == 0)
					{
					  //first time
					  if (($.DashboardType==2)||(window.myglobals.ismobile==true)) {
										if (htmlcontent!="") {
											htmlcontent+='<br>';
										}
										htmlcontent+='\t    <table class="mobileitem">\n';
										htmlcontent+='\t    <thead>\n';
										htmlcontent+='\t    <tr>\n';
										htmlcontent+='\t    		<th>' + $.i18n('Light/Switch Devices') +'</th>\n';
										htmlcontent+='\t    		<th style="text-align:right"><a id="cLightSwitches" href="javascript:SwitchLayout(\'LightSwitches\')"><img src="images/next.png"></a></th>\n';
										htmlcontent+='\t    </tr>\n';
										htmlcontent+='\t    </thead>\n';
					  }
					  else {
										htmlcontent+='<h2>' + $.i18n('Light/Switch Devices') + ':</h2>\n';
									}
					}
					if (jj % rowItems == 0)
					{
					  //add devider
					  if (bHaveAddedDevider == true) {
						//close previous devider
						htmlcontent+='</div>\n';
					  }
					  htmlcontent+='<div class="row divider">\n';
					  bHaveAddedDevider=true;
					}
					var nbackcolor="#D4E1EE";
					if (item.Protected==true) {
						nbackcolor="#A4B1EE";
					}
					
					var xhtm="";
								if (($.DashboardType==2)||(window.myglobals.ismobile==true)) {
									xhtm+=
											'\t    <tr id="light_' + item.idx +'">\n' +
											'\t      <td id="name">' + item.Name;
									xhtm+=
											 '</td>\n';
									var status=TranslateStatus(item.Status) + " ";
									if (item.SwitchType == "Doorbell") {
										status+='<button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Ring") +'</button>';
									}
									else if (item.SwitchType == "Push On Button") {
										if (item.InternalState=="On") {
												status='<button class="btn btn-mini btn-info" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("On") +'</button>';
											}
											else {
												status='<button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("On") +'</button>';
											}
									}
									else if (item.SwitchType == "Door Lock") {
										if (item.InternalState=="Open") {
												status='<button class="btn btn-mini btn-info" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Open") +'</button> ' + 
													'<button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Lock") +'</button>';
											}
											else {
												status='<button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Open") +'</button> ' + 
													'<button class="btn btn-mini btn-info" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Locked") +'</button>';
											}
									}
									else if (item.SwitchType == "Push Off Button") {
										status='<button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Off") +'</button>';
									}
									else if (item.SwitchType == "X10 Siren") {
										if (
												(item.Status == 'On')||
												(item.Status == 'Chime')||
												(item.Status == 'Group On')||
												(item.Status == 'All On')
											 ) {
												status='<button class="btn btn-mini btn-info" type="button">' + $.i18n("SIREN") +'</button>';
											}
											else {
												status='<button class="btn btn-mini" type="button">' + $.i18n("Silence") +'</button>';
											}
									}
									else if (item.SwitchType == "Contact") {
											if (item.Status == 'Closed') {
												status='<button class="btn btn-mini" type="button" onclick="ShowLightLog(' + item.idx + ',\'' + item.Name  + '\', \'#dashcontent\', \'ShowFavorites\');">' + $.i18n("Closed") +'</button>';
											}
											else {
												status='<button class="btn btn-mini btn-info" type="button" onclick="ShowLightLog(' + item.idx + ',\'' + item.Name  + '\', \'#dashcontent\', \'ShowFavorites\');">' + $.i18n("Open") +'</button>';
											}
										}
									else if ((item.SwitchType == "Blinds")||(item.SwitchType.indexOf("Venetian Blinds") == 0)) {
										if ((item.SubType=="RAEX")||(item.SubType.indexOf('A-OK') == 0)||(item.SubType.indexOf('RollerTrol') == 0)||(item.SubType=="Harrison")||(item.SubType.indexOf('RFY') == 0)||(item.SubType.indexOf('T6 DC') == 0)||(item.SwitchType.indexOf("Venetian Blinds") == 0)) {
											if (item.Status == 'Closed') {
												status=
													'<button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Open") +'</button> ' +
													'<button class="btn btn-mini btn-danger" type="button" onclick="SwitchLight(' + item.idx + ',\'Stop\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Stop") +'</button> ' +
													'<button class="btn btn-mini btn-info" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Closed") +'</button>';
											}
											else {
												status=
													'<button class="btn btn-mini btn-info" type="button" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Open") +'</button> ' +
													'<button class="btn btn-mini btn-danger" type="button" onclick="SwitchLight(' + item.idx + ',\'Stop\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Stop") +'</button> ' +
													'<button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Close") +'</button>';
											}
										}
										else {
											if (item.Status == 'Closed') {
												status=
													'<button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Open") +'</button> ' +
													'<button class="btn btn-mini btn-info" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Closed") +'</button>';
											}
											else {
												status=
													'<button class="btn btn-mini btn-info" type="button" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Open") +'</button> ' +
													'<button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Close") +'</button>';
											}
										}
									}
									else if (item.SwitchType == "Blinds Inverted") {
										if ((item.SubType=="RAEX")||(item.SubType.indexOf('A-OK') == 0)||(item.SubType.indexOf('RollerTrol') == 0)||(item.SubType=="Harrison")||(item.SubType.indexOf('RFY') == 0)||(item.SubType.indexOf('T6 DC') == 0)) {
											if (item.Status == 'Closed') {
													status=
														'<button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Open") +'</button> ' +
														'<button class="btn btn-mini btn-danger" type="button" onclick="SwitchLight(' + item.idx + ',\'Stop\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Stop") +'</button> ' +
														'<button class="btn btn-mini btn-info" type="button" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Closed") +'</button>';
												}
												else {
													status=
														'<button class="btn btn-mini btn-info" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Open") +'</button> ' +
														'<button class="btn btn-mini btn-danger" type="button" onclick="SwitchLight(' + item.idx + ',\'Stop\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Stop") +'</button> ' +
														'<button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Close") +'</button>';
												}
											}
											else {
												if (item.Status == 'Closed') {
													status=
														'<button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Open") +'</button> ' +
														'<button class="btn btn-mini btn-info" type="button" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Closed") +'</button>';
												}
												else {
													status=
														'<button class="btn btn-mini btn-info" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Open") +'</button> ' +
														'<button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Close") +'</button>';
												}
										}
									}               
									else if (item.SwitchType == "Blinds Percentage") {
										if (item.Status == 'Closed') {
											status=
												'<button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Open") +'</button> ' +
												'<button class="btn btn-mini btn-info" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Closed") +'</button>';
										}
										else {
											status=
												'<button class="btn btn-mini btn-info" type="button" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Open") +'</button> ' +
												'<button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Close") +'</button>';
										}
									}
									else if (item.SwitchType == "Dimmer") {
										var img="";
										if (
												(item.Status == 'On')||
												(item.Status == 'Chime')||
												(item.Status == 'Group On')||
												(item.Status.indexOf('Set ') == 0)
											 ){
														status=
															'<label id=\"statustext\"><button class="btn btn-mini btn-info" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("On") +'</button></label> ' +
															'<label id=\"img\"><button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Off") +'</button></label>';
											}
											else {
														status=
															'<label id=\"statustext\"><button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("On") +'</button></label> ' +
															'<label id=\"img\"><button class="btn btn-mini btn-info" type="button" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Off") +'</button></label>';
											}
										}
									else if (item.SwitchType == "Dusk Sensor") {
										if (item.Status == 'On')
										{
													status='<button class="btn btn-mini" type="button" onclick="ShowLightLog(' + item.idx + ',\'' + item.Name  + '\', \'#dashcontent\', \'ShowFavorites\');">' + $.i18n("Dark") +'</button>';
										}
										else {
													status='<button class="btn btn-mini" type="button" onclick="ShowLightLog(' + item.idx + ',\'' + item.Name  + '\', \'#dashcontent\', \'ShowFavorites\');">' + $.i18n("Sunny") +'</button>';
										}
									}
									else if (item.SwitchType == "Motion Sensor") {
										if (
												(item.Status == 'On')||
												(item.Status == 'Chime')||
												(item.Status == 'Group On')||
												(item.Status.indexOf('Set ') == 0)
											 ) {
														status='<button class="btn btn-mini btn-info" type="button" onclick="ShowLightLog(' + item.idx + ',\'' + item.Name  + '\', \'#dashcontent\', \'ShowFavorites\');">' + $.i18n("Motion") +'</button>';
											}
											else {
														status='<button class="btn btn-mini" type="button" onclick="ShowLightLog(' + item.idx + ',\'' + item.Name  + '\', \'#dashcontent\', \'ShowFavorites\');">' + $.i18n("No Motion") +'</button>';
											}
									}
									else if (item.SwitchType == "Smoke Detector") {
											if (
													(item.Status == "Panic")||
													(item.Status == "On")
												 ) {
														status='<button class="btn btn-mini  btn-info" type="button" onclick="ShowLightLog(' + item.idx + ',\'' + item.Name  + '\', \'#dashcontent\', \'ShowFavorites\');">' + $.i18n("SMOKE") +'</button>';
											}
											else {
														status='<button class="btn btn-mini" type="button" onclick="ShowLightLog(' + item.idx + ',\'' + item.Name  + '\', \'#dashcontent\', \'ShowFavorites\');">' + $.i18n("No Smoke") +'</button>';
											}
									}
									else {
										if (
												(item.Status == 'On')||
												(item.Status == 'Chime')||
												(item.Status == 'Group On')||
												(item.Status.indexOf('Set ') == 0)
											 ) {
														status=
															'<button class="btn btn-mini btn-info" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("On") +'</button> ' +
															'<button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Off") +'</button>';
											}
											else {
														status=
															'<button class="btn btn-mini" type="button" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');">' + $.i18n("On") +'</button> ' +
															'<button class="btn btn-mini btn-info" type="button" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');">' + $.i18n("Off") +'</button>';
											}
									}
									xhtm+=
											'\t      <td id="status">' + status + '</td>\n' +
											'\t    </tr>\n';
									if (item.SwitchType == "Dimmer") {
										xhtm+='<tr>';
										xhtm+='<td colspan="2" style="border:0px solid red; padding-top:10px; padding-bottom:10px;">';
										xhtm+='<div style="margin-top: -11px; margin-left: 24px;" class="dimslider dimslidernorm" id="light_' + item.idx +'_slider" data-idx="' + item.idx + '" data-type="norm" data-maxlevel="' + item.MaxDimLevel + '" data-isprotected="' + item.Protected + '" data-svalue="' + item.LevelInt + '"></div>';
										xhtm+='</td>';
										xhtm+='</tr>';
									}
									else if (item.SwitchType == "Blinds Percentage") {
										xhtm+='<tr>';
										xhtm+='<td colspan="2" style="border:0px solid red; padding-top:10px; padding-bottom:10px;">';
										xhtm+='<div style="margin-top: -11px; margin-left: 24px;" class="dimslider dimslidersmall" id="slider" data-idx="' + item.idx + '" data-type="blinds" data-maxlevel="' + item.MaxDimLevel + '" data-isprotected="' + item.Protected + '" data-svalue="' + item.LevelInt + '"></div>';
										xhtm+='</td>';
										xhtm+='</tr>';
									}
								}
								else {
									if ($.DashboardType==0) {
										xhtm='\t<div class="span4 movable" id="light_' + item.idx +'">\n';
									}
									else if ($.DashboardType==1) {
										xhtm='\t<div class="span3 movable" id="light_' + item.idx +'">\n';
									}
									xhtm+='\t  <section>\n';
									if ((item.Type.indexOf('Blind') == 0)||(item.SwitchType == "Blinds")||(item.SwitchType == "Blinds Inverted")||(item.SwitchType == "Blinds Percentage")||(item.SwitchType.indexOf("Venetian Blinds") == 0)) {
										if ((item.SubType=="RAEX")||(item.SubType.indexOf('A-OK') == 0)||(item.SubType.indexOf('RollerTrol') == 0)||(item.SubType=="Harrison")||(item.SubType.indexOf('RFY') == 0)||(item.SubType.indexOf('T6 DC') == 0)||(item.SwitchType.indexOf("Venetian Blinds") == 0)) {
											xhtm+='\t    <table id="itemtablesmalltrippleicon" border="0" cellpadding="0" cellspacing="0">\n';
										}
										else {
											xhtm+='\t    <table id="itemtablesmalldoubleicon" border="0" cellpadding="0" cellspacing="0">\n';
										}
									}
									else {
										xhtm+='\t    <table id="itemtablesmall" border="0" cellpadding="0" cellspacing="0">\n';
									}
									xhtm+=
											'\t    <tr>\n' +
											'\t      <td id="name" style="background-color: ' + nbackcolor + ';">' + item.Name + '</td>\n'+
											'\t      <td id="bigtext">';
								  if (item.UsedByCamera==true) {
									var streamimg='<img src="images/webcam.png" title="' + $.i18n('Stream Video') +'" height="16" width="16">';
									streamurl="<a href=\"javascript:ShowCameraLiveStream('" + item.Name + "','" + item.CameraIdx + "')\">" + streamimg + "</a>";
									xhtm+=streamurl;
								  }
								  xhtm+='</td>\n';
									if (item.SwitchType == "Doorbell") {
										xhtm+='\t      <td id="img"><img src="images/doorbell48.png" title="' + $.i18n("Turn On") +'" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
									}
									else if (item.SwitchType == "Push On Button") {
										if (item.InternalState=="On") {
											xhtm+='\t      <td id="img"><img src="images/pushon48.png" title="' + $.i18n("Turn On") +'" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
										}
										else {
											xhtm+='\t      <td id="img"><img src="images/push48.png" title="' + $.i18n("Turn On") +'" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
										}
									}
									else if (item.SwitchType == "Door Lock") {
										if (item.InternalState=="Open") {
											xhtm+='\t      <td id="img"><img src="images/door48open.png" title="' + $.i18n("Close Door") +'" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
										}
										else {
											xhtm+='\t      <td id="img"><img src="images/door48.png" title="' + $.i18n("Open Door") +'" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
										}
									}
									else if (item.SwitchType == "Push Off Button") {
										xhtm+='\t      <td id="img"><img src="images/pushoff48.png" title="' + $.i18n("Turn Off") +'" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
									}
									else if (item.SwitchType == "X10 Siren") {
										if (
												(item.Status == 'On')||
												(item.Status == 'Chime')||
												(item.Status == 'Group On')||
												(item.Status == 'All On')
											 )
										{
												xhtm+='\t      <td id="img"><img src="images/siren-on.png" height="40" width="40"></td>\n';
										}
										else {
												xhtm+='\t      <td id="img"><img src="images/siren-off.png" height="40" width="40"></td>\n';
										}
									}
									else if (item.SwitchType == "Contact") {
										if (item.Status == 'Closed') {
											xhtm+='\t      <td id="img"><img src="images/contact48.png" onclick="ShowLightLog(' + item.idx + ',\'' + item.Name  + '\', \'#dashcontent\', \'ShowFavorites\');" class="lcursor" height="40" width="40"></td>\n';
										}
										else {
											xhtm+='\t      <td id="img"><img src="images/contact48_open.png" onclick="ShowLightLog(' + item.idx + ',\'' + item.Name  + '\', \'#dashcontent\', \'ShowFavorites\');" class="lcursor" height="40" width="40"></td>\n';
										}
									}
									else if ((item.SwitchType == "Blinds")||(item.SwitchType.indexOf("Venetian Blinds") == 0)) {
										if ((item.SubType=="RAEX")||(item.SubType.indexOf('A-OK') == 0)||(item.SubType.indexOf('RollerTrol') == 0)||(item.SubType=="Harrison")||(item.SubType.indexOf('RFY') == 0)||(item.SubType.indexOf('T6 DC') == 0)||(item.SwitchType.indexOf("Venetian Blinds") == 0)) {
											if (item.Status == 'Closed') {
												xhtm+='\t      <td id="img"><img src="images/blindsopen48.png" title="' + $.i18n("Open Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
												xhtm+='\t      <td id="img2"><img src="images/blindsstop.png" title="Stop Blinds" onclick="SwitchLight(' + item.idx + ',\'Stop\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="24"></td>\n';
												xhtm+='\t      <td id="img3"><img src="images/blinds48sel.png" title="' + $.i18n("Close Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
											}
											else {
												xhtm+='\t      <td id="img"><img src="images/blindsopen48sel.png" title="' + $.i18n("Open Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
												xhtm+='\t      <td id="img2"><img src="images/blindsstop.png" title="Stop Blinds" onclick="SwitchLight(' + item.idx + ',\'Stop\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="24"></td>\n';
												xhtm+='\t      <td id="img3"><img src="images/blinds48.png" title="' + $.i18n("Close Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
											}
										}
										else {
											if (item.Status == 'Closed') {
												xhtm+='\t      <td id="img"><img src="images/blindsopen48.png" title="' + $.i18n("Open Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
												xhtm+='\t      <td id="img2"><img src="images/blinds48sel.png" title="' + $.i18n("Close Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
											}
											else {
												xhtm+='\t      <td id="img"><img src="images/blindsopen48sel.png" title="' + $.i18n("Open Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
												xhtm+='\t      <td id="img2"><img src="images/blinds48.png" title="' + $.i18n("Close Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
											}
										}
									}
									else if (item.SwitchType == "Blinds Inverted") {
										if ((item.SubType=="RAEX")||(item.SubType.indexOf('A-OK') == 0)||(item.SubType.indexOf('RollerTrol') == 0)||(item.SubType=="Harrison")||(item.SubType.indexOf('RFY') == 0)||(item.SubType.indexOf('T6 DC') == 0)) {
											if (item.Status == 'Closed') {
												xhtm+='\t      <td id="img"><img src="images/blindsopen48.png" title="' + $.i18n("Open Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
												xhtm+='\t      <td id="img2"><img src="images/blindsstop.png" title="Stop Blinds" onclick="SwitchLight(' + item.idx + ',\'Stop\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="24"></td>\n';
												xhtm+='\t      <td id="img3"><img src="images/blinds48sel.png" title="' + $.i18n("Close Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
											}
											else {
												xhtm+='\t      <td id="img"><img src="images/blindsopen48sel.png" title="' + $.i18n("Open Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
												xhtm+='\t      <td id="img2"><img src="images/blindsstop.png" title="Stop Blinds" onclick="SwitchLight(' + item.idx + ',\'Stop\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="24"></td>\n';
												xhtm+='\t      <td id="img3"><img src="images/blinds48.png" title="' + $.i18n("Close Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
											}
										}
										else {
											if (item.Status == 'Closed') {
												xhtm+='\t      <td id="img"><img src="images/blindsopen48.png" title="' + $.i18n("Open Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
												xhtm+='\t      <td id="img2"><img src="images/blinds48sel.png" title="' + $.i18n("Close Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
											}
											else {
												xhtm+='\t      <td id="img"><img src="images/blindsopen48sel.png" title="' + $.i18n("Open Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
												xhtm+='\t      <td id="img2"><img src="images/blinds48.png" title="' + $.i18n("Close Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
											}
										}
									}               
									else if (item.SwitchType == "Blinds Percentage") {
										if (item.Status == 'Closed') {
											xhtm+='\t      <td id="img"><img src="images/blindsopen48.png" title="' + $.i18n("Open Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
											xhtm+='\t      <td id="img2"><img src="images/blinds48sel.png" title="' + $.i18n("Close Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
										}
										else {
											xhtm+='\t      <td id="img"><img src="images/blindsopen48sel.png" title="' + $.i18n("Open Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
											xhtm+='\t      <td id="img2"><img src="images/blinds48.png" title="' + $.i18n("Close Blinds") +'" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
										}
									}
									else if (item.SwitchType == "Dimmer") {
										if (
												(item.Status == 'On')||
												(item.Status == 'Chime')||
												(item.Status == 'Group On')||
												(item.Status.indexOf('Set ') == 0)
											 ) {
													xhtm+='\t      <td id="img"><img src="images/dimmer48-on.png" title="' + $.i18n("Turn Off") +'" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
										}
										else {
													xhtm+='\t      <td id="img"><img src="images/dimmer48-off.png" title="' + $.i18n("Turn On") +'" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
										}
									}
									else if (item.SwitchType == "Dusk Sensor") {
										if (item.Status == 'On')
										{
													xhtm+='\t      <td id="img"><img src="images/uvdark.png" onclick="ShowLightLog(' + item.idx + ',\'' + item.Name  + '\', \'#dashcontent\', \'ShowFavorites\');" class="lcursor" height="40" width="40"></td>\n';
										}
										else {
													xhtm+='\t      <td id="img"><img src="images/uvsunny.png" onclick="ShowLightLog(' + item.idx + ',\'' + item.Name  + '\', \'#dashcontent\', \'ShowFavorites\');" class="lcursor" height="40" width="40"></td>\n';
										}
									}
									else if (item.SwitchType == "Motion Sensor") {
										if (
												(item.Status == 'On')||
												(item.Status == 'Chime')||
												(item.Status == 'Group On')||
												(item.Status.indexOf('Set ') == 0)
											 ) {
													xhtm+='\t      <td id="img"><img src="images/motion48-on.png" onclick="ShowLightLog(' + item.idx + ',\'' + item.Name  + '\', \'#dashcontent\', \'ShowFavorites\');" class="lcursor" height="40" width="40"></td>\n';
										}
										else {
													xhtm+='\t      <td id="img"><img src="images/motion48-off.png" onclick="ShowLightLog(' + item.idx + ',\'' + item.Name  + '\', \'#dashcontent\', \'ShowFavorites\');" class="lcursor" height="40" width="40"></td>\n';
										}
									}
									else if (item.SwitchType == "Smoke Detector") {
											if (
													(item.Status == "Panic")||
													(item.Status == "On")
												 ) {
													xhtm+='\t      <td id="img"><img src="images/smoke48on.png" onclick="ShowLightLog(' + item.idx + ',\'' + item.Name  + '\', \'#dashcontent\', \'ShowFavorites\');" class="lcursor" height="40" width="40"></td>\n';
											}
											else {
													xhtm+='\t      <td id="img"><img src="images/smoke48off.png" onclick="ShowLightLog(' + item.idx + ',\'' + item.Name  + '\', \'#dashcontent\', \'ShowFavorites\');" class="lcursor" height="40" width="40"></td>\n';
											}
									}
									else {
										if (
												(item.Status == 'On')||
												(item.Status == 'Chime')||
												(item.Status == 'Group On')||
												(item.Status.indexOf('Set ') == 0)
											 ) {
													xhtm+='\t      <td id="img"><img src="images/' + item.Image + '48_On.png" title="' + $.i18n("Turn Off") +'" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
										}
										else {
													xhtm+='\t      <td id="img"><img src="images/' + item.Image + '48_Off.png" title="' + $.i18n("Turn On") +'" onclick="SwitchLight(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
										}
									}
									xhtm+=
												'\t      <td id="status">' + TranslateStatus(item.Status) + '</td>\n' +
												'\t      <td id="lastupdate">' + item.LastUpdate + '</td>\n';
									if (item.SwitchType == "Dimmer") {
										xhtm+='<td><div style="margin-left:50px; margin-top: 0.2em;" class="dimslider dimslidernorm" id="slider" data-idx="' + item.idx + '" data-type="norm" data-maxlevel="' + item.MaxDimLevel + '" data-isprotected="' + item.Protected + '" data-svalue="' + item.LevelInt + '"></div></td>';
									}
									else if (item.SwitchType == "Blinds Percentage") {
										xhtm+='<td><div style="margin-left:94px; margin-top: 0.2em;" class="dimslider dimslidersmall" id="slider" data-idx="' + item.idx + '" data-type="blinds" data-maxlevel="' + item.MaxDimLevel + '" data-isprotected="' + item.Protected + '" data-svalue="' + item.LevelInt + '"></div></td>';
									}
									xhtm+=
												'\t    </tr>\n' +
												'\t    </table>\n' +
												'\t  </section>\n' +
												'\t</div>\n';
								}
					htmlcontent+=xhtm;
					jj+=1;
				  }
				}); //light devices
				if (bHaveAddedDevider == true) {
				  //close previous devider
				  htmlcontent+='</div>\n';
				}
				if (($.DashboardType==2)||(window.myglobals.ismobile==true)) {
							htmlcontent+='\t    </table>\n';
				}

				//Temperature Sensors
				jj=0;
				bHaveAddedDevider = false;
				$.each(data.result, function(i,item){
				  if (
						((typeof item.Temp != 'undefined')||(typeof item.Humidity != 'undefined')||(typeof item.Chill != 'undefined')) &&
						(item.Favorite!=0)
					  )
				  {
					totdevices+=1;
					if (jj == 0)
					{
					  //first time
					  if (($.DashboardType==2)||(window.myglobals.ismobile==true)) {
										if (htmlcontent!="") {
											htmlcontent+='<br>';
										}
										htmlcontent+='\t    <table class="mobileitem">\n';
										htmlcontent+='\t    <thead>\n';
										htmlcontent+='\t    <tr>\n';
										htmlcontent+='\t    		<th>' + $.i18n('Temperature Sensors') + '</th>\n';
										htmlcontent+='\t    		<th style="text-align:right"><a id="cTemperature" href="javascript:SwitchLayout(\'Temperature\')"><img src="images/next.png"></a></th>\n';
										htmlcontent+='\t    </tr>\n';
										htmlcontent+='\t    </thead>\n';
					  }
					  else {
										htmlcontent+='<h2>' + $.i18n('Temperature Sensors') + ':</h2>\n';
									}
					}
					if (jj % rowItems == 0)
					{
					  //add devider
					  if (bHaveAddedDevider == true) {
						//close previous devider
						htmlcontent+='</div>\n';
					  }
					  htmlcontent+='<div class="row divider">\n';
					  bHaveAddedDevider=true;
					}
					var xhtm="";
								if (($.DashboardType==2)||(window.myglobals.ismobile==true)) {
									var vname='<img src="images/next.png" onclick="ShowTempLog(\'#dashcontent\',\'ShowFavorites\',' + item.idx + ',\'' + item.Name + '\');" height="16" width="16">' + " " + item.Name;

									xhtm+=
											'\t    <tr id="temp_' + item.idx +'">\n' +
											'\t      <td id="name">' + vname + '</td>\n';
									var status="";
									var bHaveBefore=false;
									if (typeof item.Temp != 'undefined') {
											 status+=item.Temp + '&deg; ' + $.myglobals.tempsign;
											 bHaveBefore=true;
									}
									if (typeof item.Chill != 'undefined') {
										if (bHaveBefore) {
											status+=', ';
										}
										status+=$.i18n('Chill') +': ' + item.Chill + '&deg; ' + $.myglobals.tempsign;
										bHaveBefore=true;
									}
									if (typeof item.Humidity != 'undefined') {
										if (bHaveBefore==true) {
											status+=', ';
										}
										status+=item.Humidity + ' %';
									}
									if (typeof item.HumidityStatus != 'undefined') {
										status+=' (' + $.i18n(item.HumidityStatus) + ')';
									}
									if (typeof item.DewPoint != 'undefined') {
										status+="<br>"+$.i18n("Dew Point") + ": " + item.DewPoint + '&deg; ' + $.myglobals.tempsign;
									}
									xhtm+=
												'\t      <td id="status">' + status + '</td>\n' +
												'\t    </tr>\n';
								}
								else {
									if ($.DashboardType==0) {
										xhtm='\t<div class="span4 movable" id="temp_' + item.idx +'">\n';
									}
									else if ($.DashboardType==1) {
										xhtm='\t<div class="span3 movable" id="temp_' + item.idx +'">\n';
									}
									xhtm+='\t  <section>\n';
									xhtm+='\t    <table id="itemtablesmall" border="0" cellpadding="0" cellspacing="0">\n';
									xhtm+=
												'\t    <tr>\n';
									var nbackcolor="#D4E1EE";
									if (item.HaveTimeout==true) {
										nbackcolor="#DF2D3A";
									}
									else {
										var BatteryLevel=parseInt(item.BatteryLevel);
										if (BatteryLevel!=255) {
											if (BatteryLevel<=10) {
												nbackcolor="#DDDF2D";
											}
										}
									}
									xhtm+='\t      <td id="name" style="background-color: ' + nbackcolor + ';">' + item.Name + '</td>\n';
									xhtm+='\t      <td id="bigtext">';
									var bigtext="";
									if (typeof item.Temp != 'undefined') {
										bigtext=item.Temp + '\u00B0';
									}
									if (typeof item.Humidity != 'undefined') {
										if (bigtext!="") {
											bigtext+=' / ';
										}
										bigtext+=item.Humidity + '%';
									}
									if (typeof item.Chill != 'undefined') {
										if (bigtext!="") {
											bigtext+=' / ';
										}
										bigtext+=item.Chill + '\u00B0';
									}
									xhtm+=bigtext+'</td>\n';
									xhtm+='\t      <td id="img"><img src="images/';
									if (typeof item.Temp != 'undefined') {
										xhtm+=GetTemp48Item(item.Temp);
									}
									else {
										if (item.Type=="Humidity") {
											xhtm+="gauge48.png";
										}
										else {
											xhtm+=GetTemp48Item(item.Chill);
										}
									}
									xhtm+='" class="lcursor" onclick="ShowTempLog(\'#dashcontent\',\'ShowFavorites\',' + item.idx + ',\'' + item.Name + '\');" height="40" width="40"></td>\n' +
											'\t      <td id="status">';
									var bHaveBefore=false;
									if (typeof item.Temp != 'undefined') {
											 xhtm+=item.Temp + '&deg; ' + $.myglobals.tempsign;
											 bHaveBefore=true;
									}
									if (typeof item.Chill != 'undefined') {
										if (bHaveBefore) {
											xhtm+=', ';
										}
										xhtm+=$.i18n('Chill') + ': ' + item.Chill + '&deg; ' + $.myglobals.tempsign;
										bHaveBefore=true;
									}
									if (typeof item.Humidity != 'undefined') {
										if (bHaveBefore==true) {
											xhtm+=', ';
										}
										xhtm+=$.i18n('Humidity') + ': ' + item.Humidity + ' %';
									}
									if (typeof item.HumidityStatus != 'undefined') {
										xhtm+=' (' + $.i18n(item.HumidityStatus) + ')';
									}
									if (typeof item.DewPoint != 'undefined') {
										xhtm+="<br>"+$.i18n("Dew Point") + ": " + item.DewPoint + '&deg; ' + $.myglobals.tempsign;
									}
									xhtm+=
											'</td>\n' +
											'\t      <td id="lastupdate">' + item.LastUpdate + '</td>\n' +
									'\t    </tr>\n' +
									'\t    </table>\n' +
									'\t  </section>\n' +
									'\t</div>\n';
								}
					htmlcontent+=xhtm;
					jj+=1;
				  }
				}); //temp devices
				if (bHaveAddedDevider == true) {
				  //close previous devider
				  htmlcontent+='</div>\n';
				}
				if (($.DashboardType==2)||(window.myglobals.ismobile==true)) {
							htmlcontent+='\t    </table>\n';
				}

				//Weather Sensors
				jj=0;
				bHaveAddedDevider = false;
				$.each(data.result, function(i,item){
				  if (
						( (typeof item.Rain != 'undefined') || (typeof item.Visibility != 'undefined') || (typeof item.UVI != 'undefined') || (typeof item.Radiation != 'undefined') || (typeof item.Direction != 'undefined') || (typeof item.Barometer != 'undefined') ) &&
						(item.Favorite!=0)
					  )
				  {
					totdevices+=1;
					if (jj == 0)
					{
					  //first time
					  if (($.DashboardType==2)||(window.myglobals.ismobile==true)) {
										if (htmlcontent!="") {
											htmlcontent+='<br>';
										}
										htmlcontent+='\t    <table class="mobileitem">\n';
										htmlcontent+='\t    <thead>\n';
										htmlcontent+='\t    <tr>\n';
										htmlcontent+='\t    		<th>' + $.i18n('Weather Sensors') + '</th>\n';
										htmlcontent+='\t    		<th style="text-align:right"><a id="cWeather" href="javascript:SwitchLayout(\'Weather\')"><img src="images/next.png"></a></th>\n';
										htmlcontent+='\t    </tr>\n';
										htmlcontent+='\t    </thead>\n';
					  }
					  else {
										htmlcontent+='<h2>' + $.i18n('Weather Sensors') + ':</h2>\n';
									}
					}
					if (jj % rowItems == 0)
					{
					  //add devider
					  if (bHaveAddedDevider == true) {
						//close previous devider
						htmlcontent+='</div>\n';
					  }
					  htmlcontent+='<div class="row divider">\n';
					  bHaveAddedDevider=true;
					}
					var xhtm="";
								if (($.DashboardType==2)||(window.myglobals.ismobile==true)) {
									xhtm+=
											'\t    <tr id="weather_' + item.idx +'">\n' +
											'\t      <td id="name">' + item.Name + '</td>\n';
									var status="";
									if (typeof item.Rain != 'undefined') {
										status+=item.Rain + ' mm';
										if (typeof item.RainRate != 'undefined') {
											if (item.RainRate!=0) {
												status+=', Rate: ' + item.RainRate + ' mm/h';
											}
										}
									}
									else if (typeof item.Visibility != 'undefined') {
										status+=item.Data;
									}
									else if (typeof item.UVI != 'undefined') {
										status+=item.UVI + ' UVI';
									}
									else if (typeof item.Radiation != 'undefined') {
										status+=item.Data;
									}
									else if (typeof item.Direction != 'undefined') {
										status=item.Direction + ' ' + item.DirectionStr;
										if (typeof item.Speed != 'undefined') {
											status+=', ' + $.i18n('Speed') + ': ' + item.Speed + ' ' + $.myglobals.windsign;
										}
										if (typeof item.Gust != 'undefined') {
											status+=', ' + $.i18n('Gust') + ': ' + item.Gust + ' ' + $.myglobals.windsign;
										}
									}
									else if (typeof item.Barometer != 'undefined') {
										if (typeof item.ForecastStr != 'undefined') {
											status=item.Barometer + ' hPa, ' + $.i18n('Prediction') + ': ' + $.i18n(item.ForecastStr);
										}
										else {
											status=item.Barometer + ' hPa';
										}
										if (typeof item.Altitude != 'undefined') {
											status+=', Altitude: ' + item.Altitude + ' meter';
										}
									}
									xhtm+=
												'\t      <td id="status">' + status + '</td>\n' +
												'\t    </tr>\n';
								}
								else {
									if ($.DashboardType==0) {
										xhtm='\t<div class="span4 movable" id="weather_' + item.idx +'">\n';
									}
									else if ($.DashboardType==1) {
										xhtm='\t<div class="span3 movable" id="weather_' + item.idx +'">\n';
									}
									xhtm+='\t  <section>\n';
									xhtm+='\t    <table id="itemtablesmall" border="0" cellpadding="0" cellspacing="0">\n';
									xhtm+='\t    <tr>\n';
									var nbackcolor="#D4E1EE";
									if (item.HaveTimeout==true) {
										nbackcolor="#DF2D3A";
									}
									else {
										var BatteryLevel=parseInt(item.BatteryLevel);
										if (BatteryLevel!=255) {
											if (BatteryLevel<=10) {
												nbackcolor="#DDDF2D";
											}
										}
									}
									xhtm+='\t      <td id="name" style="background-color: ' + nbackcolor + ';">' + item.Name + '</td>\n';
									xhtm+='\t      <td id="bigtext">';
									if (typeof item.Barometer != 'undefined') {
										xhtm+=item.Barometer + ' hPa';
									}
									else if (typeof item.Rain != 'undefined') {
										xhtm+=item.Rain + ' mm';
									}
									else if (typeof item.Visibility != 'undefined') {
										xhtm+=item.Data;
									}
									else if (typeof item.UVI != 'undefined') {
										xhtm+=item.UVI + ' UVI';
									}
									else if (typeof item.Radiation != 'undefined') {
										xhtm+=item.Data;
									}
									else if (typeof item.Direction != 'undefined') {
										xhtm+=item.DirectionStr;
										if (typeof item.Speed != 'undefined') {
											xhtm+=' / ' + item.Speed + ' ' + $.myglobals.windsign;
										}
										else if (typeof item.Gust != 'undefined') {
											xhtm+=' / ' + item.Gust + ' ' + $.myglobals.windsign;
										}
									}
									xhtm+='</td>\n';
									xhtm+='\t      <td id="img"><img src="images/';
									if (typeof item.Rain != 'undefined') {
										xhtm+='rain48.png" class="lcursor" onclick="ShowRainLog(\'#dashcontent\',\'ShowFavorites\',' + item.idx + ',\'' + item.Name + '\');" height="40" width="40"></td>\n' +
										'\t      <td id="status">' + item.Rain + ' mm';
										if (typeof item.RainRate != 'undefined') {
											if (item.RainRate!=0) {
												xhtm+=', Rate: ' + item.RainRate + ' mm/h';
											}
										}
									}
									else if (typeof item.Visibility != 'undefined') {
										xhtm+='visibility48.png" class="lcursor" onclick="ShowGeneralGraph(\'#dashcontent\',\'ShowFavorites\',' + item.idx + ',\'' + item.Name+ '\',' + item.SwitchTypeVal +', \'Visibility\');" height="40" width="40"></td>\n' +
										'\t      <td id="status">' + item.Data;
									}
									else if (typeof item.UVI != 'undefined') {
										xhtm+='uv48.png" class="lcursor" onclick="ShowUVLog(\'#dashcontent\',\'ShowFavorites\',' + item.idx + ',\'' + item.Name + '\');" height="40" width="40"></td>\n' +
										'\t      <td id="status">' + item.UVI + ' UVI';
										if (typeof item.Temp!= 'undefined') {
											xhtm+=', Temp: ' + item.Temp + '&deg; ' + $.myglobals.tempsign;
										}
									}
									else if (typeof item.Radiation != 'undefined') {
										xhtm+='radiation48.png" class="lcursor" onclick="ShowGeneralGraph(\'#dashcontent\',\'ShowFavorites\',' + item.idx + ',\'' + item.Name+ '\',' + item.SwitchTypeVal +', \'Radiation\');" height="40" width="40"></td>\n' +
										'\t      <td id="status">' + item.Data;
									}
									else if (typeof item.Direction != 'undefined') {
										xhtm+='Wind' + item.DirectionStr + '.png" class="lcursor" onclick="ShowWindLog(\'#dashcontent\',\'ShowFavorites\',' + item.idx + ',\'' + item.Name + '\');" height="40" width="40"></td>\n' +
										'\t      <td id="status">' + item.Direction + ' ' + item.DirectionStr;
										if (typeof item.Speed != 'undefined') {
											xhtm+=', ' + $.i18n('Speed') + ': ' + item.Speed + ' ' + $.myglobals.windsign;
										}
										if (typeof item.Gust != 'undefined') {
											xhtm+=', ' + $.i18n('Gust') + ': ' + item.Gust + ' ' + $.myglobals.windsign;
										}
										xhtm+='<br>\n';
										if (typeof item.Temp != 'undefined') {
											xhtm+=$.i18n('Temp') + ': ' + item.Temp + '&deg; ' + $.myglobals.tempsign;
										}
										if (typeof item.Chill != 'undefined') {
											if (typeof item.Temp != 'undefined') {
												xhtm+=', ';
											}
											xhtm+=$.i18n('Chill') + ': ' + item.Chill + '&deg; ' + $.myglobals.tempsign;
										}
									}
									else if (typeof item.Barometer != 'undefined') {
										xhtm+='baro48.png" class="lcursor" onclick="ShowBaroLog(\'#dashcontent\',\'ShowFavorites\',' + item.idx + ',\'' + item.Name + '\');" height="40" width="40"></td>\n' +
										'\t      <td id="status">' + item.Barometer + ' hPa';
										if (typeof item.ForecastStr != 'undefined') {
											xhtm+=', ' + $.i18n('Prediction') + ': ' + $.i18n(item.ForecastStr);
										}
										if (typeof item.Altitude != 'undefined') {
											xhtm+=', Altitude: ' + item.Altitude + ' meter';
										}
									}
									xhtm+=
											'</td>\n' +
											'\t      <td id="lastupdate">' + item.LastUpdate + '</td>\n' +
									'\t    </tr>\n' +
									'\t    </table>\n' +
									'\t  </section>\n' +
									'\t</div>\n';
								}
					htmlcontent+=xhtm;
					jj+=1;
				  }
				}); //weather devices
				if (bHaveAddedDevider == true) {
				  //close previous devider
				  htmlcontent+='</div>\n';
				}
				if (($.DashboardType==2)||(window.myglobals.ismobile==true)) {
							htmlcontent+='\t    </table>\n';
				}

				//security devices
				jj=0;
				bHaveAddedDevider = false;
				$.each(data.result, function(i,item){
				  if ((item.Type.indexOf('Security') == 0)&&(item.Favorite!=0))
				  {
					totdevices+=1;
					if (jj == 0)
					{
					  //first time
					  if (($.DashboardType==2)||(window.myglobals.ismobile==true)) {
										if (htmlcontent!="") {
											htmlcontent+='<br>';
										}
										htmlcontent+='\t    <table class="mobileitem">\n';
										htmlcontent+='\t    <thead>\n';
										htmlcontent+='\t    <tr>\n';
										htmlcontent+='\t    		<th>' + $.i18n('Security Devices') + '</th>\n';
										htmlcontent+='\t    		<th style="text-align:right"><a id="cLightSwitches" href="javascript:SwitchLayout(\'LightSwitches\')"><img src="images/next.png"></a></th>\n';
										htmlcontent+='\t    </tr>\n';
										htmlcontent+='\t    </thead>\n';
					  }
					  else {
										htmlcontent+='<h2>' + $.i18n('Security Devices') + ':</h2>\n';
									}
					}
					if (jj % rowItems == 0)
					{
					  //add devider
					  if (bHaveAddedDevider == true) {
						//close previous devider
						htmlcontent+='</div>\n';
					  }
					  htmlcontent+='<div class="row divider">\n';
					  bHaveAddedDevider=true;
					}
					var xhtm="";
								if (($.DashboardType==2)||(window.myglobals.ismobile==true)) {
									xhtm+=
											'\t    <tr id="security_' + item.idx +'">\n' +
											'\t      <td id="name">' + item.Name + '</td>\n';
									var status=TranslateStatus(item.Status);
									
									xhtm+='\t      <td id="status">';
									xhtm+=status;
									if (item.SubType=="Security Panel") {
										xhtm+=' <a href="secpanel/"><img src="images/security48.png" class="lcursor" height="16" width="16"></a>';
									}
									else if (item.SubType.indexOf('remote') > 0) {
										if ((item.Status.indexOf('Arm') >= 0)||(item.Status.indexOf('Panic') >= 0)) {
											xhtm+=' <img src="images/remote.png" title="' + $.i18n("Turn Alarm Off") + '" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="16" width="16">';
										}
										else {
											xhtm+=' <img src="images/remote.png" title="' + $.i18n("Turn Alarm On") + '" onclick="ArmSystem(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="16" width="16">';
										}
									}
									
									xhtm+='</td>\n\t    </tr>\n';
								}
								else {
									if ($.DashboardType==0) {
										xhtm='\t<div class="span4 movable" id="security_' + item.idx +'">\n';
									}
									else if ($.DashboardType==1) {
										xhtm='\t<div class="span3 movable" id="security_' + item.idx +'">\n';
									}
									xhtm+='\t  <section>\n';
									if ($.DashboardType==0) {
												xhtm+='\t    <table id="itemtablesmall" border="0" cellpadding="0" cellspacing="0">\n';
									}
									else if ($.DashboardType==1) {
												xhtm+='\t    <table id="itemtablesmall" border="0" cellpadding="0" cellspacing="0">\n';
									}
									var nbackcolor="#D4E1EE";
									if (item.Protected==true) {
										nbackcolor="#A4B1EE";
									}
									
									xhtm+=
												'\t    <tr>\n' +
												'\t      <td id="name" style="background-color: ' + nbackcolor + ';">' + item.Name + '</td>\n' +
												'\t      <td id="bigtext"></td>\n';

									if (item.SubType=="Security Panel") {
										xhtm+='\t      <td id="img"><a href="secpanel/"><img src="images/security48.png" class="lcursor" height="40" width="40"></a></td>\n';
									}
									else if (item.SubType.indexOf('remote') > 0) {
										if ((item.Status.indexOf('Arm') >= 0)||(item.Status.indexOf('Panic') >= 0)) {
											xhtm+='\t      <td id="img"><img src="images/remote48.png" title="' + $.i18n("Turn Alarm Off") + '" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
										}
										else {
											xhtm+='\t      <td id="img"><img src="images/remote48.png" title="' + $.i18n("Turn Alarm On") + '" onclick="ArmSystem(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
										}
									}
									else if (item.SwitchType == "Smoke Detector") {
											if (
													(item.Status == "Panic")||
													(item.Status == "On")
												 ) {
													xhtm+='\t      <td id="img"><img src="images/smoke48on.png" height="40" width="40"></td>\n';
											}
											else {
													xhtm+='\t      <td id="img"><img src="images/smoke48off.png" height="40" width="40"></td>\n';
											}
									}
									else if (item.SubType == "X10 security") {
										if (item.Status.indexOf('Normal') >= 0) {
											xhtm+='\t      <td id="img"><img src="images/security48.png" title="' + $.i18n("Turn Alarm On") + '" onclick="SwitchLight(' + item.idx + ',\'' + ((item.Status == "Normal Delayed")?"Alarm Delayed":"Alarm") + '\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
										}
										else {
											xhtm+='\t      <td id="img"><img src="images/Alarm48_On.png" title="' + $.i18n("Turn Alarm Off") + '" onclick="SwitchLight(' + item.idx + ',\'' + ((item.Status == "Alarm Delayed")?"Normal Delayed":"Normal") + '\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
										}
									}
									else if (item.SubType == "X10 security motion") {
										if ((item.Status == "No Motion")) {
											xhtm+='\t      <td id="img"><img src="images/security48.png" title="' + $.i18n("Turn Alarm On") + '" onclick="SwitchLight(' + item.idx + ',\'Motion\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
										}
										else {
											xhtm+='\t      <td id="img"><img src="images/Alarm48_On.png" title="' + $.i18n("Turn Alarm Off") + '" onclick="SwitchLight(' + item.idx + ',\'No Motion\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
										}
									}
									else if ((item.Status.indexOf('Alarm') >= 0)||(item.Status.indexOf('Tamper') >= 0)) {
										xhtm+='\t      <td id="img"><img src="images/Alarm48_On.png" height="40" width="40"></td>\n';
									}
									else if (item.SubType.indexOf('Meiantech') >= 0) {
										if ((item.Status.indexOf('Arm') >= 0)||(item.Status.indexOf('Panic') >= 0)) {
											xhtm+='\t      <td id="img"><img src="images/security48.png" title="' + $.i18n("Turn Alarm Off") + '" onclick="SwitchLight(' + item.idx + ',\'Off\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
										}
										else {
											xhtm+='\t      <td id="img"><img src="images/security48.png" title="' + $.i18n("Turn Alarm On") + '" onclick="ArmSystemMeiantech(' + item.idx + ',\'On\',RefreshFavorites,' + item.Protected +');" class="lcursor" height="40" width="40"></td>\n';
										}
									}
									else {
										xhtm+='\t      <td id="img"><img src="images/security48.png" height="40" width="40"></td>\n';
									}
									xhtm+=
												'\t      <td id="status">' + TranslateStatus(item.Status) + '</td>\n' +
												'\t      <td id="lastupdate">' + item.LastUpdate + '</td>\n' +
												'\t    </tr>\n' +
												'\t    </table>\n' +
												'\t  </section>\n' +
												'\t</div>\n';
								}
					htmlcontent+=xhtm;
					jj+=1;
				  }
				}); //security devices
				if (bHaveAddedDevider == true) {
				  //close previous devider
				  htmlcontent+='</div>\n';
				}
				if (($.DashboardType==2)||(window.myglobals.ismobile==true)) {
							htmlcontent+='\t    </table>\n';
				}
				
				//Utility Sensors
				jj=0;
				bHaveAddedDevider = false;
				$.each(data.result, function(i,item){
				  if (
						( 
							(typeof item.Counter != 'undefined') || 
							(item.Type == "Current") || 
							(item.Type == "Energy") || 
							(item.Type == "Current/Energy") || 
							(item.Type == "Air Quality") || 
							(item.Type == "Lux") || 
							(item.Type == "Weight") || 
							(item.Type == "Usage")||
							(item.SubType == "Percentage")||	
							(item.Type == "Fan")||						
							((item.Type == "Thermostat")&&(item.SubType=="SetPoint"))||
							(item.SubType=="Soil Moisture")||
							(item.SubType=="Leaf Wetness")||
							(item.SubType=="Voltage")||
							(item.SubType=="Text")||
							(item.SubType=="Pressure")||
							(item.SubType=="A/D")
						) &&
						(item.Favorite!=0)
					  )
				  {
					totdevices+=1;
					if (jj == 0)
					{
					  //first time
					  if (($.DashboardType==2)||(window.myglobals.ismobile==true)) {
										if (htmlcontent!="") {
											htmlcontent+='<br>';
										}
										htmlcontent+='\t    <table class="mobileitem">\n';
										htmlcontent+='\t    <thead>\n';
										htmlcontent+='\t    <tr>\n';
										htmlcontent+='\t    		<th>' + $.i18n('Utility Sensors') + '</th>\n';
										htmlcontent+='\t    		<th style="text-align:right"><a id="cUtility" href="javascript:SwitchLayout(\'Utility\')"><img src="images/next.png"></a></th>\n';
										htmlcontent+='\t    </tr>\n';
										htmlcontent+='\t    </thead>\n';
					  }
					  else {
										htmlcontent+='<h2>' + $.i18n('Utility Sensors') + ':</h2>\n';
									}
					}
					if (jj % rowItems == 0)
					{
					  //add devider
					  if (bHaveAddedDevider == true) {
						//close previous devider
						htmlcontent+='</div>\n';
					  }
					  htmlcontent+='<div class="row divider">\n';
					  bHaveAddedDevider=true;
					}
					var xhtm="";
					if (($.DashboardType==2)||(window.myglobals.ismobile==true)) {
						xhtm+=
								'\t    <tr id="utility_' + item.idx +'">\n' +
								'\t      <td id="name">' + item.Name + '</td>\n';
						var status="";
						if (typeof item.Counter != 'undefined') {
							if ($.DashboardType==0) {
								status='' + $.i18n("Usage") + ': ' + item.CounterToday;
							}
							else {
								status='U: T: ' + item.CounterToday;
							}
						}
						else if ((item.Type == "Current") || (item.Type == "Current/Energy")){
							status=item.Data;
						}
						else if (
									(item.Type == "Energy")||
									(item.Type == "Air Quality")||
									(item.Type == "Lux")||
									(item.Type == "Weight")||
									(item.Type == "Usage")||
									(item.SubType == "Percentage")||
									(item.Type == "Fan")||
									(item.SubType=="Soil Moisture")||
									(item.SubType=="Leaf Wetness")||
									(item.SubType=="Voltage")||
									(item.SubType=="Text")||
									(item.SubType=="Pressure")||
									(item.SubType=="A/D")
								) {
							status=item.Data;
						}
						else if ((item.Type == "Thermostat")&&(item.SubType=="SetPoint")) {
							status=item.Data + '\u00B0 ' + $.myglobals.tempsign;
						}
						if (typeof item.Usage != 'undefined') {
							if ($.DashboardType==0) {
								status+='<br>' + $.i18n("Actual") + ': ' + item.Usage;
							}
							else {
								status+=", A: " + item.Usage;
							}
						}
						if (typeof item.CounterDeliv != 'undefined') {
							if (item.CounterDeliv!=0) {
								if ($.DashboardType==0) {
									status+='<br>' + $.i18n("Return") + ': ' + item.CounterDelivToday;
									status+='<br>' + $.i18n("Actual") + ': ' + item.UsageDeliv;
								}
								else {
									status+='T: ' + item.CounterDelivToday;
									status+=", A: " + item.UsageDeliv;
								}
							}
						}
						xhtm+=
									'\t      <td id="status">' + status + '</td>\n' +
									'\t    </tr>\n';
					}
					else {
						if ($.DashboardType==0) {
							xhtm='\t<div class="span4 movable" id="utility_' + item.idx +'">\n';
						}
						else if ($.DashboardType==1) {
							xhtm='\t<div class="span3 movable" id="utility_' + item.idx +'">\n';
						}
						xhtm+='\t  <span>\n';
						xhtm+='\t    <table id="itemtablesmall" border="0" cellpadding="0" cellspacing="0">\n';
						xhtm+='\t    <tr>\n';
						var nbackcolor="#D4E1EE";
						if (item.HaveTimeout==true) {
							nbackcolor="#DF2D3A";
						}
						else {
							var BatteryLevel=parseInt(item.BatteryLevel);
							if (BatteryLevel!=255) {
								if (BatteryLevel<=10) {
									nbackcolor="#DDDF2D";
								}
							}
						}
						xhtm+='\t      <td id="name" style="background-color: ' + nbackcolor + ';">' + item.Name + '</td>\n';
						xhtm+='\t      <td id="bigtext">';
						if ((typeof item.Usage != 'undefined') && (typeof item.UsageDeliv == 'undefined')) {
							xhtm+=item.Usage;
						}
						else if ((typeof item.Usage != 'undefined') && (typeof item.UsageDeliv != 'undefined')) {
							if (item.Usage.charAt(0) != 0) {
								xhtm+=item.Usage;
							}
							if (item.UsageDeliv.charAt(0) != 0) {
								xhtm+='-' + item.UsageDeliv;
							}
						}
						else if ((item.SubType == "Gas")||(item.SubType == "RFXMeter counter")) {
						  xhtm+=item.CounterToday;
						}
						else if (
								(item.Type == "Air Quality")||
								(item.Type == "Lux")||
								(item.Type == "Weight")||
								(item.Type == "Usage")||
								(item.SubType == "Percentage")||
								(item.Type == "Fan")||
								(item.SubType=="Soil Moisture")||
								(item.SubType=="Leaf Wetness")||
								(item.SubType=="Voltage")||
								(item.SubType=="Pressure")||
								(item.SubType=="A/D")
							) {
							xhtm+=item.Data;
						}
						else if ((item.Type == "Thermostat")&&(item.SubType=="SetPoint")) {
							xhtm+=item.Data + '\u00B0 ' + $.myglobals.tempsign;
						}
						xhtm+='</td>\n';
						xhtm+='\t      <td id="img"><img src="images/';
						var status="";
						if (typeof item.Counter != 'undefined') {
							if ((item.Type == "P1 Smart Meter")&&(item.SubType=="Energy")) {
								xhtm+='counter.png" class="lcursor" onclick="ShowSmartLog(\'#dashcontent\',\'ShowFavorites\',' + item.idx + ',\'' + item.Name + '\', ' + item.SwitchTypeVal + ');" height="40" width="40"></td>\n';
							}
							else {
								xhtm+='counter.png" class="lcursor" onclick="ShowCounterLog(\'#dashcontent\',\'ShowFavorites\',' + item.idx + ',\'' + item.Name + '\', ' + item.SwitchTypeVal + ');" height="40" width="40"></td>\n';
							}
							if ((item.SubType!="Gas")&&(item.SubType != "RFXMeter counter")) {
								status='' + $.i18n("Usage") + ': ' + item.CounterToday;
							}
							else {
								status="&nbsp;";
							}
						}
						else if ((item.Type == "Current") || (item.Type == "Current/Energy")) {
							xhtm+='current48.png" class="lcursor" onclick="ShowCurrentLog(\'#dashcontent\',\'ShowFavorites\',' + item.idx + ',\'' + item.Name + '\', ' + item.displaytype + ');" height="40" width="40"></td>\n';
							status=item.Data;
						}
						else if (item.Type == "Energy") {
							xhtm+='current48.png" class="lcursor" onclick="ShowCounterLogSpline(\'#dashcontent\',\'ShowFavorites\',' + item.idx + ',\'' + item.Name + '\', ' + item.SwitchTypeVal + ');" height="40" width="40"></td>\n';
							status=item.Data;
						}
						else if (item.Type == "Air Quality") {
							xhtm+='air48.png" class="lcursor" onclick="ShowAirQualityLog(\'#dashcontent\',\'ShowFavorites\',' + item.idx + ',\'' + item.Name + '\');" height="40" width="40"></td>\n';
							status=item.Data + " (" + item.Quality + ")";
						}
						else if (item.SubType == "Percentage") {
							xhtm+='Percentage48.png" class="lcursor" onclick="ShowPercentageLog(\'#dashcontent\',\'ShowFavorites\',' + item.idx + ',\'' + item.Name + '\');" height="40" width="40"></td>\n';
							status=item.Data;
						}
						else if (item.Type == "Fan") {
							xhtm+='Fan48_On.png" class="lcursor" onclick="ShowFanLog(\'#dashcontent\',\'ShowFavorites\',' + item.idx + ',\'' + item.Name + '\');" height="40" width="40"></td>\n';
							status=item.Data;
						}				
						else if (item.Type == "Lux") {
							xhtm+='lux48.png" class="lcursor" onclick="ShowLuxLog(\'#dashcontent\',\'ShowFavorites\',' + item.idx + ',\'' + item.Name + '\', ' + item.SwitchTypeVal + ');" height="40" width="40"></td>\n';
							status=item.Data;
						}
						else if (item.Type == "Weight") {
							xhtm+='scale48.png" height="40" width="40"></td>\n';
							status=item.Data;
						}
						else if (item.Type == "Usage") {
							xhtm+='current48.png" class="lcursor" onclick="ShowUsageLog(\'#dashcontent\',\'ShowFavorites\',' + item.idx + ',\'' + item.Name + '\', ' + item.SwitchTypeVal + ');" height="40" width="40"></td>\n';
							status=item.Data;
						}
						else if (item.SubType=="Soil Moisture") {
							xhtm+='moisture48.png" height="40" width="40"></td>\n';
							status=item.Data;
						}
						else if (item.SubType=="Leaf Wetness") {
							xhtm+='leaf48.png" height="40" width="40"></td>\n';
							status=item.Data;
						}
						else if ((item.SubType=="Voltage")||(item.SubType=="A/D")) {
							xhtm+='current48.png" class="lcursor" onclick="ShowGeneralGraph(\'#dashcontent\',\'ShowFavorites\',' + item.idx + ',\'' + item.Name+ '\',' + item.SwitchTypeVal +', \'' + item.SubType + '\');" height="40" width="40"></td>\n';
							status=item.Data;
						}
						else if (item.SubType=="Text") {
							xhtm+='text48.png" height="40" width="40"></td>\n';
							status=item.Data;
						}
						else if (item.SubType=="Pressure") {
							xhtm+='gauge48.png" class="lcursor" onclick="ShowGeneralGraph(\'#dashcontent\',\'ShowFavorites\',' + item.idx + ',\'' + item.Name+ '\',' + item.SwitchTypeVal +', \'' + item.SubType + '\');" height="40" width="40"></td>\n';
							status=item.Data;
						}
						else if ((item.Type == "Thermostat")&&(item.SubType=="SetPoint")) {
							xhtm+='override.png" class="lcursor" onclick="ShowTempLog(\'#dashcontent\',\'ShowFavorites\',' + item.idx + ',\'' + item.Name + '\');" height="40" width="40"></td>\n';
							status=item.Data + '\u00B0 ' + $.myglobals.tempsign;
						}
						
						if (typeof item.Usage != 'undefined') {
							if (item.Type!="P1 Smart Meter") {
								if ($.DashboardType==0) {
									//status+='<br>' + $.i18n("Actual") + ': ' + item.Usage;
									if (typeof item.CounterToday != 'undefined') {
										status+='<br>' + $.i18n("Today") + ': ' + item.CounterToday;
									}
								}
								else {
									//status+=", A: " + item.Usage;
									if (typeof item.CounterToday != 'undefined') {
										status+=', T: ' + item.CounterToday;
									}
								}
							}
						}
						if (typeof item.CounterDeliv != 'undefined') {
							if (item.CounterDeliv!=0) {
								status+='<br>';
								status+='' + $.i18n("Return") + ': ' + item.CounterDelivToday;
							}
						}
						
						xhtm+=
								'\t      <td id="status">' + status + '</td>\n' +
								'\t      <td id="lastupdate">' + item.LastUpdate + '</td>\n' +
						'\t    </tr>\n' +
						'\t    </table>\n' +
						'\t  </span>\n' +
						'\t</div>\n';
					}
					htmlcontent+=xhtm;
					jj+=1;
				  }
				}); //Utility devices
				if (bHaveAddedDevider == true) {
				  //close previous devider
				  htmlcontent+='</div>\n';
				}
				if (($.DashboardType==2)||(window.myglobals.ismobile==true)) {
							htmlcontent+='\t    </table>\n';
				}

			  }
			 }
		  });

			if (htmlcontent == "")
			{
				htmlcontent='<h2>' + 
					$.i18n('No favorite devices defined ... (Or communication Lost!)') + 
					'</h2><br>\n' +
					$.i18n('If this is your first time here, please setup your') + ' <a href="javascript:SwitchLayout(\'Hardware\')" data-idx="Hardware">Hardware</a>, ' +
					$.i18n('and add some') + ' <a href="javascript:SwitchLayout(\'Devices\')" data-idx="Devices">Devices</a>.';
			}
			else {
				htmlcontent+="<br>";
			}
			
			var suntext="";
			if (bShowRoomplan==false) {
				suntext='<div id="timesun" /><br>\n';
			}
			else {
				suntext=
					'<div>'+
					'<table border="0" cellpadding="0" cellspacing="0" width="100%">'+
					'<tr>'+
						'<td align="left" id="timesun"></td>'+
						'<td align="right">'+
						'<span data-i18n="Room">Room</span>:&nbsp;<select id="comboroom" style="width:160px" class="combobox ui-corner-all">'+
						'<option value="0" data-i18n="All">All</option>'+
						'</select>'+
						'</td>'+
					'</tr>'+
					'</table>'+
					'</div><br>';
			}
				
			
			$('#dashcontent').html(suntext+htmlcontent);
			$('#dashcontent').i18n();

			if (bShowRoomplan==true) {
				$.each($.RoomPlans, function(i,item){
					var option = $('<option />');
					option.attr('value', item.idx).text(item.name);
					$("#dashcontent #comboroom").append(option);
				});
				if (typeof window.myglobals.LastPlanSelected!= 'undefined') {
					$("#dashcontent #comboroom").val(window.myglobals.LastPlanSelected);
				}
				$("#dashcontent #comboroom").change(function() { 
					var idx = $("#dashcontent #comboroom option:selected").val();
					window.myglobals.LastPlanSelected=idx;
					ShowFavorites();
				});
			}

			
				// Store variables
				var accordion_head = $('#dashcontent .accordion > li > a'),
					accordion_body = $('#dashcontent .accordion li > .sub-menu');
		 
				// Open the first tab on load
				accordion_head.first().addClass('active').next().slideDown('normal');
		 
				// Click function
				accordion_head.on('click', function(event) {
					// Disable header links
					event.preventDefault();
		 
					// Show and hide the tabs on click
					if ($(this).attr('class') != 'active'){
						accordion_body.slideUp('normal');
						$(this).next().stop(true,true).slideToggle('normal');
						accordion_head.removeClass('active');
						$(this).addClass('active');
					}
				});

			$rootScope.RefreshTimeAndSun();
			
			//Create Dimmer Sliders
			$('#dashcontent .dimslider').slider({
				//Config
				range: "min",
				min: 1,
				max: 16,
				value: 5,

				//Slider Events
				create: function(event,ui ) {
					$( this ).slider( "option", "max", $( this ).data('maxlevel'));
					$( this ).slider( "option", "type", $( this ).data('type'));
					$( this ).slider( "option", "isprotected", $( this ).data('isprotected'));
					$( this ).slider( "value", $( this ).data('svalue')+1 );
				},
				slide: function(event, ui) { //When the slider is sliding
					clearInterval($.setDimValue);
					var maxValue=$( this ).slider( "option", "max");
					var dtype=$( this ).slider( "option", "type");
					var isProtected=$( this ).slider( "option", "isprotected");
					var fPercentage=0;
					if (ui.value!=1) {
						fPercentage=parseInt((100.0/(maxValue-1))*((ui.value-1)));
					}
					var idx=$( this ).data('idx');
					id="#dashcontent #light_" + idx;
					var obj=$(id);
					if (typeof obj != 'undefined') {
						var img="";
						var status="";
						var TxtOn="On";
						var TxtOff="Off";
						if (dtype=="blinds") {
							TxtOn="Open";
							TxtOff="Close";
						}
						if (($.myglobals.DashboardType==2)||(window.myglobals.ismobile==true)) {
							if (fPercentage==0)
							{
								status='<button class="btn btn-mini" type="button">' + $.i18n(TxtOn) +'</button> ' +
									'<button class="btn btn-mini btn-info" type="button">' + $.i18n(TxtOff) +'</button>';
							}
							else {
								status='<button class="btn btn-mini btn-info" type="button">' + $.i18n(TxtOn) +': ' + fPercentage + "% </button> " +
									'<button class="btn btn-mini" type="button">' + $.i18n(TxtOff) +'</button>';
							}
							if ($(id + " #status").html()!=status) {
								$(id + " #status").html(status);
							}
						}
						else {
							if (fPercentage==0)
							{
								img='<img src="images/dimmer48-off.png" title="' + $.i18n("Turn On") +'" onclick="SwitchLight(' + idx + ',\'On\',RefreshFavorites,' + isProtected +');" class="lcursor" height="40" width="40">';
								status="Off";
							}
							else {
								img='<img src="images/dimmer48-on.png" title="' + $.i18n("Turn Off") +'" onclick="SwitchLight(' + idx + ',\'Off\',RefreshFavorites,' + isProtected +');" class="lcursor" height="40" width="40">';
								status='' + $.i18n("Set Level") +': ' + fPercentage + " %";
							}
							if (dtype!="blinds") {
								if ($(id + " #img").html()!=img) {
									$(id + " #img").html(img);
								}
							}
							if ($(id + " #status").html()!=status) {
								$(id + " #status").html(status);
							}
						}
					}
					$.setDimValue = setInterval(function() { SetDimValue(idx,ui.value); }, 500);
				}
			});
			ResizeDimSliders();

			var bAllowReorder=bAllowWidgetReorder;
			if (bAllowReorder==true) {
				if (permissions.hasPermission("Admin")) {
					if (window.myglobals.ismobileint==false) {
						$("#dashcontent .movable").draggable({
								drag: function() {
									if (typeof $scope.mytimer != 'undefined') {
										$interval.cancel($scope.mytimer);
										$scope.mytimer = undefined;
									}
									$.devIdx=$(this).attr("id");
									$(this).css("z-index", 2);
								},
								revert: true
						});
						$("#dashcontent .movable").droppable({
								drop: function() {
									var myid=$(this).attr("id");
									var parts1 = myid.split('_');
									var parts2 = $.devIdx.split('_');
									if (parts1[0]!=parts2[0]) {
										bootbox.alert($.i18n('Only possible between Sensors of the same kind!'));
										$scope.mytimer=$interval(function() {
											ShowFavorites();
										}, 10000);
									} else {
										var roomid=0;
										if (typeof window.myglobals.LastPlanSelected!= 'undefined') {
											roomid=window.myglobals.LastPlanSelected;
										}
										$.ajax({
											 url: "json.htm?type=command&param=switchdeviceorder&idx1=" + parts1[1] + "&idx2=" + parts2[1] + "&roomid=" + roomid,
											 async: false, 
											 dataType: 'json',
											 success: function(data) {
													ShowFavorites();
											 }
										});
									}
								}
						});
					}
				}
			}
			$scope.mytimer=$interval(function() {
				RefreshFavorites();
			}, 10000);
		}

		ResizeDimSliders = function()
		{
			var width=$(".span4").width()-70;
			$("#dashcontent .span4 .dimslidernorm").width(width);
			width=$(".span3").width()-70;
			$("#dashcontent .span3 .dimslidernorm").width(width);
			width=$(".mobileitem").width()-63;
			$("#dashcontent .mobileitem .dimslidernorm").width(width);

			width=$(".span4").width()-118;
			$("#dashcontent .span4 .dimslidersmall").width(width);
			width=$(".span3").width()-112;
			$("#dashcontent .span3 .dimslidersmall").width(width);
			width=$(".mobileitem").width()-63;
			$("#dashcontent .mobileitem .dimslidersmall").width(width);
		}
		
		init();

		function init()
		{
			$(window).resize(function() { ResizeDimSliders(); });
			$scope.LastUpdateTime=parseInt(0);
			ShowFavorites();
		};
		
		$scope.$on('$destroy', function(){
			if (typeof $scope.mytimer != 'undefined') {
				$interval.cancel($scope.mytimer);
				$scope.mytimer = undefined;
			}
		}); 
		
	} ]);
});