define(['app'], function (app) {
	app.controller('UtilityController', [ '$scope', '$rootScope', '$location', '$http', '$interval', 'permissions', function($scope,$rootScope,$location,$http,$interval,permissions) {

		DeleteSetpointTimer = function(idx)
		{
			bootbox.confirm($.i18n("Are you sure to delete this timers?\n\nThis action can not be undone..."), function(result) {
				if (result==true) {
					$.ajax({
						 url: "json.htm?type=command&param=deletesetpointtimer&idx=" + idx,
						 async: false, 
						 dataType: 'json',
						 success: function(data) {
							RefreshSetpointTimerTable($.devIdx);
						 },
						 error: function(){
								HideNotify();
								ShowNotify($.i18n('Problem deleting timer!'), 2500, true);
						 }     
					});
				}
			});
		}

		ClearSetpointTimers = function()
		{
			bootbox.confirm($.i18n("Are you sure to delete ALL timers?\n\nThis action can not be undone!"), function(result) {
				if (result==true) {
					$.ajax({
						 url: "json.htm?type=command&param=clearsetpointtimers&idx=" + $.devIdx,
						 async: false, 
						 dataType: 'json',
						 success: function(data) {
							RefreshSetpointTimerTable($.devIdx);
						 },
						 error: function(){
								HideNotify();
								ShowNotify($.i18n('Problem clearing timers!'), 2500, true);
						 }     
					});
				}
			});
		}

		GetSetpointTimerSettings = function()
		{
			var tsettings = {};
			tsettings.Active=$('#utilitycontent #timerparamstable #enabled').is(":checked");
			tsettings.timertype=$("#utilitycontent #timerparamstable #combotype").val();
			tsettings.date=$("#utilitycontent #timerparamstable #sdate").val();
			tsettings.hour=$("#utilitycontent #timerparamstable #combotimehour").val();
			tsettings.min=$("#utilitycontent #timerparamstable #combotimemin").val();
			tsettings.tvalue=$('#utilitycontent #timerparamstable #tvalue').val();
			tsettings.days=0;
			var everyday=$("#utilitycontent #timerparamstable #when_1").is(":checked");
			var weekdays=$("#utilitycontent #timerparamstable #when_2").is(":checked");
			var weekends=$("#utilitycontent #timerparamstable #when_3").is(":checked");
			if (everyday==true)
				tsettings.days=0x80;
			else if (weekdays==true)
				tsettings.days=0x100;
			else if (weekends==true)
				tsettings.days=0x200;
			else {
				if ($('#utilitycontent #timerparamstable #ChkMon').is(":checked"))
					tsettings.days|=0x01;
				if ($('#utilitycontent #timerparamstable #ChkTue').is(":checked"))
					tsettings.days|=0x02;
				if ($('#utilitycontent #timerparamstable #ChkWed').is(":checked"))
					tsettings.days|=0x04;
				if ($('#utilitycontent #timerparamstable #ChkThu').is(":checked"))
					tsettings.days|=0x08;
				if ($('#utilitycontent #timerparamstable #ChkFri').is(":checked"))
					tsettings.days|=0x10;
				if ($('#utilitycontent #timerparamstable #ChkSat').is(":checked"))
					tsettings.days|=0x20;
				if ($('#utilitycontent #timerparamstable #ChkSun').is(":checked"))
					tsettings.days|=0x40;
			}
			return tsettings;
		}

		UpdateSetpointTimer = function(idx)
		{
			var tsettings=GetSetpointTimerSettings();
			if (tsettings.timertype==5) {
				if (tsettings.date=="") {
					ShowNotify($.i18n('Please select a Date!'), 2500, true);
					return;
				}
				//Check if date/time is valid
				var pickedDate = $("#utilitycontent #timerparamstable #sdate").datepicker( 'getDate' );
				var checkDate = new Date(pickedDate.getFullYear(), pickedDate.getMonth(), pickedDate.getDate(), tsettings.hour, tsettings.min, 0, 0);
				var nowDate = new Date();
				if (checkDate<nowDate) {
					ShowNotify($.i18n('Invalid Date selected!'), 2500, true);
					return;
				}
			}
			else if (tsettings.days==0)
			{
				ShowNotify($.i18n('Please select some days!'), 2500, true);
				return;
			}
			$.ajax({
				 url: "json.htm?type=command&param=updatesetpointtimer&idx=" + idx + 
							"&active=" + tsettings.Active + 
							"&timertype=" + tsettings.timertype +
							"&date=" + tsettings.date +
							"&hour=" + tsettings.hour +
							"&min=" + tsettings.min +
							"&tvalue=" + tsettings.tvalue +
							"&days=" + tsettings.days,
				 async: false, 
				 dataType: 'json',
				 success: function(data) {
					RefreshSetpointTimerTable($.devIdx);
				 },
				 error: function(){
						HideNotify();
						ShowNotify($.i18n('Problem updating timer!'), 2500, true);
				 }     
			});
		}

		AddSetpointTimer = function()
		{
			var tsettings=GetSetpointTimerSettings();
			if (tsettings.timertype==5) {
				if (tsettings.date=="") {
					ShowNotify($.i18n('Please select a Date!'), 2500, true);
					return;
				}
				//Check if date/time is valid
				var pickedDate = $("#utilitycontent #timerparamstable #sdate").datepicker( 'getDate' );
				var checkDate = new Date(pickedDate.getFullYear(), pickedDate.getMonth(), pickedDate.getDate(), tsettings.hour, tsettings.min, 0, 0);
				var nowDate = new Date();
				if (checkDate<nowDate) {
					ShowNotify($.i18n('Invalid Date selected!'), 2500, true);
					return;
				}
			}
			else if (tsettings.days==0)
			{
				ShowNotify($.i18n('Please select some days!'), 2500, true);
				return;
			}
			$.ajax({
				 url: "json.htm?type=command&param=addsetpointtimer&idx=" + $.devIdx + 
							"&active=" + tsettings.Active + 
							"&timertype=" + tsettings.timertype +
							"&date=" + tsettings.date +
							"&hour=" + tsettings.hour +
							"&min=" + tsettings.min +
							"&tvalue=" + tsettings.tvalue +
							"&days=" + tsettings.days,
				 async: false, 
				 dataType: 'json',
				 success: function(data) {
					RefreshSetpointTimerTable($.devIdx);
				 },
				 error: function(){
						HideNotify();
						ShowNotify($.i18n('Problem adding timer!'), 2500, true);
				 }     
			});
		}

		EnableDisableSetpointDays = function(TypeStr, bDisabled)
		{
				$('#utilitycontent #timerparamstable #ChkMon').prop('checked', ((TypeStr.indexOf("Mon") >= 0)||(TypeStr=="Everyday")||(TypeStr=="Weekdays")) ? true : false);
				$('#utilitycontent #timerparamstable #ChkTue').prop('checked', ((TypeStr.indexOf("Tue") >= 0)||(TypeStr=="Everyday")||(TypeStr=="Weekdays")) ? true : false);
				$('#utilitycontent #timerparamstable #ChkWed').prop('checked', ((TypeStr.indexOf("Wed") >= 0)||(TypeStr=="Everyday")||(TypeStr=="Weekdays")) ? true : false);
				$('#utilitycontent #timerparamstable #ChkThu').prop('checked', ((TypeStr.indexOf("Thu") >= 0)||(TypeStr=="Everyday")||(TypeStr=="Weekdays")) ? true : false);
				$('#utilitycontent #timerparamstable #ChkFri').prop('checked', ((TypeStr.indexOf("Fri") >= 0)||(TypeStr=="Everyday")||(TypeStr=="Weekdays")) ? true : false);
				$('#utilitycontent #timerparamstable #ChkSat').prop('checked', ((TypeStr.indexOf("Sat") >= 0)||(TypeStr=="Everyday")||(TypeStr=="Weekends")) ? true : false);
				$('#utilitycontent #timerparamstable #ChkSun').prop('checked', ((TypeStr.indexOf("Sun") >= 0)||(TypeStr=="Everyday")||(TypeStr=="Weekends")) ? true : false);

				$('#utilitycontent #timerparamstable #ChkMon').attr('disabled', bDisabled);
				$('#utilitycontent #timerparamstable #ChkTue').attr('disabled', bDisabled);
				$('#utilitycontent #timerparamstable #ChkWed').attr('disabled', bDisabled);
				$('#utilitycontent #timerparamstable #ChkThu').attr('disabled', bDisabled);
				$('#utilitycontent #timerparamstable #ChkFri').attr('disabled', bDisabled);
				$('#utilitycontent #timerparamstable #ChkSat').attr('disabled', bDisabled);
				$('#utilitycontent #timerparamstable #ChkSun').attr('disabled', bDisabled);
		}

		RefreshSetpointTimerTable = function(idx)
		{
		  $('#modal').show();

			$('#updelclr #timerupdate').attr("class", "btnstyle3-dis");
			$('#updelclr #timerdelete').attr("class", "btnstyle3-dis");

		  var oTable = $('#utilitycontent #setpointtimertable').dataTable();
		  oTable.fnClearTable();
		  
		  $.ajax({
			 url: "json.htm?type=setpointtimers&idx=" + idx, 
			 async: false, 
			 dataType: 'json',
			 success: function(data) {
				
			  if (typeof data.result != 'undefined') {
				$.each(data.result, function(i,item){
					var active="No";
					if (item.Active == "true") {
						active="Yes";
					}
					
					var DayStr = "";
					if (item.Type!=5) {
						var dayflags = parseInt(item.Days);
						if (dayflags & 0x80)
							DayStr="Everyday";
						else if (dayflags & 0x100)
							DayStr="Weekdays";
						else if (dayflags & 0x200)
							DayStr="Weekends";
						else {
							if (dayflags & 0x01) {
								if (DayStr!="") DayStr+=", ";
								DayStr+="Mon";
							}
							if (dayflags & 0x02) {
								if (DayStr!="") DayStr+=", ";
								DayStr+="Tue";
							}
							if (dayflags & 0x04) {
								if (DayStr!="") DayStr+=", ";
								DayStr+="Wed";
							}
							if (dayflags & 0x08) {
								if (DayStr!="") DayStr+=", ";
								DayStr+="Thu";
							}
							if (dayflags & 0x10) {
								if (DayStr!="") DayStr+=", ";
								DayStr+="Fri";
							}
							if (dayflags & 0x20) {
								if (DayStr!="") DayStr+=", ";
								DayStr+="Sat";
							}
							if (dayflags & 0x40) {
								if (DayStr!="") DayStr+=", ";
								DayStr+="Sun";
							}
						}
					}
					var rEnabled="No";
								
					var addId = oTable.fnAddData( {
						"DT_RowId": item.idx,
						"Temperature": item.Temperature,
						"TType": item.Type,
						"TTypeString": $.myglobals.TimerTypesStr[item.Type],
						"0": active,
						"1": $.myglobals.TimerTypesStr[item.Type],
						"2": item.Date,
						"3": item.Time,
						"4": item.Temperature,
						"5": DayStr
					} );
				});
			  }
			 }
		  });

			/* Add a click handler to the rows - this could be used as a callback */
			$("#utilitycontent #setpointtimertable tbody").off();
			$("#utilitycontent #setpointtimertable tbody").on( 'click', 'tr', function () {
				if ( $(this).hasClass('row_selected') ) {
						$(this).removeClass('row_selected');
						$('#updelclr #timerupdate').attr("class", "btnstyle3-dis");
						$('#updelclr #timerdelete').attr("class", "btnstyle3-dis");
				}
				else {
					var oTable = $('#utilitycontent #setpointtimertable').dataTable();
					oTable.$('tr.row_selected').removeClass('row_selected');
					$(this).addClass('row_selected');
					$('#updelclr #timerupdate').attr("class", "btnstyle3");
					$('#updelclr #timerdelete').attr("class", "btnstyle3");
					var anSelected = fnGetSelected( oTable );
					if ( anSelected.length !== 0 ) {
						var data = oTable.fnGetData( anSelected[0] );
						var idx= data["DT_RowId"];
						$.myglobals.SelectedTimerIdx=idx;
						$("#updelclr #timerupdate").attr("href", "javascript:UpdateSetpointTimer(" + idx + ")");
						$("#updelclr #timerdelete").attr("href", "javascript:DeleteSetpointTimer(" + idx + ")");
						//update user interface with the paramters of this row
						$('#utilitycontent #timerparamstable #enabled').prop('checked', (data["0"]=="Yes") ? true : false);
						$("#utilitycontent #timerparamstable #combotype").val(jQuery.inArray(data["TTypeString"], $.myglobals.TimerTypesStr));
						$("#utilitycontent #timerparamstable #combotimehour").val(parseInt(data["3"].substring(0,2)));
						$("#utilitycontent #timerparamstable #combotimemin").val(parseInt(data["3"].substring(3,5)));
						$("#utilitycontent #timerparamstable #tvalue").val(data["4"]);
						
						var timerType=data["TType"];
						if (timerType==5) {
							$("#utilitycontent #timerparamstable #sdate").val(data["2"]);
							$("#utilitycontent #timerparamstable #rdate").show();
							$("#utilitycontent #timerparamstable #rnorm").hide();
						}
						else {
							$("#utilitycontent #timerparamstable #rdate").hide();
							$("#utilitycontent #timerparamstable #rnorm").show();
						}
						
						var disableDays=false;
						if (data["6"]=="Everyday") {
							$("#utilitycontent #timerparamstable #when_1").prop('checked', 'checked');
							disableDays=true;
						}
						else if (data["6"]=="Weekdays") {
							$("#utilitycontent #timerparamstable #when_2").prop('checked', 'checked');
							disableDays=true;
						}
						else if (data["6"]=="Weekends") {
							$("#utilitycontent #timerparamstable #when_3").prop('checked', 'checked');
							disableDays=true;
						}
						else
							$("#utilitycontent #timerparamstable #when_4").prop('checked', 'checked');
							
						EnableDisableDays(data["6"],disableDays);
					}
				}
			}); 
		  
			$rootScope.RefreshTimeAndSun();
		  
			$('#modal').hide();
		}

		$.strPad = function(i,l,s) {
			var o = i.toString();
			if (!s) { s = '0'; }
			while (o.length < l) {
				o = s + o;
			}
			return o;
		};

		ShowSetpointTimers = function (id,name, isdimmer, stype,devsubtype)
		{
			if (typeof $scope.mytimer != 'undefined') {
				$interval.cancel($scope.mytimer);
				$scope.mytimer = undefined;
			}
			$.devIdx=id;
			$.isDimmer=isdimmer;
			
			var oTable;
			
			$('#modal').show();
			var htmlcontent = '';
			htmlcontent='<p><h2><span data-i18n="Name"></span>: ' + name + '</h2></p><br>\n';

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
		  
			var suntext='<div id="timesun" /><br>\n';
			htmlcontent+=suntext;
		  
			htmlcontent+=$('#editsetpointtimers').html();
			$('#utilitycontent').html(GetBackbuttonHTMLTable('ShowUtilities')+htmlcontent);
			$('#utilitycontent').i18n();
			$("#utilitycontent #timerparamstable #rdate").hide();
			$("#utilitycontent #timerparamstable #rnorm").show();

			$rootScope.RefreshTimeAndSun();

			var nowTemp = new Date();
			var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);
			
			$( "#utilitycontent #sdate" ).datepicker({
				minDate: now,
				defaultDate: now,
				dateFormat: "mm/dd/yy",
				showWeek: true,
				firstDay: 1
			});
			$("#utilitycontent #combotype").change(function() { 
				var timerType=$("#utilitycontent #combotype").val();
				if (timerType==5) {
					$("#utilitycontent #timerparamstable #rdate").show();
					$("#utilitycontent #timerparamstable #rnorm").hide();
				}
				else {
					$("#utilitycontent #timerparamstable #rdate").hide();
					$("#utilitycontent #timerparamstable #rnorm").show();
				}
			});

			oTable = $('#utilitycontent #setpointtimertable').dataTable( {
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
			$('#timerparamstable #combotimehour >option').remove();
			$('#timerparamstable #combotimemin >option').remove();
						
			//fill hour/minute comboboxes
			for (ii=0; ii<24; ii++)
			{
				$('#timerparamstable #combotimehour').append($('<option></option>').val(ii).html($.strPad(ii,2)));  
			}
			for (ii=0; ii<60; ii++)
			{
				$('#timerparamstable #combotimemin').append($('<option></option>').val(ii).html($.strPad(ii,2)));  
			}
		  
			$("#utilitycontent #timerparamstable #when_1").click(function() {
				EnableDisableSetpointDays("Everyday",true);
			});
			$("#utilitycontent #timerparamstable #when_2").click(function() {
				EnableDisableSetpointDays("Weekdays",true);
			});
			$("#utilitycontent #timerparamstable #when_3").click(function() {
				EnableDisableSetpointDays("Weekends",true);
			});
			$("#utilitycontent #timerparamstable #when_4").click(function() {
				EnableDisableSetpointDays("",false);
			});

			$("#utilitycontent #timerparamstable #combocommand").change(function() {
				var cval=$("#utilitycontent #timerparamstable #combocommand").val();
				var bShowLevel=false;
			});

			$('#modal').hide();
			RefreshSetpointTimerTable(id);
		}

		MakeFavorite = function(id,isfavorite)
		{
			if (!permissions.hasPermission("Admin")) {
				HideNotify();
				ShowNotify($.i18n('You do not have permission to do that!'), 2500, true);
				return;
			}

			if (typeof $scope.mytimer != 'undefined') {
				$interval.cancel($scope.mytimer);
				$scope.mytimer = undefined;
			}
		  $.ajax({
			 url: "json.htm?type=command&param=makefavorite&idx=" + id + "&isfavorite=" + isfavorite, 
			 async: false, 
			 dataType: 'json',
			 success: function(data) {
			  ShowUtilities();
			 }
		  });
		}

		EditUtilityDevice = function(idx,name)
		{
			if (typeof $scope.mytimer != 'undefined') {
				$interval.cancel($scope.mytimer);
				$scope.mytimer = undefined;
			}
		  $.devIdx=idx;
		  $("#dialog-editutilitydevice #devicename").val(name);
		  $( "#dialog-editutilitydevice" ).dialog( "open" );
		}

		EditMeterDevice = function(idx,name,switchtype)
		{
			if (typeof $scope.mytimer != 'undefined') {
				$interval.cancel($scope.mytimer);
				$scope.mytimer = undefined;
			}
		  $.devIdx=idx;
		  $("#dialog-editmeterdevice #devicename").val(name);
		  $("#dialog-editmeterdevice #combometertype").val(switchtype);
		  $("#dialog-editmeterdevice" ).dialog( "open" );
		}

		EditSetPointInt = function(idx,name,setpoint,isprotected)
		{
			$.devIdx=idx;
			$("#dialog-editsetpointdevice #devicename").val(name);
			$('#dialog-editsetpointdevice #protected').prop('checked',(isprotected==true));
			$("#dialog-editsetpointdevice #setpoint").val(setpoint);
			$("#dialog-editsetpointdevice #tempunit").html($.myglobals.tempsign);
			$("#dialog-editsetpointdevice" ).dialog( "open" );
		}

		EditSetPoint = function(idx,name,setpoint,isprotected)
		{
			if (typeof $scope.mytimer != 'undefined') {
				$interval.cancel($scope.mytimer);
				$scope.mytimer = undefined;
			}
			if (typeof isprotected != 'undefined') {
				if (isprotected==true) {
					bootbox.prompt($.i18n("Please enter Password")+":", function(result) {
						if (result === null) {
							return;
						} else {
							if (result=="") {
								return;
							}
							//verify password
							$.ajax({
								 url: "json.htm?type=command&param=verifypasscode" + 
										"&passcode=" + result,
								 async: false, 
								 dataType: 'json',
								 success: function(data) {
									if (data.status=="OK") {
										EditSetPointInt(idx,name,setpoint,isprotected)
									}
								 },
								 error: function(){
								 }
							});
						}
					});
				}
				else {
					EditSetPointInt(idx,name,setpoint,isprotected)
				}
			}
			else {
				EditSetPointInt(idx,name,setpoint,isprotected)
			}
		}
		
		EditThermostatClockInt = function(idx,name,daytime,isprotected)
		{
			var sarray=daytime.split(";");
			$.devIdx=idx;
			$("#dialog-editthermostatclockdevice #devicename").val(name);
			$('#dialog-editthermostatclockdevice #protected').prop('checked',(isprotected==true));
			$("#dialog-editthermostatclockdevice #comboclockday").val(parseInt(sarray[0]));
			$("#dialog-editthermostatclockdevice #clockhour").val(sarray[1]);
			$("#dialog-editthermostatclockdevice #clockminute").val(sarray[2]);
			$("#dialog-editthermostatclockdevice" ).dialog( "open" );
		}
		
		EditThermostatClock = function(idx,name,daytime,isprotected)
		{
			if (typeof $scope.mytimer != 'undefined') {
				$interval.cancel($scope.mytimer);
				$scope.mytimer = undefined;
			}
			if (typeof isprotected != 'undefined') {
				if (isprotected==true) {
					bootbox.prompt($.i18n("Please enter Password")+":", function(result) {
						if (result === null) {
							return;
						} else {
							if (result=="") {
								return;
							}
							//verify password
							$.ajax({
								 url: "json.htm?type=command&param=verifypasscode" + 
										"&passcode=" + result,
								 async: false, 
								 dataType: 'json',
								 success: function(data) {
									if (data.status=="OK") {
										EditThermostatClockInt(idx,name,daytime,isprotected)
									}
								 },
								 error: function(){
								 }
							});
						}
					});
				}
				else {
					EditThermostatClockInt(idx,name,daytime,isprotected)
				}
			}
			else {
				EditThermostatClockInt(idx,name,daytime,isprotected)
			}
		}
		

		AddUtilityDevice = function()
		{
		  bootbox.alert($.i18n('Please use the devices tab for this.'));
		}

		RefreshUtilities = function()
		{
			if (typeof $scope.mytimer != 'undefined') {
				$interval.cancel($scope.mytimer);
				$scope.mytimer = undefined;
			}
		  var id="";

		  $.ajax({
			 url: "json.htm?type=devices&filter=utility&used=true&order=Name&lastupdate="+$.LastUpdateTime,
			 async: false, 
			 dataType: 'json',
			 success: function(data) {
			  if (typeof data.result != 'undefined') {
			  
				if (typeof data.ActTime != 'undefined') {
					$.LastUpdateTime=parseInt(data.ActTime);
				}
			  
				$.each(data.result, function(i,item){
					id="#utilitycontent #" + item.idx;
					var obj=$(id);
					if (typeof obj != 'undefined') {
						if ($(id + " #name").html()!=item.Name) {
							$(id + " #name").html(item.Name);
						}
						var status="";
						var bigtext="";
						if (typeof item.Counter != 'undefined') {
							if ((item.SubType == "Gas")||(item.SubType == "RFXMeter counter")) {
								status=item.Counter;
								bigtext=item.CounterToday;
							}
							else {
								status=item.Counter + ', ' + $.i18n("Today") + ': ' + item.CounterToday;
							}
						}
						else if ((item.Type == "Current")||(item.Type == "Current/Energy")) {
						  status=item.Data;
						}
						else if (item.Type == "Energy") {
							status=item.Data;
							if (typeof item.CounterToday != 'undefined') {
								status+=', ' + $.i18n("Today") + ': ' + item.CounterToday;
							}
						}
						else if (item.SubType == "Percentage") {
							status=item.Data;
							bigtext=item.Data;
						}
						else if (item.Type == "Fan") {
							status=item.Data;
							bigtext=item.Data;
						}
						else if (item.Type == "Air Quality") {
							status=item.Data + " (" + item.Quality + ")";
							bigtext=item.Data;
						}
						else if (item.SubType == "Soil Moisture") {
							status=item.Data + " (" + item.Desc + ")";
							bigtext=item.Data;
						}
						else if (item.SubType == "Leaf Wetness") {
							status=item.Data;
							bigtext=item.Data;
						}
						else if ((item.SubType == "Voltage")||(item.SubType == "A/D")||(item.SubType == "Pressure")) {
							status=item.Data;
							bigtext=item.Data;
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
						else if (item.SubType=="Thermostat Clock") {
						  status=item.Data;
						}
						
						if (typeof item.Usage != 'undefined') {
							bigtext=item.Usage;
						}
						if (typeof item.CounterDeliv != 'undefined') {
							if (item.CounterDeliv!=0) {
								status+='<br>' + $.i18n("Return") + ': ' + item.CounterDeliv + ', ' + $.i18n("Today") + ': ' + item.CounterDelivToday;
								if (item.UsageDeliv.charAt(0) != 0) {
									bigtext='-' + item.UsageDeliv;
								}
							}
						}
						
						var nbackcolor="#D4E1EE";
						if (item.Protected==true) {
							nbackcolor="#A4B1EE";
						}
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
							$(id + " #bigtext").html(bigtext);
							$(id + " #status").html(status);
						}
						if ($(id + " #lastupdate").html()!=item.LastUpdate) {
							$(id + " #lastupdate").html(item.LastUpdate);
						}
					}
				});
			  }
			 }
		  });
			$rootScope.RefreshTimeAndSun();
			$scope.mytimer=$interval(function() {
				RefreshUtilities();
			}, 10000);
		}

		ShowUtilities = function()
		{
			if (typeof $scope.mytimer != 'undefined') {
				$interval.cancel($scope.mytimer);
				$scope.mytimer = undefined;
			}
		  $('#modal').show();
		  
		  var htmlcontent = '';
		  var bHaveAddedDevider = false;
			var bAllowWidgetReorder=true;

		  var tophtm=
				'\t<table class="bannav" id="bannav" border="0" cellpadding="0" cellspacing="0" width="100%">\n' +
				'\t<tr>\n' +
				'\t  <td align="left"><div id="timesun" /></td>\n';
		  tophtm+=
				'\t</tr>\n' +
				'\t</table>\n';
		  

		  var i=0;
		  $.ajax({
			 url: "json.htm?type=devices&filter=utility&used=true&order=Name", 
			 async: false, 
			 dataType: 'json',
			 success: function(data) {
			  if (typeof data.result != 'undefined') {

				$.FiveMinuteHistoryDays=data["5MinuteHistoryDays"];
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
					$.LastUpdateTime=parseInt(data.ActTime);
				}
				
				bAllowWidgetReorder=data.AllowWidgetOrdering;

				$.each(data.result, function(i,item){
				  if (i % 3 == 0)
				  {
					//add devider
					if (bHaveAddedDevider == true) {
					  //close previous devider
					  htmlcontent+='</div>\n';
					}
					htmlcontent+='<div class="row divider">\n';
					bHaveAddedDevider=true;
				  }
				  
				  var xhtm=
						'\t<div class="span4" id="' + item.idx + '">\n' +
						'\t  <section>\n' +
						'\t    <table id="itemtable" border="0" cellpadding="0" cellspacing="0">\n' +
						'\t    <tr>\n';
						var nbackcolor="#D4E1EE";
						if (item.Protected==true) {
							nbackcolor="#A4B1EE";
						}
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
							if ((item.UsageDeliv.charAt(0) == 0)||(parseInt(item.Usage)!=0)) {
								xhtm+=item.Usage;
							}
							if (item.UsageDeliv.charAt(0) != 0) {
								xhtm+='-' + item.UsageDeliv;
							}
						}
						else if ((item.SubType == "Gas")||(item.SubType == "RFXMeter counter")) {
						  xhtm+=item.CounterToday;
						}
						else if (item.Type == "Air Quality") {
						  xhtm+=item.Data;
						}
						else if (item.SubType == "Percentage") {
						  xhtm+=item.Data;
						}
						else if (item.Type == "Fan") {
						  xhtm+=item.Data;
						}
						else if (item.SubType == "Soil Moisture") {
						  xhtm+=item.Data;
						}
						else if (item.SubType == "Leaf Wetness") {
						  xhtm+=item.Data;
						}
						else if ((item.SubType == "Voltage")||(item.SubType == "A/D")||(item.SubType == "Pressure")) {
						  xhtm+=item.Data;
						}
						else if (item.Type == "Lux") {
						  xhtm+=item.Data;
						}
						else if (item.Type == "Weight") {
						  xhtm+=item.Data;
						}
						else if (item.Type == "Usage") {
						  xhtm+=item.Data;
						}
						else if (item.Type == "Thermostat") {
						  xhtm+=item.Data + '\u00B0 ' + $.myglobals.tempsign;
						}
						xhtm+='</td>\n';
				  xhtm+='\t      <td id="img"><img src="images/';
					var status="";
					if (typeof item.Counter != 'undefined') {
					  xhtm+='counter.png" height="48" width="48"></td>\n';
					  if ((item.SubType == "Gas")||(item.SubType == "RFXMeter counter")) {
						status=item.Counter;
					  }
					  else {
						status=item.Counter + ', ' + $.i18n("Today") + ': ' + item.CounterToday;
					  }
					}
					else if ((item.Type == "Current")||(item.Type == "Current/Energy")) {
					  xhtm+='current48.png" height="48" width="48"></td>\n';
					  status=item.Data;
					}
					else if (item.Type == "Energy") {
					  xhtm+='current48.png" height="48" width="48"></td>\n';
					  status=item.Data;
					  if (typeof item.CounterToday != 'undefined') {
						status+=', ' + $.i18n("Today") + ': ' + item.CounterToday;
					  }
					}
					else if (item.Type == "Air Quality") {
					  xhtm+='air48.png" height="48" width="48"></td>\n';
					  status=item.Data + " (" + item.Quality + ")";
					}
					else if (item.SubType == "Soil Moisture") {
					  xhtm+='moisture48.png" height="48" width="48"></td>\n';
					  status=item.Data + " (" + item.Desc + ")";
					}
					else if (item.SubType == "Percentage") {
					  xhtm+='Percentage48.png" height="48" width="48"></td>\n';
					  status=item.Data;
					}
					else if (item.SubType == "System fan") {
					  xhtm+='Fan48_On.png" height="48" width="48"></td>\n';
					  status=item.Data;
					}
					else if (item.SubType == "Leaf Wetness") {
					  xhtm+='leaf48.png" height="48" width="48"></td>\n';
					  status=item.Data;
					}
					else if ((item.SubType == "Voltage")||(item.SubType == "A/D")) {
					  xhtm+='current48.png" height="48" width="48"></td>\n';
					  status=item.Data;
					}
					else if (item.SubType == "Pressure") {
					  xhtm+='gauge48.png" height="48" width="48"></td>\n';
					  status=item.Data;
					}
					else if (item.Type == "Lux") {
					  xhtm+='lux48.png" height="48" width="48"></td>\n';
					  status=item.Data;
					}
					else if (item.Type == "Weight") {
					  xhtm+='scale48.png" height="48" width="48"></td>\n';
					  status=item.Data;
					}
					else if (item.Type == "Usage") {
					  xhtm+='current48.png" height="48" width="48"></td>\n';
					  status=item.Data;
					}
					else if ((item.Type == "Thermostat")&&(item.SubType=="SetPoint")) {
					  xhtm+='override.png" height="48" width="48"></td>\n';
					  status=item.Data + '\u00B0 ' + $.myglobals.tempsign;
					}
					else if (item.SubType=="Thermostat Clock") {
					  xhtm+='clock48.png" height="48" width="48"></td>\n';
					  status=item.Data;
					}
					if (typeof item.CounterDeliv != 'undefined') {
						if (item.CounterDeliv!=0) {
							status+='<br>' + $.i18n("Return") + ': ' + item.CounterDeliv + ', ' + $.i18n("Today") + ': ' + item.CounterDelivToday;
						}
					}
					xhtm+=      
						'\t      <td id="status">' + status + '</td>\n' +
						'\t      <td id="lastupdate">' + item.LastUpdate + '</td>\n' +
						'\t      <td id="type">' + item.Type + ', ' + item.SubType + '</td>\n' +
						'\t      <td>';
				  if (item.Favorite == 0) {
					xhtm+=      
						  '<img src="images/nofavorite.png" title="' + $.i18n('Add to Dashboard') +'" onclick="MakeFavorite(' + item.idx + ',1);" class="lcursor">&nbsp;&nbsp;&nbsp;&nbsp;';
				  }
				  else {
					xhtm+=      
						  '<img src="images/favorite.png" title="' + $.i18n('Remove from Dashboard') +'" onclick="MakeFavorite(' + item.idx + ',0);" class="lcursor">&nbsp;&nbsp;&nbsp;&nbsp;';
				  }

				  if (typeof item.Counter != 'undefined') {
					if ((item.Type == "P1 Smart Meter")&&(item.SubType=="Energy")) {
						xhtm+='<a class="btnsmall" onclick="ShowSmartLog(\'#utilitycontent\',\'ShowUtilities\',' + item.idx + ',\'' + item.Name + '\', ' + item.SwitchTypeVal + ');" data-i18n="Log">Log</a> ';
					}
					else {
						xhtm+='<a class="btnsmall" onclick="ShowCounterLog(\'#utilitycontent\',\'ShowUtilities\',' + item.idx + ',\'' + item.Name + '\', ' + item.SwitchTypeVal + ');" data-i18n="Log">Log</a> ';
					}
					if (permissions.hasPermission("Admin")) {
						if (item.Type == "P1 Smart Meter") {
							xhtm+='<a class="btnsmall" onclick="EditUtilityDevice(' + item.idx + ',\'' + item.Name + '\');" data-i18n="Edit">Edit</a> ';
						}
						else {
							xhtm+='<a class="btnsmall" onclick="EditMeterDevice(' + item.idx + ',\'' + item.Name + '\', ' + item.SwitchTypeVal +');" data-i18n="Edit">Edit</a> ';
						}
					}
				  }
				  else if (item.Type == "Air Quality") {
					xhtm+='<a class="btnsmall" onclick="ShowAirQualityLog(\'#utilitycontent\',\'ShowUtilities\',' + item.idx + ',\'' + item.Name + '\');" data-i18n="Log">Log</a> ';
					if (permissions.hasPermission("Admin")) {
						xhtm+='<a class="btnsmall" onclick="EditUtilityDevice(' + item.idx + ',\'' + item.Name + '\');" data-i18n="Edit">Edit</a> ';
					}
				  }
				  else if (item.SubType == "Percentage") {
					xhtm+='<a class="btnsmall" onclick="ShowPercentageLog(\'#utilitycontent\',\'ShowUtilities\',' + item.idx + ',\'' + item.Name + '\');" data-i18n="Log">Log</a> ';
					if (permissions.hasPermission("Admin")) {
						xhtm+='<a class="btnsmall" onclick="EditUtilityDevice(' + item.idx + ',\'' + item.Name + '\');" data-i18n="Edit">Edit</a> ';
					}
				  }
				  else if (item.Type == "Fan") {
					xhtm+='<a class="btnsmall" onclick="ShowFanLog(\'#utilitycontent\',\'ShowUtilities\',' + item.idx + ',\'' + item.Name + '\');" data-i18n="Log">Log</a> ';
					if (permissions.hasPermission("Admin")) {
						xhtm+='<a class="btnsmall" onclick="EditUtilityDevice(' + item.idx + ',\'' + item.Name + '\');" data-i18n="Edit">Edit</a> ';
					}
				  }
				  else if ((item.SubType == "Soil Moisture")||(item.SubType == "Leaf Wetness")) {
					xhtm+='<a class="btnsmall" onclick="ShowGeneralGraph(\'#utilitycontent\',\'ShowUtilities\',' + item.idx + ',\'' + item.Name+ '\',' + item.SwitchTypeVal +', \'' + item.SubType + '\');" data-i18n="Log">Log</a> ';
					if (permissions.hasPermission("Admin")) {
						xhtm+='<a class="btnsmall" onclick="EditUtilityDevice(' + item.idx + ',\'' + item.Name + '\');" data-i18n="Edit">Edit</a> ';
					}
				  }
				  else if (item.Type == "Lux") {
					xhtm+='<a class="btnsmall" onclick="ShowLuxLog(\'#utilitycontent\',\'ShowUtilities\',' + item.idx + ',\'' + item.Name + '\');" data-i18n="Log">Log</a> ';
					if (permissions.hasPermission("Admin")) {
						xhtm+='<a class="btnsmall" onclick="EditUtilityDevice(' + item.idx + ',\'' + item.Name + '\');" data-i18n="Edit">Edit</a> ';
					}
				  }
				  else if (item.Type == "Weight") {
					xhtm+='<a class="btnsmall" onclick="ShowGeneralGraph(\'#utilitycontent\',\'ShowUtilities\',' + item.idx + ',\'' + item.Name+ '\',\'' + item.Type +'\', \'' + item.SubType + '\');" data-i18n="Log">Log</a> ';
					if (permissions.hasPermission("Admin")) {
						xhtm+='<a class="btnsmall" onclick="EditUtilityDevice(' + item.idx + ',\'' + item.Name + '\');" data-i18n="Edit">Edit</a> ';
					}
				  }
				  else if (item.Type == "Usage") {
					xhtm+='<a class="btnsmall" onclick="ShowUsageLog(\'#utilitycontent\',\'ShowUtilities\',' + item.idx + ',\'' + item.Name + '\');" data-i18n="Log">Log</a> ';
					if (permissions.hasPermission("Admin")) {
						xhtm+='<a class="btnsmall" onclick="EditUtilityDevice(' + item.idx + ',\'' + item.Name + '\');" data-i18n="Edit">Edit</a> ';
					}
				  }
				  else if ((item.Type == "Current")||(item.Type == "Current/Energy")) {
					xhtm+='<a class="btnsmall" onclick="ShowCurrentLog(\'#utilitycontent\',\'ShowUtilities\',' + item.idx + ',\'' + item.Name + '\', ' + item.displaytype + ');" data-i18n="Log">Log</a> ';
					if (permissions.hasPermission("Admin")) {
						xhtm+='<a class="btnsmall" onclick="EditUtilityDevice(' + item.idx + ',\'' + item.Name + '\');" data-i18n="Edit">Edit</a> ';
					}
				  }
				  else if (item.Type == "Energy") {
						xhtm+='<a class="btnsmall" onclick="ShowCounterLogSpline(\'#utilitycontent\',\'ShowUtilities\',' + item.idx + ',\'' + item.Name + '\', ' + item.SwitchTypeVal + ');" data-i18n="Log">Log</a> ';
						if (permissions.hasPermission("Admin")) {
							xhtm+='<a class="btnsmall" onclick="EditUtilityDevice(' + item.idx + ',\'' + item.Name + '\');" data-i18n="Edit">Edit</a> ';
						}
				  }
				  else if ((item.Type == "Thermostat")&&(item.SubType=="SetPoint")) {
						if (permissions.hasPermission("Admin")) {
							xhtm+='<a class="btnsmall" onclick="ShowTempLog(\'#utilitycontent\',\'ShowUtilities\',' + item.idx + ',\'' + item.Name + '\');" data-i18n="Log">Log</a> ';
							xhtm+='<a class="btnsmall" onclick="EditSetPoint(' + item.idx + ',\'' + item.Name + '\', ' + item.SetPoint + ',' + item.Protected +');" data-i18n="Edit">Edit</a> ';
							if (item.Timers == "true") {
								xhtm+='<a class="btnsmall-sel" onclick="ShowSetpointTimers(' + item.idx + ',\'' + item.Name + '\');" data-i18n="Timers">Timers</a> ';
							}
							else {
								xhtm+='<a class="btnsmall" onclick="ShowSetpointTimers(' + item.idx + ',\'' + item.Name + '\');" data-i18n="Timers">Timers</a> ';
							}
						}
				  }
				  else if (item.SubType=="Thermostat Clock") {
						if (permissions.hasPermission("Admin")) {
							xhtm+='<a class="btnsmall" onclick="EditThermostatClock(' + item.idx + ',\'' + item.Name + '\', \'' + item.DayTime + '\',' + item.Protected +');" data-i18n="Edit">Edit</a> ';
						}
				  }
				  else if ((item.Type == "General")&&(item.SubType == "Voltage")) {
					xhtm+='<a class="btnsmall" onclick="ShowGeneralGraph(\'#utilitycontent\',\'ShowUtilities\',' + item.idx + ',\'' + item.Name+ '\',' + item.SwitchTypeVal +', \'VoltageGeneral\');" data-i18n="Log">Log</a> ';
					if (permissions.hasPermission("Admin")) {
						xhtm+='<a class="btnsmall" onclick="EditUtilityDevice(' + item.idx + ',\'' + item.Name + '\');" data-i18n="Edit">Edit</a> ';
					}
				  }
				  else if ((item.Type == "General")&&(item.SubType == "Pressure")) {
					xhtm+='<a class="btnsmall" onclick="ShowGeneralGraph(\'#utilitycontent\',\'ShowUtilities\',' + item.idx + ',\'' + item.Name+ '\',' + item.SwitchTypeVal +', \'Pressure\');" data-i18n="Log">Log</a> ';
					if (permissions.hasPermission("Admin")) {
						xhtm+='<a class="btnsmall" onclick="EditUtilityDevice(' + item.idx + ',\'' + item.Name + '\');" data-i18n="Edit">Edit</a> ';
					}
				  }
				  else if ((item.SubType == "Voltage")||(item.SubType == "A/D")) {
					xhtm+='<a class="btnsmall" onclick="ShowGeneralGraph(\'#utilitycontent\',\'ShowUtilities\',' + item.idx + ',\'' + item.Name+ '\',' + item.SwitchTypeVal +', \'' + item.SubType + '\');" data-i18n="Log">Log</a> ';
					if (permissions.hasPermission("Admin")) {
						xhtm+='<a class="btnsmall" onclick="EditUtilityDevice(' + item.idx + ',\'' + item.Name + '\');" data-i18n="Edit">Edit</a> ';
					}
				  }
				  else {
					if (permissions.hasPermission("Admin")) {
						xhtm+='<a class="btnsmall" onclick="EditUtilityDevice(' + item.idx + ',\'' + item.Name + '\');" data-i18n="Edit">Edit</a> ';
					}
				  }
				  if (permissions.hasPermission("Admin")) {
					  if (item.Notifications == "true")
						xhtm+='<a class="btnsmall-sel" onclick="ShowNotifications(' + item.idx + ',\'' + item.Name + '\', \'#utilitycontent\', \'ShowUtilities\');" data-i18n="Notifications">Notifications</a>';
					  else
						xhtm+='<a class="btnsmall" onclick="ShowNotifications(' + item.idx + ',\'' + item.Name + '\', \'#utilitycontent\', \'ShowUtilities\');" data-i18n="Notifications">Notifications</a>';
				  }
				  xhtm+=      
						'</td>\n' +
						'\t    </tr>\n' +
						'\t    </table>\n' +
						'\t  </section>\n' +
						'\t</div>\n';
				  htmlcontent+=xhtm;
				});
			  }
			 }
		  });
		  if (bHaveAddedDevider == true) {
			//close previous devider
			htmlcontent+='</div>\n';
		  }
		  if (htmlcontent == '')
		  {
			htmlcontent='<h2>' + $.i18n('No Utility sensors found or added in the system...') + '</h2>';
		  }
		  $('#modal').hide();
		  $('#utilitycontent').html(tophtm+htmlcontent);
		  $('#utilitycontent').i18n();

			if (bAllowWidgetReorder==true) {
				if (permissions.hasPermission("Admin")) {
					if (window.myglobals.ismobileint==false) {
						$("#utilitycontent .span4").draggable({
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
						$("#utilitycontent .span4").droppable({
								drop: function() {
									var myid=$(this).attr("id");
									$.devIdx.split(' ');
									$.ajax({
										 url: "json.htm?type=command&param=switchdeviceorder&idx1=" + myid + "&idx2=" + $.devIdx,
										 async: false, 
										 dataType: 'json',
										 success: function(data) {
												ShowUtilities();
										 }
									});
								}
						});
					}
				}
			}
			$rootScope.RefreshTimeAndSun();
			$scope.mytimer=$interval(function() {
				RefreshUtilities();
			}, 10000);
		  return false;
		}

		init();

		function init()
		{
			//global var
			$.devIdx=0;
			$.LastUpdateTime=parseInt(0);

			$.myglobals = {
				TimerTypesStr : [],
				SelectedTimerIdx: 0
			};
			$('#timerparamstable #combotype > option').each(function() {
						 $.myglobals.TimerTypesStr.push($(this).text());
			});

			$( "#dialog-editutilitydevice" ).dialog({
				  autoOpen: false,
				  width: 450,
				  height: 160,
				  modal: true,
				  resizable: false,
				  buttons: {
					  "Update": function() {
						  var bValid = true;
						  bValid = bValid && checkLength( $("#dialog-editutilitydevice #devicename"), 2, 100 );
						  if ( bValid ) {
							  $( this ).dialog( "close" );
							  $.ajax({
								 url: "json.htm?type=setused&idx=" + $.devIdx + '&name=' + encodeURIComponent($("#dialog-editutilitydevice #devicename").val()) + '&used=true',
								 async: false, 
								 dataType: 'json',
								 success: function(data) {
									ShowUtilities();
								 }
							  });
							  
						  }
					  },
					  "Remove Device": function() {
						$( this ).dialog( "close" );
						bootbox.confirm($.i18n("Are you sure to remove this Device?"), function(result) {
							if (result==true) {
							  $.ajax({
								 url: "json.htm?type=setused&idx=" + $.devIdx + '&name=' + encodeURIComponent($("#dialog-editutilitydevice #devicename").val()) + '&used=false',
								 async: false, 
								 dataType: 'json',
								 success: function(data) {
									ShowUtilities();
								 }
							  });
							}
						});
					  },
					  "Replace": function() {
						  $( this ).dialog( "close" );
						  ReplaceDevice($.devIdx,ShowUtilities);
					  },
					  Cancel: function() {
						  $( this ).dialog( "close" );
					  }
				  },
				  close: function() {
					$( this ).dialog( "close" );
				  }
			});
			$( "#dialog-editmeterdevice" ).dialog({
				  autoOpen: false,
				  width: 370,
				  height: 200,
				  modal: true,
				  resizable: false,
				  buttons: {
					  "Update": function() {
						  var bValid = true;
						  bValid = bValid && checkLength( $("#dialog-editmeterdevice #devicename"), 2, 100 );
						  if ( bValid ) {
							  $( this ).dialog( "close" );
							  $.ajax({
								 url: "json.htm?type=setused&idx=" + $.devIdx + '&name=' + encodeURIComponent($("#dialog-editmeterdevice #devicename").val()) + '&switchtype=' + $("#dialog-editmeterdevice #combometertype").val() + '&used=true',
								 async: false, 
								 dataType: 'json',
								 success: function(data) {
									ShowUtilities();
								 }
							  });
							  
						  }
					  },
					  "Remove Device": function() {
						$( this ).dialog( "close" );
						bootbox.confirm($.i18n("Are you sure to remove this Device?"), function(result) {
							if (result==true) {
							  $.ajax({
								 url: "json.htm?type=setused&idx=" + $.devIdx + '&name=' + encodeURIComponent($("#dialog-editmeterdevice #devicename").val()) + '&used=false',
								 async: false, 
								 dataType: 'json',
								 success: function(data) {
									ShowUtilities();
								 }
							  });
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

			$( "#dialog-editsetpointdevice" ).dialog({
				  autoOpen: false,
				  width: 390,
				  height: 250,
				  modal: true,
				  resizable: false,
				  buttons: {
					  "Update": function() {
						  var bValid = true;
						  bValid = bValid && checkLength( $("#dialog-editsetpointdevice #devicename"), 2, 100 );
						  if ( bValid ) {
							  $( this ).dialog( "close" );
							  $.ajax({
								 url: "json.htm?type=setused&idx=" + $.devIdx +
								 '&name=' + encodeURIComponent($("#dialog-editsetpointdevice #devicename").val()) +
								 '&setpoint=' + $("#dialog-editsetpointdevice #setpoint").val() + 
								 '&protected=' + $('#dialog-editsetpointdevice #protected').is(":checked") +
								 '&used=true',
								 async: false, 
								 dataType: 'json',
								 success: function(data) {
									ShowUtilities();
								 }
							  });
							  
						  }
					  },
					  "Remove Device": function() {
						$( this ).dialog( "close" );
						bootbox.confirm($.i18n("Are you sure to remove this Device?"), function(result) {
							if (result==true) {
							  $.ajax({
								 url: "json.htm?type=setused&idx=" + $.devIdx + '&name=' + encodeURIComponent($("#dialog-editsetpointdevice #devicename").val()) + '&used=false',
								 async: false, 
								 dataType: 'json',
								 success: function(data) {
									ShowUtilities();
								 }
							  });
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
			$( "#dialog-editthermostatclockdevice" ).dialog({
				  autoOpen: false,
				  width: 390,
				  height: 320,
				  modal: true,
				  resizable: false,
				  buttons: {
					  "Update": function() {
						  var bValid = true;
						  bValid = bValid && checkLength( $("#dialog-editthermostatclockdevice #devicename"), 2, 100 );
						  if ( bValid ) {
							  $( this ).dialog( "close" );
							  //bootbox.alert($.i18n('Clock will be set when device wakes up.'));
							  bootbox.alert($.i18n('Setting the Clock is not finished yet!'));
							  var daytimestr=$("#dialog-editthermostatclockdevice #comboclockday").val()+";"+$("#dialog-editthermostatclockdevice #clockhour").val()+";"+$("#dialog-editthermostatclockdevice #clockminute").val();
							  $.ajax({
								 url: "json.htm?type=setused&idx=" + $.devIdx +
								 '&name=' + encodeURIComponent($("#dialog-editthermostatclockdevice #devicename").val()) +
								 '&clock=' + encodeURIComponent(daytimestr) + 
								 '&protected=' + $('#dialog-editthermostatclockdevice #protected').is(":checked") +
								 '&used=true',
								 async: false, 
								 dataType: 'json',
								 success: function(data) {
									ShowUtilities();
								 }
							  });
						  }
					  },
					  "Remove Device": function() {
						$( this ).dialog( "close" );
						bootbox.confirm($.i18n("Are you sure to remove this Device?"), function(result) {
							if (result==true) {
							  $.ajax({
								 url: "json.htm?type=setused&idx=" + $.devIdx + '&name=' + encodeURIComponent($("#dialog-editthermostatclockdevice #devicename").val()) + '&used=false',
								 async: false, 
								 dataType: 'json',
								 success: function(data) {
									ShowUtilities();
								 }
							  });
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

		  ShowUtilities();

			$( "#dialog-editutilitydevice" ).keydown(function (event) {
				if (event.keyCode == 13) {
					$(this).siblings('.ui-dialog-buttonpane').find('button:eq(0)').trigger("click");
					return false;
				}
			});
		};
		$scope.$on('$destroy', function(){
			if (typeof $scope.mytimer != 'undefined') {
				$interval.cancel($scope.mytimer);
				$scope.mytimer = undefined;
			}
		}); 
	} ]);
});