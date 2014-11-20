/*
 (c) 2012-2014 Domoticz.com, Robbert E. Peters
*/
jQuery.fn.center = function(parent) {
    if (parent) {
        parent = this.parent();
    } else {
        parent = window;
    }
    this.css({
        "position": "absolute",
        "top": ((($(parent).height() - this.outerHeight()) / 2) + $(parent).scrollTop() + "px"),
        "left": ((($(parent).width() - this.outerWidth()) / 2) + $(parent).scrollLeft() + "px")
    });
	return this;
};

/* Get the rows which are currently selected */
function fnGetSelected( oTableLocal )
{
    return oTableLocal.$('tr.row_selected');
}

function GetBackbuttonHTMLTable(backfunction)
{
  var xhtm=
        '\t<table class="bannav" id="bannav" border="0" cellpadding="0" cellspacing="0" width="100%">\n' +
        '\t<tr>\n' +
        '\t  <td>\n' +
        '\t    <a class="btnstylerev" onclick="' + backfunction + '()" data-i18n="Back">Back</a>\n' +
        '\t  </td>\n' +
        '\t</tr>\n' +
        '\t</table>\n' +
        '\t<br>\n';
  return xhtm;
}

function GetBackbuttonHTMLTableWithRight(backfunction,rightfunction,rightlabel)
{
  var xhtm=
        '\t<table class="bannav" id="bannav" border="0" cellpadding="0" cellspacing="0" width="100%">\n' +
        '\t<tr>\n' +
        '\t  <td align="left">\n' +
        '\t    <a class="btnstylerev" onclick="' + backfunction + '()" data-i18n="Back">Back</a>\n' +
        '\t  </td>\n' +
        '\t  <td align="right">\n' +
        '\t    <a class="btnstyle" onclick="' + rightfunction + '" data-i18n="'+rightlabel+'">'+rightlabel+'</a>\n' +
        '\t  </td>\n' +
        '\t</tr>\n' +
        '\t</table>\n' +
        '\t<br>\n';
  return xhtm;
}

function CalculateTrendLine(data) {
	//function taken from jquery.flot.trendline.js
	var ii=0, x, y, x0, x1, y0, y1, dx,
		m = 0, b = 0, cs, ns,
		n = data.length, Sx = 0, Sy = 0, Sxy = 0, Sx2 = 0, S2x = 0;
   
	// Not enough data
	if(n < 2) return;
   
	// Do math stuff
	for(ii;ii<data.length;ii++){
		x = data[ii][0];
		y = data[ii][1];
		Sx += x;
		Sy += y;
		Sxy += (x*y);
		Sx2 += (x*x);
	}
	// Calculate slope and intercept
	m = (n*Sx2 - S2x) != 0 ? (n*Sxy - Sx*Sy) / (n*Sx2 - Sx*Sx) : 0;
	b = (Sy - m*Sx) / n;
   
	// Calculate minimal coordinates to draw the trendline
	dx = 0;// parseFloat(data[1][0]) - parseFloat(data[0][0]);
	x0 = parseFloat(data[0][0])-dx;
	y0 = parseFloat(m*x0 + b);
	x1 = parseFloat(data[ii-1][0])+dx;
	y1 = parseFloat(m*x1 + b);
	
	var dReturn = {};
	dReturn.x0 = x0;
	dReturn.y0 = y0;
	dReturn.x1 = x1;
	dReturn.y1 = y1;
	return dReturn;
};

function ArmSystemInt(idx,switchcmd, refreshfunction, passcode)
{
	clearInterval($.myglobals.refreshTimer);

	$.devIdx=idx;

   var $dialog = $('<div>How would you like to Arm the System?</div>').dialog({
			modal: true,
			width: 340,
			resizable: false,
			draggable: false,
            buttons: [
                  {
                        text: $.i18n("Arm Home"),
                        click: function(){
							$dialog.remove();
							switchcmd="Arm Home";
							ShowNotify($.i18n('Switching') + ' ' + $.i18n(switchcmd));
							$.ajax({
							 url: "json.htm?type=command&param=switchlight&idx=" + $.devIdx + 
								"&switchcmd=" + switchcmd + 
								"&level=0" +
								"&passcode=" + passcode,
							 async: false, 
							 dataType: 'json',
							 success: function(data) {
								if (data.status=="ERROR") {
									HideNotify();
									bootbox.alert($.i18n('Problem sending switch command'));
								}
							  //wait 1 second
							  setTimeout(function() {
								HideNotify();
								refreshfunction();
							  }, 1000);
							 },
							 error: function(){
								HideNotify();
								alert($.i18n('Problem sending switch command'));
							 }     
							});
                        }
                  },
                  {
                        text: $.i18n("Arm Away"),
                        click: function(){
							$dialog.remove();
							switchcmd="Arm Away";
							ShowNotify($.i18n('Switching') + ' ' + $.i18n(switchcmd));
							$.ajax({
							 url: "json.htm?type=command&param=switchlight&idx=" + $.devIdx + 
									"&switchcmd=" + switchcmd + 
									"&level=0" +
									"&passcode=" + passcode,
							 async: false, 
							 dataType: 'json',
							 success: function(data) {
								if (data.status=="ERROR") {
									HideNotify();
									bootbox.alert($.i18n('Problem sending switch command'));
								}
							  //wait 1 second
							  setTimeout(function() {
								HideNotify();
								refreshfunction();
							  }, 1000);
							 },
							 error: function(){
								HideNotify();
								alert($.i18n('Problem sending switch command'));
							 }     
							});
                        }
                  }
            ]
      });
}

function ArmSystem(idx,switchcmd, refreshfunction, isprotected)
{
	if (window.my_config.userrights==0) {
        HideNotify();
		ShowNotify($.i18n('You do not have permission to do that!'), 2500, true);
		return;
	}
	
	var passcode="";
	if (typeof isprotected != 'undefined') {
		if (isprotected==true) {
			bootbox.prompt($.i18n("Please enter Password")+":", function(result) {
				if (result === null) {
					return;
				} else {
					if (result=="") {
						return;
					}
					passcode=result;
					ArmSystemInt(idx,switchcmd, refreshfunction, passcode);
				}
			});
		}
		else {
			ArmSystemInt(idx,switchcmd, refreshfunction, passcode);
		}
	}
	else {
		ArmSystemInt(idx,switchcmd, refreshfunction, passcode);
	}
}

function ArmSystemMeiantechInt(idx,switchcmd, refreshfunction, passcode)
{
	clearInterval($.myglobals.refreshTimer);

	$.devIdx=idx;

   var $dialog = $('<div>How would you like to Arm the System?</div>').dialog({
			modal: true,
			width: 420,
			resizable: false,
			draggable: false,
            buttons: [
                  {
                        text: $.i18n("Arm Home"),
                        click: function(){
							$dialog.remove();
							switchcmd="Arm Home";
							ShowNotify($.i18n('Switching') + ' ' + $.i18n(switchcmd));
							$.ajax({
							 url: "json.htm?type=command&param=switchlight&idx=" + $.devIdx + 
								"&switchcmd=" + switchcmd + 
								"&level=0" +
								"&passcode=" + passcode,
							 async: false, 
							 dataType: 'json',
							 success: function(data) {
								if (data.status=="ERROR") {
									HideNotify();
									bootbox.alert($.i18n('Problem sending switch command'));
								}
							  //wait 1 second
							  setTimeout(function() {
								HideNotify();
								refreshfunction();
							  }, 1000);
							 },
							 error: function(){
								HideNotify();
								alert($.i18n('Problem sending switch command'));
							 }     
							});
                        }
                  },
                  {
                        text: $.i18n("Arm Away"),
                        click: function(){
							$dialog.remove();
							switchcmd="Arm Away";
							ShowNotify($.i18n('Switching') + ' ' + $.i18n(switchcmd));
							$.ajax({
							 url: "json.htm?type=command&param=switchlight&idx=" + $.devIdx + 
									"&switchcmd=" + switchcmd + 
									"&level=0" +
									"&passcode=" + passcode,
							 async: false, 
							 dataType: 'json',
							 success: function(data) {
								if (data.status=="ERROR") {
									HideNotify();
									bootbox.alert($.i18n('Problem sending switch command'));
								}
							  //wait 1 second
							  setTimeout(function() {
								HideNotify();
								refreshfunction();
							  }, 1000);
							 },
							 error: function(){
								HideNotify();
								alert($.i18n('Problem sending switch command'));
							 }     
							});
                        }
                  },
                  {
                        text: $.i18n("Panic"),
                        click: function(){
							$dialog.remove();
							switchcmd="Panic";
							ShowNotify($.i18n('Switching') + ' ' + $.i18n(switchcmd));
							$.ajax({
							 url: "json.htm?type=command&param=switchlight&idx=" + $.devIdx + 
								"&switchcmd=" + switchcmd + 
								"&level=0" +
								"&passcode=" + passcode,
							 async: false, 
							 dataType: 'json',
							 success: function(data) {
								if (data.status=="ERROR") {
									HideNotify();
									bootbox.alert($.i18n('Problem sending switch command'));
								}
							  //wait 1 second
							  setTimeout(function() {
								HideNotify();
								refreshfunction();
							  }, 1000);
							 },
							 error: function(){
								HideNotify();
								alert($.i18n('Problem sending switch command'));
							 }     
							});
                        }
                  },
                  {
                        text: $.i18n("Disarm"),
                        click: function(){
							$dialog.remove();
							switchcmd="Disarm";
							ShowNotify($.i18n('Switching') + ' ' + $.i18n(switchcmd));
							$.ajax({
							 url: "json.htm?type=command&param=switchlight&idx=" + $.devIdx + 
									"&switchcmd=" + switchcmd + 
									"&level=0" +
									"&passcode=" + passcode,
							 async: false, 
							 dataType: 'json',
							 success: function(data) {
								if (data.status=="ERROR") {
									HideNotify();
									bootbox.alert($.i18n('Problem sending switch command'));
								}
							  //wait 1 second
							  setTimeout(function() {
								HideNotify();
								refreshfunction();
							  }, 1000);
							 },
							 error: function(){
								HideNotify();
								alert($.i18n('Problem sending switch command'));
							 }     
							});
                        }
                  }
            ]
      });
}

function ArmSystemMeiantech(idx,switchcmd, refreshfunction, isprotected)
{
	if (window.my_config.userrights==0) {
        HideNotify();
		ShowNotify($.i18n('You do not have permission to do that!'), 2500, true);
		return;
	}
	
	var passcode="";
	if (typeof isprotected != 'undefined') {
		if (isprotected==true) {
			bootbox.prompt($.i18n("Please enter Password")+":", function(result) {
				if (result === null) {
					return;
				} else {
					if (result=="") {
						return;
					}
					passcode=result;
					ArmSystemMeiantechInt(idx,switchcmd, refreshfunction, passcode);
				}
			});
		}
		else {
			ArmSystemMeiantechInt(idx,switchcmd, refreshfunction, passcode);
		}
	}
	else {
		ArmSystemMeiantechInt(idx,switchcmd, refreshfunction, passcode);
	}
}

function SwitchLightInt(idx,switchcmd, refreshfunction, passcode)
{
  clearInterval($.myglobals.refreshTimer);
  
  ShowNotify($.i18n('Switching') + ' ' + $.i18n(switchcmd));
 
  $.ajax({
     url: "json.htm?type=command&param=switchlight" + 
			"&idx=" + idx + 
			"&switchcmd=" + switchcmd + 
			"&level=0" +
			"&passcode=" + passcode,
     async: false, 
     dataType: 'json',
     success: function(data) {
		if (data.status=="ERROR") {
			HideNotify();
			bootbox.alert($.i18n('Problem sending switch command'));
		}
      //wait 1 second
      setTimeout(function() {
        HideNotify();
        refreshfunction();
      }, 1000);
     },
     error: function(){
        HideNotify();
        alert($.i18n('Problem sending switch command'));
     }     
  });
}

function SwitchLight(idx,switchcmd, refreshfunction, isprotected)
{
	if (window.my_config.userrights==0) {
        HideNotify();
		ShowNotify($.i18n('You do not have permission to do that!'), 2500, true);
		return;
	}

	var passcode="";
	if (typeof isprotected != 'undefined') {
		if (isprotected==true) {
			bootbox.prompt($.i18n("Please enter Password")+":", function(result) {
				if (result === null) {
					return;
				} else {
					if (result=="") {
						return;
					}
					passcode=result;
					SwitchLightInt(idx,switchcmd, refreshfunction, passcode);
				}
			});
		}
		else {
			SwitchLightInt(idx,switchcmd, refreshfunction, passcode);
		}
	}
	else {
		SwitchLightInt(idx,switchcmd, refreshfunction, passcode);
	}
}
function SwitchSceneInt(idx,switchcmd, refreshfunction, passcode)
{
  clearInterval($.myglobals.refreshTimer);
  ShowNotify($.i18n('Switching') + ' ' + $.i18n(switchcmd));
 
  $.ajax({
     url: "json.htm?type=command&param=switchscene&idx=" + idx + 
		"&switchcmd=" + switchcmd +
		"&passcode=" + passcode,
     async: false, 
     dataType: 'json',
     success: function(data) {
		if (data.status=="ERROR") {
			HideNotify();
			bootbox.alert($.i18n('Problem sending switch command'));
		}
      //wait 1 second
      setTimeout(function() {
        HideNotify();
        refreshfunction();
      }, 1000);
     },
     error: function(){
        HideNotify();
        alert($.i18n('Problem sending switch command'));
     }     
  });
}

function SwitchScene(idx,switchcmd, refreshfunction, isprotected)
{
	if (window.my_config.userrights==0) {
        HideNotify();
		ShowNotify($.i18n('You do not have permission to do that!'), 2500, true);
		return;
	}
	var passcode="";
	if (typeof isprotected != 'undefined') {
		if (isprotected==true) {
			bootbox.prompt($.i18n("Please enter Password")+":", function(result) {
				if (result === null) {
					return;
				} else {
					if (result=="") {
						return;
					}
					passcode=result;
					SwitchSceneInt(idx,switchcmd, refreshfunction, passcode);
				}
			});
		}
		else {
			SwitchSceneInt(idx,switchcmd, refreshfunction, passcode);
		}
	}
	else {
		SwitchSceneInt(idx,switchcmd, refreshfunction, passcode);
	}
}

function ResetSecurityStatus(idx,switchcmd, refreshfunction)
{
	if (window.my_config.userrights==0) {
        HideNotify();
		ShowNotify($.i18n('You do not have permission to do that!'), 2500, true);
		return;
	}

  clearInterval($.myglobals.refreshTimer);
  ShowNotify($.i18n('Switching') + ' ' + $.i18n(switchcmd));
 
  $.ajax({
     url: "json.htm?type=command&param=resetsecuritystatus&idx=" + idx + "&switchcmd=" + switchcmd,
     async: false, 
     dataType: 'json',
     success: function(data) {
      //wait 1 second
      setTimeout(function() {
        HideNotify();
        refreshfunction();
      }, 1000);
     },
     error: function(){
        HideNotify();
        alert($.i18n('Problem sending switch command'));
     }     
  });
}

function RefreshLightLogTable(idx)
{
	var mTable = $($.content + ' #lighttable');
	var oTable = mTable.dataTable();
	oTable.fnClearTable();
  
	$.ajax({
		url: "json.htm?type=lightlog&idx=" + idx, 
		async: false, 
		dataType: 'json',
		success: function(data) {
			if (typeof data.result != 'undefined') {
				var datatable = [];
				var chart=$.LogChart.highcharts();
				var ii=0;
				$.each(data.result, function(i,item){
					var addId = oTable.fnAddData([
						  item.Date,
						  item.Data
						],false);
					var level=-1;
					if (
						(item.Data.indexOf('Off') >= 0)||
						(item.Data.indexOf('Disarm') >= 0)||
						(item.Data.indexOf('No Motion') >= 0)||
						(item.Data.indexOf('Normal') >= 0)
						) {
						level=0;
					}
					else if (item.Data.indexOf('Set Level:') == 0) {
						var lstr=item.Data.substr(11);
						var idx=lstr.indexOf('%');
						if (idx!=-1) {
							lstr=lstr.substr(0,idx-1);
							level=parseInt(lstr);
						}
					}
					else {
						var idx=item.Data.indexOf('Level: ');
						if (idx!=-1)
						{
							var lstr=item.Data.substr(idx+7);
							var idx=lstr.indexOf('%');
							if (idx!=-1) {
								lstr=lstr.substr(0,idx-1);
								level=parseInt(lstr);
								if (level>100) {
									level=100;
								}
							}
						}
						else {
							level=100;
						}
					}
					if (level!=-1) {
						datatable.unshift( [GetUTCFromStringSec(item.Date), level ] );
					}
				});
				mTable.fnDraw();
				chart.series[0].setData(datatable);
			}
		}
	});
}

function ClearLightLog()
{
	if (window.my_config.userrights!=2) {
        HideNotify();
		ShowNotify($.i18n('You do not have permission to do that!'), 2500, true);
		return;
	}
	var bValid = false;
	bValid=(confirm($.i18n("Are you sure to delete the Log?\n\nThis action can not be undone!"))==true);
	if (bValid == false)
		return;
	$.ajax({
		 url: "json.htm?type=command&param=clearlightlog&idx=" + $.devIdx,
		 async: false, 
		 dataType: 'json',
		 success: function(data) {
				RefreshLightLogTable($.devIdx);
		 },
		 error: function(){
				HideNotify();
				ShowNotify($.i18n('Problem clearing the Log!'), 2500, true);
		 }     
	});
}

function ShowLightLog(id,name,content,backfunction)
{
	clearInterval($.myglobals.refreshTimer);
	$.content=content;

	$.devIdx=id;

	$('#modal').show();
	var htmlcontent = '';
	htmlcontent='<p><h2><span data-i18n="Name"></span>: ' + name + '</h2></p>\n';
	htmlcontent+=$('#lightlog').html();
	$($.content).html(GetBackbuttonHTMLTable(backfunction)+htmlcontent);
	$($.content).i18n();
	$.LogChart = $($.content + ' #lightgraph');
	$.LogChart.highcharts({
		chart: {
		  type: 'line',
		  zoomType: 'x',
		  marginRight: 10
		},
		credits: {
		  enabled: true,
		  href: "http://www.domoticz.com",
		  text: "Domoticz.com"
		},
		title: {
			text: null
		},
		xAxis: {
			type: 'datetime'
		},
		yAxis: {
			title: {
				text: $.i18n('Percentage') +' (%)'
			},
			endOnTick: false,
			startOnTick: false
		},
		tooltip: {
			formatter: function() {
					return ''+
					Highcharts.dateFormat('%A<br/>%Y-%m-%d %H:%M:%S', this.x) +': '+ this.y +' %';
			}
		},
		plotOptions: {
			line: {
				lineWidth: 3,
				states: {
					hover: {
						lineWidth: 3
					}
				},
				marker: {
					enabled: false,
					states: {
						hover: {
							enabled: true,
							symbol: 'circle',
							radius: 5,
							lineWidth: 1
						}
					}
				}
			}
		},
		series: [{
			showInLegend: false,
			name: 'percent',
			step: 'left'
		}]
		,
		navigation: {
			menuItemStyle: {
				fontSize: '10px'
			}
		}
	});
  
  var oTable = $($.content + ' #lighttable').dataTable( {
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

	RefreshLightLogTable($.devIdx);
  $('#modal').hide();
  return false;
}

function GetNotificationSettings()
{
	var nsettings = {};

	nsettings.type=$($.content + " #notificationparamstable #combotype").val();
	var whenvisible=$($.content + " #notificationparamstable #notiwhen").is(":visible");
	if (whenvisible==false) {
		nsettings.when=0;
		nsettings.value=0;
	}
	else {
		nsettings.when=$($.content + " #notificationparamstable #combowhen").val();
		nsettings.value=$($.content + " #notificationparamstable #value").val();
		if ((nsettings.value=="")||(isNaN(nsettings.value)))
		{
			ShowNotify($.i18n('Please correct the Value!'), 2500, true);
			return null;
		}
	}
	nsettings.priority=$($.content + " #notificationparamstable #combopriority").val();
  if ((nsettings.priority=="")||(isNaN(nsettings.priority)))
	{
		ShowNotify($.i18n('Please select a Priority level!'), 2500, true);
		return null;
	}
	return nsettings;
}

function ClearNotifications()
{
	var bValid = false;
	bValid=(confirm($.i18n("Are you sure to delete ALL notifications?\n\nThis action can not be undone!!"))==true);
	if (bValid == false)
		return;

	$.ajax({
		 url: "json.htm?type=command&param=clearnotifications&idx=" + $.devIdx,
		 async: false, 
		 dataType: 'json',
		 success: function(data) {
			RefreshNotificationTable($.devIdx);
		 },
		 error: function(){
				HideNotify();
				ShowNotify($.i18n('Problem clearing notifications!'), 2500, true);
		 }     
	});
}

function UpdateNotification(idx)
{
	var nsettings=GetNotificationSettings();
	if (nsettings==null) {
		return;
	}
	$.ajax({
		 url: "json.htm?type=command&param=updatenotification&idx=" + idx + 
					"&devidx=" + $.devIdx +
					"&ttype=" + nsettings.type +
					"&twhen=" + nsettings.when +
					"&tvalue=" + nsettings.value +
					"&tpriority=" + nsettings.priority,
		 async: false, 
		 dataType: 'json',
		 success: function(data) {
			RefreshNotificationTable($.devIdx);
		 },
		 error: function(){
				HideNotify();
				ShowNotify($.i18n('Problem updating notification!'), 2500, true);
		 }     
	});
}

function DeleteNotification(idx)
{
	var bValid = false;
	bValid=(confirm($.i18n("Are you sure to delete this notification?\n\nThis action can not be undone..."))==true);
	if (bValid == false)
		return;
		
	$.ajax({
		 url: "json.htm?type=command&param=deletenotification&idx=" + idx,
		 async: false, 
		 dataType: 'json',
		 success: function(data) {
			RefreshNotificationTable($.devIdx);
		 },
		 error: function(){
				HideNotify();
				ShowNotify($.i18n('Problem deleting notification!'), 2500, true);
		 }     
	});
}

function AddNotification()
{
	var nsettings=GetNotificationSettings();
	if (nsettings==null)
	{
	alert($.i18n("Invalid Notification Settings"));
		return;
	}
	$.ajax({
		url: "json.htm?type=command&param=addnotification&idx=" + $.devIdx + 
				"&ttype=" + nsettings.type +
				"&twhen=" + nsettings.when +
				"&tvalue=" + nsettings.value +
				"&tpriority=" + nsettings.priority,
		async: false, 
		dataType: 'json',
		success: function(data) {
			if (data.status != "OK") {
				HideNotify();
				ShowNotify($.i18n('Problem adding notification!<br>Duplicate Value?'), 2500, true);
				return;
			}
			RefreshNotificationTable($.devIdx);
		},
		error: function(){
			HideNotify();
			ShowNotify($.i18n('Problem adding notification!'), 2500, true);
		}     
	});
}

function RefreshNotificationTable(idx)
{
  $('#modal').show();

	$($.content + ' #updelclr #notificationupdate').attr("class", "btnstyle3-dis");
	$($.content + ' #updelclr #notificationdelete').attr("class", "btnstyle3-dis");

  var oTable = $($.content + ' #notificationtable').dataTable();
  oTable.fnClearTable();
  
  $.ajax({
     url: "json.htm?type=notifications&idx=" + idx, 
     async: false, 
     dataType: 'json',
     success: function(data) {
      if (typeof data.result != 'undefined') {
        $.each(data.result, function(i,item){
			var parts = item.Params.split(';');
			var nvalue=0;
			if (parts.length>1) {
				nvalue=parts[2];
			}
			var whenstr = "";
			
			var ntype="";
			var stype="";
			if (parts[0]=="T")
			{
				ntype=$.i18n("Temperature");
				stype=" &deg; " + $.myglobals.tempsign;
			}
			else if (parts[0]=="D")
			{
				ntype=$.i18n("Dew Point");
				stype=" &deg; " + $.myglobals.tempsign;
			}
			else if (parts[0]=="H")
			{
				ntype=$.i18n("Humidity");
				stype=" %";
			}
			else if (parts[0]=="R")
			{
				ntype=$.i18n("Rain");
				stype=" mm";
			}
			else if (parts[0]=="W")
			{
				ntype=$.i18n("Wind");
				stype=" " + $.myglobals.windsign;
			}
			else if (parts[0]=="U")
			{
				ntype=$.i18n("UV");
				stype=" UVI";
			}
			else if (parts[0]=="M")
			{
				ntype=$.i18n("Usage");
			}
			else if (parts[0]=="B")
			{
				ntype=$.i18n("Baro");
				stype=" hPa";
			}
			else if (parts[0]=="S")
			{
				ntype=$.i18n("Switch On");
			}
			else if (parts[0]=="O")
			{
				ntype=$.i18n("Switch Off");
			}
			else if (parts[0]=="E")
			{
				ntype=$.i18n("Today");
				stype=" kWh";
			}
			else if (parts[0]=="G")
			{
				ntype=$.i18n("Today");
				stype=" m3";
			}
			else if (parts[0]=="1")
			{
				ntype=$.i18n("Ampere 1");
				stype=" A";
			}
			else if (parts[0]=="2")
			{
				ntype=$.i18n("Ampere 2");
				stype=" A";
			}
			else if (parts[0]=="3")
			{
				ntype=$.i18n("Ampere 3");
				stype=" A";
			}
			else if (parts[0]=="P")
			{
				ntype=$.i18n("Percentage");
				stype=" %";
			}

			var nwhen="";
			if (ntype==$.i18n("Switch On")) {
				whenstr=$.i18n("On");
			}
			else if (ntype==$.i18n("Switch Off")) {
				whenstr=$.i18n("Off");
			}
			else if (ntype==$.i18n("Dew Point")) {
				whenstr=$.i18n("Dew Point");
			}
			else {
				if (parts[1]==">") {
					nwhen=$.i18n("Greater") + " ";
				}
				else {
					nwhen=$.i18n("Below") + " ";
				}
				whenstr= nwhen + nvalue + stype;
			}
			var priorityStr="";
			if (item.Priority==-2) {
        priorityStr=$.i18n("Very Low");
			}	
			else if (item.Priority==-1) {
        priorityStr=$.i18n("Moderate");
			}
			else if (item.Priority==0) {
        priorityStr=$.i18n("Normal");
			}
			else if (item.Priority==1) {
        priorityStr=$.i18n("High");
			}
			else if (item.Priority==2) {
        priorityStr=$.i18n("Emergency");
			}
			var addId = oTable.fnAddData( {
				"DT_RowId": item.idx,
				"nvalue" : nvalue,
				"Priority": item.Priority,
				"0": ntype,
				"1": whenstr,
				"2": priorityStr
			} );
		});
      }
     }
  });
	/* Add a click handler to the rows - this could be used as a callback */
	$($.content + " #notificationtable tbody").off();
	$($.content + " #notificationtable tbody").on( 'click', 'tr', function () {
		if ( $(this).hasClass('row_selected') ) {
			$(this).removeClass('row_selected');
			$($.content + ' #updelclr #notificationupdate').attr("class", "btnstyle3-dis");
			$($.content + ' #updelclr #notificationdelete').attr("class", "btnstyle3-dis");
		}
		else {
			var oTable = $($.content + ' #notificationtable').dataTable();
			oTable.$('tr.row_selected').removeClass('row_selected');
			$(this).addClass('row_selected');
			$($.content + ' #updelclr #notificationupdate').attr("class", "btnstyle3");
			$($.content + ' #updelclr #notificationdelete').attr("class", "btnstyle3");
			var anSelected = fnGetSelected( oTable );
			if ( anSelected.length !== 0 ) {
				var data = oTable.fnGetData( anSelected[0] );
				var idx= data["DT_RowId"];
				$.myglobals.SelectedNotificationIdx=idx;
				$($.content + " #updelclr #notificationupdate").attr("href", "javascript:UpdateNotification(" + idx + ")");
				$($.content + " #updelclr #notificationdelete").attr("href", "javascript:DeleteNotification(" + idx + ")");
				//update user interface with the paramters of this row
				$($.content + " #notificationparamstable #combotype").val(GetValTextInNTypeStrArray(data["0"]));
				ShowNotificationTypeLabel();
				var matchstr="^" + $.i18n("Greater");
				if (data["1"].match(matchstr)) {
					$($.content + " #notificationparamstable #combowhen").val(0);
				}
				else {
					$($.content + " #notificationparamstable #combowhen").val(1);
				}
				$($.content + " #notificationparamstable #value").val(data["nvalue"]);
				$($.content + " #notificationparamstable #combopriority").val(data["Priority"]);
			}
		}
	}); 
  
  $('#modal').hide();
}

function ShowNotificationTypeLabel()
{
	var typetext = $($.content + " #notificationparamstable #combotype option:selected").text();
	
	if (
		(typetext == $.i18n("Switch On"))||
		(typetext == $.i18n("Switch Off"))||
		(typetext == $.i18n("Dew Point"))
		) {
		$($.content + " #notificationparamstable #notiwhen").hide();
		$($.content + " #notificationparamstable #notival").hide();
		return;
	}
	$($.content + " #notificationparamstable #notiwhen").show();
	$($.content + " #notificationparamstable #notival").show();
	
	if (typetext == $.i18n('Temperature'))
		$($.content + " #notificationparamstable #valuetype").html('&nbsp;&deg; ' + $.myglobals.tempsign);
	else if (typetext == $.i18n('Dew Point'))
		$($.content + " #notificationparamstable #valuetype").html('&nbsp;&deg; ' + $.myglobals.tempsign);
	else if (typetext == $.i18n('Humidity'))
		$($.content + " #notificationparamstable #valuetype").html('&nbsp;%');
	else if (typetext == $.i18n('UV'))
		$($.content + " #notificationparamstable #valuetype").html('&nbsp;UVI');
	else if (typetext == $.i18n('Rain'))
		$($.content + " #notificationparamstable #valuetype").html('&nbsp;mm');
	else if (typetext == $.i18n('Wind'))
		$($.content + " #notificationparamstable #valuetype").html('&nbsp;' + $.myglobals.windsign);
	else if (typetext == $.i18n('Baro'))
		$($.content + " #notificationparamstable #valuetype").html('&nbsp;hPa');
	else if (typetext == $.i18n('Usage'))
		$($.content + " #notificationparamstable #valuetype").html('&nbsp;');
	else if (typetext == $.i18n('Today'))
		$($.content + " #notificationparamstable #valuetype").html('&nbsp;');
	else if (typetext == $.i18n('Total'))
		$($.content + " #notificationparamstable #valuetype").html('&nbsp;');
	else if (typetext == $.i18n('Ampere 1'))
		$($.content + " #notificationparamstable #valuetype").html('&nbsp;A');
	else if (typetext == $.i18n('Ampere 2'))
		$($.content + " #notificationparamstable #valuetype").html('&nbsp;A');
	else if (typetext == $.i18n('Ampere 3'))
		$($.content + " #notificationparamstable #valuetype").html('&nbsp;A');
	else if (typetext == $.i18n('Percentage'))
		$($.content + " #notificationparamstable #valuetype").html('&nbsp;%');
	else if (typetext == $.i18n('RPM'))
		$($.content + " #notificationparamstable #valuetype").html('&nbsp;RPM');
	else
		$($.content + " #notificationparamstable #valuetype").html('&nbsp;??');
}

function GetValTextInNTypeStrArray(stext)
{
	var pos=-1;
	$.each($.NTypeStr, function(i,item){
		if ($.i18n(item.text) == stext)
		{
			pos = item.val;
		}
	});

	return pos;
}

function ShowNotifications(id,name,content,backfunction)
{
  clearInterval($.myglobals.refreshTimer);
  $.devIdx=id;
  $.content=content;
  
  $.NTypeStr = [];

	$.ajax({
		 url: "json.htm?type=command&param=getnotificationtypes&idx=" + $.devIdx,
		 async: false, 
		 dataType: 'json',
		 success: function(data) {
		 
				if (typeof data.result != 'undefined') {
					$.each(data.result, function(i,item){
						$.NTypeStr.push({
							val: item.val,
							text: item.text,
							tag: item.ptag
						 }
						);
					});
				}
				
				var oTable;
				
				$('#modal').show();
				var htmlcontent = '';
				htmlcontent='<p><h2><span data-i18n="Name"></span>: ' + name + '</h2></p><br>\n';
				htmlcontent+=$('#editnotifications').html();
				$($.content).html(GetBackbuttonHTMLTable(backfunction)+htmlcontent);
				$($.content).i18n();
				
				//add types to combobox
				$.each($.NTypeStr, function(i,item){
					var option = $('<option />');
					option.attr('value', item.val).text($.i18n(item.text));
					$($.content + ' #notificationparamstable #combotype').append(option);
				});
				
				oTable = $($.content + ' #notificationtable').dataTable( {
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

				$($.content + " #notificationparamstable #combotype").change(function() {
					ShowNotificationTypeLabel();
				});
			 
				ShowNotificationTypeLabel();
				$('#modal').hide();
				RefreshNotificationTable(id);
		 },
		 error: function(){
				HideNotify();
				ShowNotify($.i18n('Problem clearing notifications!'), 2500, true);
		 }     
	});
}

function ShowForecast(forecast_url,name,content,backfunction)
{
  clearInterval($.myglobals.refreshTimer);
  $.content=content;
	var htmlcontent = '';
	htmlcontent='<iframe class="cIFrame" id="IMain" src="' + forecast_url + '"></iframe>';
	$($.content).html(GetBackbuttonHTMLTable(backfunction)+htmlcontent);
	$($.content).i18n();
}

function GetUTCFromString(s)
{
    return Date.UTC(
      parseInt(s.substring(0, 4), 10),
      parseInt(s.substring(5, 7), 10) - 1,
      parseInt(s.substring(8, 10), 10),
      parseInt(s.substring(11, 13), 10),
      parseInt(s.substring(14, 16), 10),
      0
    );
}

function GetUTCFromStringSec(s)
{
    return Date.UTC(
      parseInt(s.substring(0, 4), 10),
      parseInt(s.substring(5, 7), 10) - 1,
      parseInt(s.substring(8, 10), 10),
      parseInt(s.substring(11, 13), 10),
      parseInt(s.substring(14, 16), 10),
      parseInt(s.substring(17, 19), 10)
    );
}

function GetDateFromString(s)
{
    return Date.UTC(
      parseInt(s.substring(0, 4), 10),
      parseInt(s.substring(5, 7), 10) - 1,
      parseInt(s.substring(8, 10), 10));
}

function GetPrevDateFromString(s)
{
    return Date.UTC(
      parseInt(s.substring(0, 4), 10)+1,
      parseInt(s.substring(5, 7), 10) - 1,
      parseInt(s.substring(8, 10), 10));
}

function cursorhand()
{
    document.body.style.cursor = "pointer";
}

function cursordefault()
{
   document.body.style.cursor = "default";
}
      
function ShowNotify(txt, timeout, iserror)
{
	$("#notification").html('<p>' + txt + '</p>');
	
	if (typeof iserror != 'undefined') {
		$("#notification").css("background-color","red");
	} else {
		$("#notification").css("background-color","#204060");
	}
	$("#notification").center();
	$("#notification").fadeIn("slow");

	if (typeof timeout != 'undefined') {
		setTimeout(function() {
			HideNotify();
		}, timeout);
	}
}

function HideNotify()
{
	$("#notification").hide();
}

function ChangeClass(elemname, newclass)
{
	document.getElementById(elemname).setAttribute("class", newclass);
}

function GetLayoutFromURL()
{
	var page = window.location.hash.substr(1);
	return page!=""?page:'Dashboard';
}

function SetLayoutURL(name)
{
	window.location.hash = name;
}

function SwitchLayout(layout)
{
	if (layout.indexOf('templates')==0) {
		$("#main-view").load(layout+".html", function(response, status, xhr) {
			if (status == "error") {
				var msg = "Sorry but there was an error: ";
				$("#main-view").html(msg + xhr.status + " " + xhr.statusText);
			}
		});
		return;
	}
	if (layout=="Restart") {
		var bValid = false;
		bValid=(confirm($.i18n("Are you sure to Restart the system?"))==true);
		if ( bValid ) {
			$.ajax({
			 url: "json.htm?type=command&param=system_reboot",
			 async: true, 
			 dataType: 'json',
			 success: function(data) {
			 },
			 error: function(){
			 }     
			});
			alert($.i18n("Restarting System (This could take some time...)"));
		}
		return;
	}
	else if (layout=="Shutdown") {
		var bValid = false;
		bValid=(confirm($.i18n("Are you sure to Shutdown the system?"))==true);
		if ( bValid ) {
			$.ajax({
			 url: "json.htm?type=command&param=system_shutdown",
			 async: true, 
			 dataType: 'json',
			 success: function(data) {
			 },
			 error: function(){
			 }     
			});
			alert($.i18n("The system is being Shutdown (This could take some time...)"));
		}
		return;
	}
	var fullLayout = layout;
	var hyphen = layout.indexOf('-');
	if( hyphen >= 0 ){
		layout = layout.substr(0, hyphen);
	}

	clearInterval($.myglobals.refreshTimer);
	$.myglobals.prevlayout = $.myglobals.layout;
	$.myglobals.actlayout = layout;
	$.myglobals.layoutFull = fullLayout;
	$.myglobals.layoutParameters = fullLayout.substr(hyphen+1);

	if (window.my_config.userrights!=2) {
		if ((layout=='Setup')||(layout=='Users')||(layout=='Cam')||(layout=='Events')||(layout=='Hardware')||(layout=='Devices')||(layout=='Restoredatabase')) {
			layout='Dashboard';
		}
	}

	if ((layout=="Dashboard")&&($.myglobals.DashboardType==3))
	{
		layout='Floorplans';
	}
	
	window.location = '/#' + layout;
	return;
	alert(layout);
	var durl=layout.toLowerCase()+".html";
	if (layout == "LightSwitches") {
		durl='lights.html';
	}

	if ($.myglobals.dontcache == false)
	{
		//stop chaching these pages
		var dt = new Date();
		durl+='?sid='+dt.getTime();
	}

	if(GetLayoutFromURL() != fullLayout) SetLayoutURL(fullLayout);
	
	$(".bannercontent").load(durl, function(response, status, xhr) {
		if (status == "error") {
			var msg = "Sorry but there was an error: ";
			$(".bannercontent").html(msg + xhr.status + " " + xhr.statusText);
		}
	});

	$('.btn-navbar').addClass('collapsed');
	$('.nav-collapse').removeClass('in').css('height', '0');	
}

function checkLength( o, min, max ) 
{
			if ( o.val().length > max || o.val().length < min ) {
					return false;
			} else {
					return true;
			}
}

function SetDimValue(idx, value)
{
	clearInterval($.setDimValue);

	if (window.my_config.userrights==0) {
        HideNotify();
		ShowNotify($.i18n('You do not have permission to do that!'), 2500, true);
		return;
	}

	$.ajax({
		 url: "json.htm?type=command&param=switchlight&idx=" + idx + "&switchcmd=Set%20Level&level=" + value,
		 async: false, 
		 dataType: 'json'
	});
}

//Some helper for browser detection
function matchua ( ua ) 
{
	ua = ua.toLowerCase();

	var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
		/(webkit)[ \/]([\w.]+)/.exec( ua ) ||
		/(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
		/(msie) ([\w.]+)/.exec( ua ) ||
		ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
		[];

	return {
		browser: match[ 1 ] || "",
		version: match[ 2 ] || "0"
	};
}

function Get5MinuteHistoryDaysGraphTitle()
{
	if ($.FiveMinuteHistoryDays==1) {
		return $.i18n("Last") + " 24 " + $.i18n("Hours");
	}
	else if  ($.FiveMinuteHistoryDays==2) {
		return $.i18n("Last") + " 48 " + $.i18n("Hours");
	}
	return $.i18n("Last") + " " + $.FiveMinuteHistoryDays + " " + $.i18n("Days");
}

function GenerateCamImageURL(address,port,username,password,imageurl)
{
	var feedsrc="http://";
	var bHaveUPinURL=(imageurl.indexOf("#USERNAME") != -1)||(imageurl.indexOf("#PASSWORD") != -1);
	if (!bHaveUPinURL) {
		if (username!="")
		{
			feedsrc+=username+":"+password+"@";
		}
	}
	feedsrc+=address;
	if (port!=80) {
		feedsrc+=":"+port;
	}
	feedsrc+="/" + imageurl;
	if (bHaveUPinURL) {
		feedsrc=feedsrc.replace("#USERNAME",username);
		feedsrc=feedsrc.replace("#PASSWORD",password);
	}
	return feedsrc;
}

function GetTemp48Item(temp)
{
	if ($.myglobals.tempsign=="C") {
		if (temp<=0) {
			return "ice.png";
		}
		if (temp<5) {
			return "temp-0-5.png";
		}
		if (temp<10) {
			return "temp-5-10.png";
		}
		if (temp<15) {
			return "temp-10-15.png";
		}
		if (temp<20) {
			return "temp-15-20.png";
		}
		if (temp<25) {
			return "temp-20-25.png";
		}
		if (temp<30) {
			return "temp-25-30.png";
		}
		return "temp-gt-30.png";
	}
	else {
		if (temp<=32) {
			return "ice.png";
		}
		if (temp<41) {
			return "temp-0-5.png";
		}
		if (temp<50) {
			return "temp-5-10.png";
		}
		if (temp<59) {
			return "temp-10-15.png";
		}
		if (temp<68) {
			return "temp-15-20.png";
		}
		if (temp<77) {
			return "temp-20-25.png";
		}
		if (temp<86) {
			return "temp-25-30.png";
		}
		return "temp-gt-30.png";
	}
}

function generate_noty(ntype, ntext, ntimeout) {
	return noty({
		text: ntext,
		type: ntype,
		dismissQueue: true,
		timeout: ntimeout,
		layout: 'topRight',
		theme: 'defaultTheme'
	});
}

function rgb2hex(rgb) {
	if (  rgb.search("rgb") == -1 ) {
			return rgb;
	} else {
			rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
			function hex(x) {
					 return ("0" + parseInt(x).toString(16)).slice(-2);
			}
			return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
	}
}

function chartPointClick(event, retChart) {
	if (event.shiftKey!=true) {
		return;
	}
	if (window.my_config.userrights!=2) {
        HideNotify();
		ShowNotify($.i18n('You do not have permission to do that!'), 2500, true);
		return;
	}
	var dateString=Highcharts.dateFormat('%Y-%m-%d', event.point.x);
	var bValid = false;
	bValid=(confirm($.i18n("Are you sure to remove this value at") + " ?:\n\nDate: " + dateString + " \nValue: " + event.point.y)==true);
	if (bValid == false) {
		return;
	}
	alert($.devIdx);
	$.ajax({
		 url: "json.htm?type=command&param=deletedatapoint&idx=" + $.devIdx + "&date=" + dateString,
		 async: false, 
		 dataType: 'json',
		 success: function(data) {
			if (data.status == "OK") {
				retChart($.devIdx,$.devName);
			}
			else {
				ShowNotify($.i18n('Problem deleting data point!'), 2500, true);
			}
		 },
		 error: function(){
			ShowNotify($.i18n('Problem deleting data point!'), 2500, true);
		 }     
	}); 	
}

function chartPointClickNew(event, isShort, retChart) {
	if (event.shiftKey!=true) {
		return;
	}
	if (window.my_config.userrights!=2) {
        HideNotify();
		ShowNotify($.i18n('You do not have permission to do that!'), 2500, true);
		return;
	}
	var dateString;
	if (isShort==false) {
		dateString=Highcharts.dateFormat('%Y-%m-%d', event.point.x);
	}
	else {
		dateString=Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', event.point.x);
	}
	var bValid = false;
	bValid=(confirm($.i18n("Are you sure to remove this value at") + " ?:\n\nDate: " + dateString + " \nValue: " + event.point.y)==true);
	if (bValid == false) {
		return;
	}
	$.ajax({
		 url: "json.htm?type=command&param=deletedatapoint&idx=" + $.devIdx + "&date=" + dateString,
		 async: false, 
		 dataType: 'json',
		 success: function(data) {
			if (data.status == "OK") {
				retChart($.content,$.backfunction,$.devIdx,$.devName);
			}
			else {
				ShowNotify($.i18n('Problem deleting data point!'), 2500, true);
			}
		 },
		 error: function(){
			ShowNotify($.i18n('Problem deleting data point!'), 2500, true);
		 }     
	}); 	
}

function chartPointClickEx(event, retChart) {
	if (event.shiftKey!=true) {
		return;
	}
	if (window.my_config.userrights!=2) {
        HideNotify();
		ShowNotify($.i18n('You do not have permission to do that!'), 2500, true);
		return;
	}
	var dateString=Highcharts.dateFormat('%Y-%m-%d', event.point.x);
	var bValid = false;
	bValid=(confirm($.i18n("Are you sure to remove this value at") + " ?:\n\nDate: " + dateString + " \nValue: " + event.point.y)==true);
	if (bValid == false) {
		return;
	}
	$.ajax({
		 url: "json.htm?type=command&param=deletedatapoint&idx=" + $.devIdx + "&date=" + dateString,
		 async: false, 
		 dataType: 'json',
		 success: function(data) {
			if (data.status == "OK") {
				retChart($.devIdx,$.devName,$.devSwitchType);
			}
			else {
				ShowNotify($.i18n('Problem deleting data point!'), 2500, true);
			}
		 },
		 error: function(){
			ShowNotify($.i18n('Problem deleting data point!'), 2500, true);
		 }     
	}); 	
}

function chartPointClickNewEx(event, isShort, retChart) {
	if (event.shiftKey!=true) {
		return;
	}
	if (window.my_config.userrights!=2) {
        HideNotify();
		ShowNotify($.i18n('You do not have permission to do that!'), 2500, true);
		return;
	}
	var dateString;
	if (isShort==false) {
		dateString=Highcharts.dateFormat('%Y-%m-%d', event.point.x);
	}
	else {
		dateString=Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', event.point.x);
	}
	var bValid = false;
	bValid=(confirm($.i18n("Are you sure to remove this value at") + " ?:\n\nDate: " + dateString + " \nValue: " + event.point.y)==true);
	if (bValid == false) {
		return;
	}
	$.ajax({
		 url: "json.htm?type=command&param=deletedatapoint&idx=" + $.devIdx + "&date=" + dateString,
		 async: false, 
		 dataType: 'json',
		 success: function(data) {
			if (data.status == "OK") {
				retChart($.content,$.backfunction,$.devIdx,$.devName,$.devSwitchType);
			}
			else {
				ShowNotify($.i18n('Problem deleting data point!'), 2500, true);
			}
		 },
		 error: function(){
			ShowNotify($.i18n('Problem deleting data point!'), 2500, true);
		 }     
	}); 	
}

function ExportChart2CSV(chart)
{
	var csv = "";
	for (var i = 0; i < chart.series.length; i++) {
		var series = chart.series[i];
		for (var j = 0; j < series.data.length; j++) {
			if (series.data[j] != undefined && series.data[j].x >= series.xAxis.min && series.data[j].x <= series.xAxis.max) {
				csv = csv + series.name + ',' + Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', series.data[j].x) + ',' + series.data[j].y + '\r\n';
			}
		}
	}
  
	var w = window.open('','csvWindow'); // popup, may be blocked though
	// the following line does not actually do anything interesting with the 
	// parameter given in current browsers, but really should have. 
	// Maybe in some browser it will. It does not hurt anyway to give the mime type
	w.document.open("text/csv");
	w.document.write(csv); // the csv string from for example a jquery plugin
	w.document.close();
}

function EnableDisableTabs()
{
	$.ajax({
		 url: "json.htm?type=command&param=getactivetabs",
		 async: false, 
		 dataType: 'json',
		 success: function(data) {
			if (typeof data.language != 'undefined') {
				SetLanguage(data.language);
			}
			else {
				SetLanguage('en');
			}
		
			$.myglobals.ismobileint=false;
			if (typeof data.MobileType != 'undefined') {
				if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
					$.myglobals.ismobile=true;
					$.myglobals.ismobileint=true;
				}
				if (data.MobileType!=0) {
					if(!(/iPhone/i.test(navigator.userAgent) )) {
						$.myglobals.ismobile=false;
					}
				}
			}
			
			$.myglobals.DashboardType=data.DashboardType;
			$.myglobals.totFloorplans = data.TotFloorplans;
			
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
			if (typeof data.Latitude != 'undefined') {
				$.myglobals.Latitude=data.Latitude;
				$.myglobals.Longitude=data.Longitude;
			}
			if (typeof data.dontcachehtml != 'undefined') {
				$.myglobals.dontcache=data.dontcachehtml;
			}

			var bAnyTabEnabled=false;
			if ((data.result["EnableTabFloorplans"]==0)||($.myglobals.DashboardType==3)) {
				$(".clFloorplans").hide();
			}
			else {
				$(".clFloorplans").show();
				bAnyTabEnabled=true;
			}
			if (data.result["EnableTabLights"]==0) {
				$(".clLightSwitches").hide();
			}
			else {
				$(".clLightSwitches").show();
				bAnyTabEnabled=true;
			}
			if (data.result["EnableTabScenes"]==0) {
				$(".clScenes").hide();
			}
			else {
				$(".clScenes").show();
				bAnyTabEnabled=true;
			}
			if (data.result["EnableTabTemp"]==0) {
				$(".clTemperature").hide();
			}
			else {
				$(".clTemperature").show();
				bAnyTabEnabled=true;
			}
			if (data.result["EnableTabWeather"]==0) {
				$(".clWeather").hide();
			}
			else {
				$(".clWeather").show();
				bAnyTabEnabled=true;
			}
			if (data.result["EnableTabUtility"]==0) {
				$(".clUtility").hide();
			}
			else {
				$(".clUtility").show();
				bAnyTabEnabled=true;
			}
			if (bAnyTabEnabled==false) {
				//nothing enabled, no need to show dashboard tab
				$(".clDashboard").hide();
			}
			
			var customHTML="";
			if (typeof data.result.templates!= 'undefined') {
				$.each(data.result.templates, function(i,item)
				{
					var cFile=item;
					var cName=cFile.charAt(0).toUpperCase() + cFile.slice(1);
					var cURL="templates/"+cFile;
					customHTML+='<li><a href="javascript:SwitchLayout(\'' + cURL + '\')">' + cName + '</a></li>';
				});
			}
			if (customHTML!="") {
				$("#custommenu").html(customHTML);
				$(".clcustommenu").show();
			}
		 },
		 error: function(){
			//alert($.i18n("Error communicating to server!"));
		 }     
	});
}

function SetLanguage(lng)
{
	$.i18n.debug = false;
	var i18n = $.i18n();
	var language='no';
	i18n.locale = lng;
	i18n.load( 'i18n/domoticz-' + i18n.locale + '.json', i18n.locale );
	$(".nav").i18n();
}

function TranslateStatus(status)
{
	//should of course be changed, but for now a quick sollution
	if (status.indexOf("Set Level") != -1) {
		return status.replace("Set Level",$.i18n('Set Level'));
	}
	else {
		return $.i18n(status);
	}
}

function ShowGeneralGraph(contentdiv,backfunction,id,name,switchtype,sensortype)
{
	clearInterval($.myglobals.refreshTimer);
  $('#modal').show();
  $.content=contentdiv;
  $.backfunction=backfunction;
  $.devIdx=id;
  $.devName=name;
  var htmlcontent = '';
  htmlcontent='<p><center><h2>' + name + '</h2></center></p>\n';
  htmlcontent+=$('#globaldaylog').html();
  
  var txtLabelOrg=sensortype;
  var txtUnit="?";
  
  if (sensortype=="Visibility") {
	txtUnit="km";
	if (switchtype==1) {
		txtUnit="mi";
	}
  }
  else if (sensortype=="Radiation") {
	txtUnit="Watt/m2";
  }
  else if (sensortype=="Pressure") {
	txtUnit="Bar";
  }
  else if (sensortype=="Soil Moisture") {
	txtUnit="cb";
  }
  else if (sensortype=="Leaf Wetness") {
	txtUnit="Range";
  }
  else if ((sensortype=="Voltage")||(sensortype=="A/D")) {
	txtUnit="mV";
  }
  else if (sensortype=="VoltageGeneral") {
	txtLabelOrg="Voltage";
	txtUnit="V";
  }
  else if (switchtype=="Weight") {
	txtUnit="kg";
  }
  else {
	return;
  }
  $($.content).html(GetBackbuttonHTMLTable(backfunction)+htmlcontent);
  $($.content).i18n();
  

  var txtLabel= txtLabelOrg + " (" + txtUnit + ")";

	$.LogChart1 = $($.content + ' #globaldaygraph');
	$.LogChart1.highcharts({
      chart: {
          type: 'spline',
          zoomType: 'x',
          marginRight: 10,
          events: {
              load: function() {
                $.getJSON("json.htm?type=graph&sensor=counter&idx="+id+"&range=day",
                function(data) {
					if (typeof data.result != 'undefined') {
                      var datatable = [];
                      
                      $.each(data.result, function(i,item)
                      {
                        datatable.push( [GetUTCFromString(item.d), parseFloat(item.v) ] );
                      });
                      var series = $.LogChart1.highcharts().series[0];
                      series.setData(datatable);
                    }
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n(txtLabelOrg) + ' '  + Get5MinuteHistoryDaysGraphTitle()
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: txtLabel
            },
			labels: {
				formatter: function() {
					if (txtUnit=="mV") {
						return Highcharts.numberFormat(this.value, 0);
					}
					return this.value;
				}
			},
			min: 0,
            minorGridLineWidth: 0,
            gridLineWidth: 0,
            alternateGridColor: null
        },
        tooltip: {
            formatter: function() {
                    return ''+
                    Highcharts.dateFormat('%A<br/>%Y-%m-%d %H:%M', this.x) +': '+ this.y +' ' + txtUnit;
            }
        },
        plotOptions: {
            spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        series: [{
            name: txtLabelOrg
        }]
        ,
        navigation: {
            menuItemStyle: {
                fontSize: '10px'
            }
        }
    });

	$.LogChart2 = $($.content + ' #globalmonthgraph');
	$.LogChart2.highcharts({
      chart: {
          type: 'spline',
          zoomType: 'x',
          marginRight: 10,
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=counter&idx="+id+"&range=month",
                function(data) {
					if (typeof data.result != 'undefined') {
                      var datatable1 = [];
                      var datatable2 = [];
                      
                      $.each(data.result, function(i,item)
                      {
                        datatable1.push( [GetDateFromString(item.d), parseFloat(item.v_min) ] );
                        datatable2.push( [GetDateFromString(item.d), parseFloat(item.v_max) ] );
                      });
                      
                      var series1 = $.LogChart2.highcharts().series[0];
                      var series2 = $.LogChart2.highcharts().series[1];
                      series1.setData(datatable1);
                      series2.setData(datatable2);
                    }
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n(txtLabelOrg) + ' ' + $.i18n('Last Month')
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: txtLabel
            },
			labels: {
				formatter: function() {
					if (txtUnit=="mV") {
						return Highcharts.numberFormat(this.value, 0);
					}
					return this.value;
				}
			},
            min: 0,
            minorGridLineWidth: 0,
            gridLineWidth: 0,
            alternateGridColor: null
        },
        tooltip: {
            formatter: function() {
                    return ''+
                    Highcharts.dateFormat('%A<br/>%Y-%m-%d %H:%M', this.x) +': '+ this.y +' ' + txtUnit;
            }
        },
        plotOptions: {
            spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        series: [{
            name: 'min',
			point: {
				events: {
					click: function(event) {
						chartPointClick(event,arguments.callee.name);
					}
				}
			}
		}, {
            name: 'max',
			point: {
				events: {
					click: function(event) {
						chartPointClick(event,arguments.callee.name);
					}
				}
			}
        }]
        ,
        navigation: {
            menuItemStyle: {
                fontSize: '10px'
            }
        }
    });

	$.LogChart3 = $($.content + ' #globalyeargraph');
	$.LogChart3.highcharts({
      chart: {
          type: 'spline',
          zoomType: 'x',
          marginRight: 10,
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=counter&idx="+id+"&range=year",
                function(data) {
					if (typeof data.result != 'undefined') {
                      var datatable1 = [];
                      var datatable2 = [];
                      
                      $.each(data.result, function(i,item)
                      {
                        datatable1.push( [GetDateFromString(item.d), parseFloat(item.v_min) ] );
                        datatable2.push( [GetDateFromString(item.d), parseFloat(item.v_max) ] );
                      });
                      var series1 = $.LogChart3.highcharts().series[0];
                      var series2 = $.LogChart3.highcharts().series[1];
                      series1.setData(datatable1);
                      series2.setData(datatable2);
                   }
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n(txtLabelOrg) + ' ' + $.i18n('Last Year')
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: txtLabel
            },
			labels: {
				formatter: function() {
					if (txtUnit=="mV") {
						return Highcharts.numberFormat(this.value, 0);
					}
					return this.value;
				}
			},
            min: 0,
            minorGridLineWidth: 0,
            gridLineWidth: 0,
            alternateGridColor: null
        },
        tooltip: {
            formatter: function() {
                    return ''+
                    Highcharts.dateFormat('%A<br/>%Y-%m-%d %H:%M', this.x) +': '+ this.y +' ' + txtUnit;
            }
        },
        plotOptions: {
            spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        series: [{
            name: 'min',
			point: {
				events: {
					click: function(event) {
						chartPointClick(event,arguments.callee.name);
					}
				}
			}
		}, {
            name: 'max',
			point: {
				events: {
					click: function(event) {
						chartPointClick(event,arguments.callee.name);
					}
				}
			}
        }]
        ,
        navigation: {
            menuItemStyle: {
                fontSize: '10px'
            }
        }
    });
}

function AddDataToTempChart(data,chart,isday)
{
    var datatablete = [];
    var datatabletm = [];
    var datatableta = [];
    var datatabletrange = [];
    
    var datatablehu = [];
    var datatablech = [];
    var datatablecm = [];
    var datatabledp = [];
    var datatableba = [];

    var datatablese = [];
    var datatablesm = [];
    var datatablesx = [];
    var datatablesrange = [];
    
    var datatablete_prev = [];
    var datatabletm_prev = [];
    var datatableta_prev = [];
    var datatabletrange_prev = [];
    
    var datatablehu_prev = [];
    var datatablech_prev = [];
    var datatablecm_prev = [];
    var datatabledp_prev = [];
    var datatableba_prev = [];
    
    var datatablese_prev = [];
    var datatablesm_prev = [];
    var datatablesx_prev = [];
    var datatablesrange_prev = [];

	var bHavePrev=(typeof data.resultprev!= 'undefined');
	if (bHavePrev) {
		$.each(data.resultprev, function(i,item)
		{
			if (typeof item.te != 'undefined') {
				datatablete_prev.push( [GetPrevDateFromString(item.d), parseFloat(item.te) ] );
				datatabletm_prev.push( [GetPrevDateFromString(item.d), parseFloat(item.tm) ] );
				datatabletrange_prev.push( [GetPrevDateFromString(item.d), parseFloat(item.tm), parseFloat(item.te) ] );
				if (typeof item.ta != 'undefined') {
				  datatableta_prev.push( [GetPrevDateFromString(item.d), parseFloat(item.ta) ] );
				}
			}
			if (typeof item.hu != 'undefined') {
			  datatablehu_prev.push( [GetPrevDateFromString(item.d), parseFloat(item.hu) ] );
			}
			if (typeof item.ch != 'undefined') {
			  datatablech_prev.push( [GetPrevDateFromString(item.d), parseFloat(item.ch) ] );
			  datatablecm_prev.push( [GetPrevDateFromString(item.d), parseFloat(item.cm) ] );
			}
			if (typeof item.dp != 'undefined') {
			  datatabledp_prev.push( [GetPrevDateFromString(item.d), parseFloat(item.dp) ] );
			}
			if (typeof item.ba != 'undefined') {
			  datatableba_prev.push( [GetPrevDateFromString(item.d), parseFloat(item.ba) ] );
			}
			if (typeof item.se != 'undefined') {
			  datatablese_prev.push( [GetPrevDateFromString(item.d), parseFloat(item.se) ] );
			}
			if (typeof item.sm != 'undefined' && typeof item.sx != 'undefined') {
			  datatablesm_prev.push( [GetPrevDateFromString(item.d), parseFloat(item.sm) ] );
			  datatablesx_prev.push( [GetPrevDateFromString(item.d), parseFloat(item.sx) ] );
			  datatablesrange_prev.push( [GetPrevDateFromString(item.d), parseFloat(item.sm), parseFloat(item.sx) ] );
			}
		});
	}

    $.each(data.result, function(i,item)
    {
      if (isday==1) {
        if (typeof item.te != 'undefined') {
          datatablete.push( [GetUTCFromString(item.d), parseFloat(item.te) ] );
        }
        if (typeof item.hu != 'undefined') {
          datatablehu.push( [GetUTCFromString(item.d), parseFloat(item.hu) ] );
        }
        if (typeof item.ch != 'undefined') {
          datatablech.push( [GetUTCFromString(item.d), parseFloat(item.ch) ] );
        }
        if (typeof item.dp != 'undefined') {
          datatabledp.push( [GetUTCFromString(item.d), parseFloat(item.dp) ] );
        }
        if (typeof item.ba != 'undefined') {
          datatableba.push( [GetUTCFromString(item.d), parseFloat(item.ba) ] );
        }
        if (typeof item.se != 'undefined') {
          datatablese.push( [GetUTCFromString(item.d), parseFloat(item.se) ] );
        }
      } else {
        if (typeof item.te != 'undefined') {
			datatablete.push( [GetDateFromString(item.d), parseFloat(item.te) ] );
			datatabletm.push( [GetDateFromString(item.d), parseFloat(item.tm) ] );
			datatabletrange.push( [GetDateFromString(item.d), parseFloat(item.tm), parseFloat(item.te) ] );
			if (typeof item.ta != 'undefined') {
			  datatableta.push( [GetDateFromString(item.d), parseFloat(item.ta) ] );
			}
        }
        if (typeof item.hu != 'undefined') {
          datatablehu.push( [GetDateFromString(item.d), parseFloat(item.hu) ] );
        }
        if (typeof item.ch != 'undefined') {
          datatablech.push( [GetDateFromString(item.d), parseFloat(item.ch) ] );
          datatablecm.push( [GetDateFromString(item.d), parseFloat(item.cm) ] );
        }
        if (typeof item.dp != 'undefined') {
          datatabledp.push( [GetDateFromString(item.d), parseFloat(item.dp) ] );
        }
        if (typeof item.ba != 'undefined') {
          datatableba.push( [GetDateFromString(item.d), parseFloat(item.ba) ] );
        }
        if (typeof item.se != 'undefined') {
          datatablese.push( [GetDateFromString(item.d), parseFloat(item.se) ] );//avergae
	  datatablesm.push( [GetDateFromString(item.d), parseFloat(item.sm) ] );//min
	  datatablesx.push( [GetDateFromString(item.d), parseFloat(item.sx) ] );//max
	  datatablesrange.push( [GetDateFromString(item.d), parseFloat(item.sm), parseFloat(item.sx) ] );
        }
      }
    });
    var series;
    if (datatablehu.length!=0)
    {
      chart.addSeries(
        {
          id: 'humidity',
          name: $.i18n('Humidity'),
          color: 'limegreen',
          yAxis: 1,
			tooltip: {
				valueSuffix: ' %',
				valueDecimals: 0
			}					
        }
      );
      series = chart.get('humidity');
      series.setData(datatablehu);
    }

    if (datatablech.length!=0)
    {
      chart.addSeries(
        {
          id: 'chill',
          name: $.i18n('Chill'),
          color: 'red',
		  zIndex: 1,
			tooltip: {
				valueSuffix: ' \u00B0' + $.myglobals.tempsign,
				valueDecimals: 1
			},
          yAxis: 0
        }
      );
      series = chart.get('chill');
      series.setData(datatablech);
      
      if (isday==0) {
			chart.addSeries(
			{
				id: 'chillmin',
				name: $.i18n('Chill') + '_min',
				color: 'rgba(255,127,39,0.8)',
				linkedTo: ':previous',
				zIndex: 1,
				tooltip: {
					valueSuffix: ' \u00B0' + $.myglobals.tempsign,
					valueDecimals: 1
				},
				yAxis: 0
			});
			series = chart.get('chillmin');
			series.setData(datatablecm);
      }
    }
     
    if (datatablese.length!=0)
    {
	    if (isday==1) {
		chart.addSeries(
			{
			id: 'setpoint',
			name: $.i18n('Set Point'),
			color: 'blue',
			zIndex: 1,
			tooltip: {
				valueSuffix: ' \u00B0' + $.myglobals.tempsign,
				valueDecimals: 1
			},
			yAxis: 0
			}
		);
		series = chart.get('setpoint');
		series.setData(datatablese);
	    } else {
			chart.addSeries(
				{
				id: 'setpointavg',
				name: $.i18n('Set Point')+ '_avg',
				color: 'blue',
				fillOpacity: 0.7,
				zIndex: 2,
				tooltip: {
					valueSuffix: ' \u00B0' + $.myglobals.tempsign,
					valueDecimals: 1
				},
				yAxis: 0
				}
			);
			series = chart.get('setpointavg');
			series.setData(datatablese);
			/*chart.addSeries(
			{
				id: 'setpointmin',
				name: $.i18n('Set Point') + '_min',
				color: 'rgba(39,127,255,0.8)',
				linkedTo: ':previous',
				zIndex: 1,
				tooltip: {
					valueSuffix: ' \u00B0' + $.myglobals.tempsign,
					valueDecimals: 1
				},
				yAxis: 0
			});
			series = chart.get('setpointmin');
			series.setData(datatablesm);
			
			chart.addSeries(
			{
				id: 'setpointmax',
				name: $.i18n('Set Point') + '_max',
				color: 'rgba(127,39,255,0.8)',
				linkedTo: ':previous',
				zIndex: 1,
				tooltip: {
					valueSuffix: ' \u00B0' + $.myglobals.tempsign,
					valueDecimals: 1
				},
				yAxis: 0
			});
			series = chart.get('setpointmax');
			series.setData(datatablesx);*/
			
			if (datatablesrange.length!=0) {
				chart.addSeries(
				  {
					id: 'setpointrange',
					name: $.i18n('Set Point') + '_range',
					color: 'rgba(164,75,148,1.0)',
					type: 'areasplinerange',
					linkedTo: ':previous',
					zIndex: 1,
					lineWidth: 0,
					fillOpacity: 0.5,
					yAxis: 0,
					tooltip: {
						valueSuffix: ' \u00B0' + $.myglobals.tempsign,
						valueDecimals: 1
					}					
				  }
				);
				series = chart.get('setpointrange');
				series.setData(datatablesrange);
			}
			if (datatablese_prev.length!=0)
			{
				chart.addSeries(
				{
					id: 'prev_setpoint',
					name: 'Prev_' + $.i18n('Set Point'),
					color: 'rgba(223,212,246,0.8)',
					zIndex: 3,
					yAxis: 0,
					tooltip: {
						valueSuffix: ' \u00B0' + $.myglobals.tempsign,
						valueDecimals: 1
					}
				});
				series = chart.get('prev_setpoint');
				series.setData(datatablese_prev);
				series.setVisible(false);
			}
      }
    }
    
    if (datatablete.length!=0)
    {
      //Add Temperature series

		if (isday==1) {
			chart.addSeries(
			{
				id: 'temperature',
				name: $.i18n('Temperature'),
				color: 'yellow',
				yAxis: 0,
				tooltip: {
					valueSuffix: ' \u00B0' + $.myglobals.tempsign,
					valueDecimals: 1
				}
			}
		  );
		  series = chart.get('temperature');
		  series.setData(datatablete);
		}
		else {
			//Min/Max range
			if (datatableta.length!=0) {
				chart.addSeries(
				  {
					id: 'temperature_avg',
					name: $.i18n('Temperature') + '_avg',
					color: 'yellow',
					fillOpacity: 0.7,
					yAxis: 0,
					zIndex: 2,
					tooltip: {
						valueSuffix: ' \u00B0' + $.myglobals.tempsign,
						valueDecimals: 1
					}					
				  }
				);
				series = chart.get('temperature_avg');
				series.setData(datatableta);
				var trandLine = CalculateTrendLine(datatableta);
				if (typeof trandLine != 'undefined') {
					var datatableTrendline = [];
					
					datatableTrendline.push( [trandLine.x0, trandLine.y0 ] );
					datatableTrendline.push( [trandLine.x1, trandLine.y1 ] );
					
					chart.addSeries({
					  id: 'temp_trendline',
					  name: $.i18n('Trendline') + '_' + $.i18n('Temperature'),
						zIndex: 2,
						tooltip: {
							valueSuffix: ' \u00B0' + $.myglobals.tempsign,
							valueDecimals: 1
						},
					  color: 'rgba(255,255,255,0.8)',
					  yAxis: 0
					});
					series = chart.get('temp_trendline');
					series.setData(datatableTrendline);
					series.setVisible(false);
				}
			}
			if (datatabletrange.length!=0) {
				chart.addSeries(
				  {
					id: 'temperature',
					name: $.i18n('Temperature') + '_range',
					color: 'rgba(3,190,252,1.0)',
					type: 'areasplinerange',
					linkedTo: ':previous',
					zIndex: 0,
					lineWidth: 0,
					fillOpacity: 0.5,
					yAxis: 0,
					tooltip: {
						valueSuffix: ' \u00B0' + $.myglobals.tempsign,
						valueDecimals: 1
					}					
				  }
				);
				series = chart.get('temperature');
				series.setData(datatabletrange);
			}
			if (datatablete_prev.length!=0)
			{
				chart.addSeries(
				{
					id: 'prev_temperature',
					name: 'Prev_' + $.i18n('Temperature'),
					color: 'rgba(224,224,230,0.8)',
					zIndex: 3,
					yAxis: 0,
					tooltip: {
						valueSuffix: ' \u00B0' + $.myglobals.tempsign,
						valueDecimals: 1
					}
				});
				series = chart.get('prev_temperature');
				series.setData(datatablete_prev);
				series.setVisible(false);
			}		
		}
    }
 return;   
    if (datatabledp.length!=0)
    {
      chart.addSeries(
		{
			id: 'dewpoint',
			name: $.i18n('Dew Point'),
			color: 'blue',
			yAxis: 0,
			tooltip: {
				valueSuffix: ' \u00B0' + $.myglobals.tempsign,
				valueDecimals: 1
			}
        }
      );
      series = chart.get('dewpoint');
      series.setData(datatabledp);
    }
    if (datatableba.length!=0)
    {
      chart.addSeries(
        {
			id: 'baro',
			name: $.i18n('Barometer'),
			color: 'pink',
			yAxis: 2,
			tooltip: {
				valueSuffix: ' hPa',
				valueDecimals: 1
			}
        }
      );
      series = chart.get('baro');
      series.setData(datatableba);
    }
}

function load_cam_video()
{
	if ((typeof $.camfeed == 'undefined')||($.camfeed==""))
		return;
	reload_cam_image();
	$.myglobals.refreshTimer=setTimeout(reload_cam_image,100);
}

function reload_cam_image()
{
	if (typeof $.myglobals.refreshTimer != 'undefined') {
		clearTimeout($.myglobals.refreshTimer)
	}
	if ($.camfeed=="")
		return;
	var xx = new Image();
	xx.src = $.camfeed+"&count="+$.count+"?t=" + new Date().getTime();
	$.count++;
	$('#dialog-camera-live #camfeed').attr("src", xx.src);
}

function ShowCameraLiveStream(Name,camIdx)
{
	$.count=0;
	$.camfeed="camsnapshot.jpg?idx="+camIdx;
	
	$('#dialog-camera-live #camfeed').attr("src", "images/camera_default.png");
	//$('#dialog-camera-live #camfeed').attr("src", FeedURL);

	var dwidth=$(window).width()/2;
	var dheight=$(window).height()/2;
	
	if (dwidth>630) {
		dwidth=630;
		dheight=parseInt((dwidth/16)*9);
	}
	if (dheight>470) {
		dheight=470;
		dwidth=parseInt((dheight/9)*16);
	}
	if (dwidth>dheight) {
		dwidth=parseInt((dheight/9)*16);
	}
	else {
		dheight=parseInt((dwidth/16)*9);
	}
	//Set inner Camera feed width/height
	$( "#dialog-camera-live #camfeed" ).width(dwidth-30);
	$( "#dialog-camera-live #camfeed" ).height(dheight-16);

	$( "#dialog-camera-live" ).dialog({
		resizable: false,
		width: dwidth+2,
		height:dheight+118,
		position: {
			my: "center",
			at: "center",
			of: window
		},
		modal: true,
		title: Name,
		buttons: {
			"OK": function() {
				$( this ).dialog( "close" );
			}
		},
		open: function() {
			load_cam_video();
		},
		close: function() {
			$.camfeed="";
			if (typeof $.myglobals.refreshTimer != 'undefined') {
				clearTimeout($.myglobals.refreshTimer)
			}
			$('#dialog-camera-live #camfeed').attr("src", "images/camera_default.png");
            $( this ).dialog( "close" );
		}
	});
}

function ShowTempLog(contentdiv,backfunction,id,name)
{
  clearInterval($.myglobals.refreshTimer);
  $('#modal').show();
  $.content=contentdiv;
  $.backfunction=backfunction;
  $.devIdx=id;
  $.devName=name;
  var htmlcontent = '';
  htmlcontent='<p><center><h2>' + name + '</h2></center></p>\n';
  htmlcontent+=$('#daymonthyearlog').html();

  $($.content).html(GetBackbuttonHTMLTable(backfunction)+htmlcontent);
  $($.content).i18n();

  var tempstr="Celsius";
  if ($.myglobals.tempsign=="F") {
	tempstr="Fahrenheit";
  }

  $.DayChart = $($.content + ' #daygraph');
  $.DayChart.highcharts({
      chart: {
          type: 'line',
          zoomType: 'x',
          alignTicks: false,
          events: {
              load: function() {
                this.showLoading();
                $.getJSON("json.htm?type=graph&sensor=temp&idx="+id+"&range=day",
                function(data) {
					if (typeof data.result != 'undefined') {
                      AddDataToTempChart(data,$.DayChart.highcharts(),1);
                    }
                });
                this.hideLoading();
              }
          }
      },
      loading: {
          hideDuration: 1000,
          showDuration: 1000
      },
      credits: {
        enabled: true,
        href: "http://www.domoticz.com",
        text: "Domoticz.com"
      },
      title: {
          text: $.i18n('Temperature') + ' ' + Get5MinuteHistoryDaysGraphTitle()
      },
      xAxis: {
          type: 'datetime'
      },
      yAxis: [{ //temp label
          labels:  {
                   formatter: function() {
                        return this.value +'\u00B0 ' + $.myglobals.tempsign;
                   },
                   style: {
                      color: '#CCCC00'
                   }
          },
          title: {
              text: 'degrees ' + tempstr,
               style: {
                  color: '#CCCC00'
               }
          }
      }, { //humidity label
          labels:  {
                   formatter: function() {
                        return this.value +'%';
                   },
                   style: {
                      color: 'limegreen'
                   }
          },
          title: {
              text: $.i18n('Humidity') +' %',
               style: {
                  color: '#00CC00'
               }
          },
          opposite: true
      }],
      tooltip: {
		  crosshairs: true,
		  shared: true
      },
      legend: {
          enabled: true
      },
      plotOptions: {
		series: {
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,true,ShowTempLog);
					}
				}
			}
		},
	   line: {
			lineWidth: 3,
			states: {
				hover: {
					lineWidth: 3
				}
			},
			marker: {
				enabled: false,
				states: {
					hover: {
						enabled: true,
						symbol: 'circle',
						radius: 5,
						lineWidth: 1
					}
				}
			}
		}
      }
  });

  $.MonthChart = $($.content + ' #monthgraph');
  $.MonthChart.highcharts({
      chart: {
          type: 'spline',
          zoomType: 'x',
          alignTicks: false,
          events: {
              load: function() {
                this.showLoading();
                $.getJSON("json.htm?type=graph&sensor=temp&idx="+id+"&range=month",
                function(data) {
					if (typeof data.result != 'undefined') {
						AddDataToTempChart(data,$.MonthChart.highcharts(),0);
					}
                });
                this.hideLoading();
              }
          }
      },
      loading: {
          hideDuration: 1000,
          showDuration: 1000
      },
      credits: {
        enabled: true,
        href: "http://www.domoticz.com",
        text: "Domoticz.com"
      },
      title: {
          text: $.i18n('Temperature') + ' ' + $.i18n('Last Month')
      },
      xAxis: {
          type: 'datetime'
      },
      yAxis: [{ //temp label
          labels:  {
				format: '{value}\u00B0 ' + $.myglobals.tempsign,
				style: {
				  color: '#CCCC00'
				}
          },
          title: {
              text: 'degrees ' + tempstr,
               style: {
                  color: '#CCCC00'
               }
          }
      }, { //humidity label
          labels:  {
				   format: '{value}%',
                   style: {
                      color: 'limegreen'
                   }
          },
          title: {
              text: $.i18n('Humidity')+' %',
               style: {
                  color: '#00CC00'
               }
          },
          opposite: true
      }],
      tooltip: {
		  crosshairs: true,
		  shared: true
      },
      legend: {
          enabled: true
      },
      plotOptions: {
				series: {
					point: {
						events: {
							click: function(event) {
								chartPointClickNew(event,false,ShowTempLog);
							}
						}
					}
				},
				spline: {
                    lineWidth: 3,
                    states: {
                        hover: {
                            lineWidth: 3
                        }
                    },
                    marker: {
                        enabled: false,
                        states: {
                            hover: {
                                enabled: true,
                                symbol: 'circle',
                                radius: 5,
                                lineWidth: 1
                            }
                        }
                    }
                }
      }
  });

  $.YearChart = $($.content + ' #yeargraph');
  $.YearChart.highcharts({
      chart: {
          type: 'spline',
          zoomType: 'x',
          alignTicks: false,
          events: {
              load: function() {
                this.showLoading();
                $.getJSON("json.htm?type=graph&sensor=temp&idx="+id+"&range=year",
                function(data) {
					if (typeof data.result != 'undefined') {
						AddDataToTempChart(data,$.YearChart.highcharts(),0);
					}
                });
                this.hideLoading();
              }
          }
      },
      loading: {
          hideDuration: 1000,
          showDuration: 1000
      },
      credits: {
        enabled: true,
        href: "http://www.domoticz.com",
        text: "Domoticz.com"
      },
      title: {
          text: $.i18n('Temperature') + ' ' + $.i18n('Last Year')
      },
      xAxis: {
          type: 'datetime'
      },
      yAxis: [{ //temp label
          labels:  {
				format: '{value}\u00B0 ' + $.myglobals.tempsign,
				style: {
				  color: '#CCCC00'
				}
          },
          title: {
              text: 'degrees ' + tempstr,
               style: {
                  color: '#CCCC00'
               }
          }
      }, { //humidity label
          labels:  {
				   format: '{value}%',
                   style: {
                      color: 'limegreen'
                   }
          },
          title: {
              text: $.i18n('Humidity')+' %',
               style: {
                  color: '#00CC00'
               }
          },
          opposite: true
      }],
      tooltip: {
		  crosshairs: true,
		  shared: true
      },
      legend: {
          enabled: true
      },
      plotOptions: {
				series: {
					point: {
						events: {
							click: function(event) {
								chartPointClickNew(event,false,ShowTempLog);
							}
						}
					}
				},
				spline: {
                    lineWidth: 3,
                    states: {
                        hover: {
                            lineWidth: 3
                        }
                    },
                    marker: {
                        enabled: false,
                        states: {
                            hover: {
                                enabled: true,
                                symbol: 'circle',
                                radius: 5,
                                lineWidth: 1
                            }
                        }
                    }
                }
      }
  });

  $('#modal').hide();
  cursordefault();
  return true;
}

function AddDataToCurrentChart(data,chart,switchtype,isday)
{
    var datatablev1 = [];
    var datatablev2 = [];
    var datatablev3 = [];
    var datatablev4 = [];
    var datatablev5 = [];
    var datatablev6 = [];
    $.each(data.result, function(i,item)
    {
			if (isday==1) {
				datatablev1.push( [GetUTCFromString(item.d), parseFloat(item.v1) ] );
				datatablev2.push( [GetUTCFromString(item.d), parseFloat(item.v2) ] );
				datatablev3.push( [GetUTCFromString(item.d), parseFloat(item.v3) ] );
			}
			else {
				datatablev1.push( [GetDateFromString(item.d), parseFloat(item.v1) ] );
				datatablev2.push( [GetDateFromString(item.d), parseFloat(item.v2) ] );
				datatablev3.push( [GetDateFromString(item.d), parseFloat(item.v3) ] );
				datatablev4.push( [GetDateFromString(item.d), parseFloat(item.v4) ] );
				datatablev5.push( [GetDateFromString(item.d), parseFloat(item.v5) ] );
				datatablev6.push( [GetDateFromString(item.d), parseFloat(item.v6) ] );
			}
    });

    var series;
    if (switchtype==0)
    {
			//Current (A)
			if (isday==1) {
				if (data.haveL1) {
					chart.addSeries(
						{
							id: 'current1',
							name: 'Current_L1',
							color: 'rgba(3,190,252,0.8)',
							yAxis: 0,
							tooltip: {
								valueSuffix: ' A',
								valueDecimals: 1
							}					
						}
					);
					series = chart.get('current1');
					series.setData(datatablev1);
				}
				if (data.haveL2) {
					chart.addSeries(
						{
							id: 'current2',
							name: 'Current_L2',
							color: 'rgba(252,190,3,0.8)',
							yAxis: 0,
							tooltip: {
								valueSuffix: ' A',
								valueDecimals: 1
							}					
						}
					);
					series = chart.get('current2');
					series.setData(datatablev2);
				}
				if (data.haveL3) {
					chart.addSeries(
						{
							id: 'current3',
							name: 'Current_L3',
							color: 'rgba(190,252,3,0.8)',
							yAxis: 0,
							tooltip: {
								valueSuffix: ' A',
								valueDecimals: 1
							}					
						}
					);
					series = chart.get('current3');
					series.setData(datatablev3);
				}
			}
			else {
				//month/year
				if (data.haveL1) {
					chart.addSeries(
						{
							id: 'current1min',
							name: 'Current_L1_Min',
							color: 'rgba(3,190,252,0.8)',
							yAxis: 0
						}
					);
					chart.addSeries(
						{
							id: 'current1max',
							name: 'Current_L1_Max',
							color: 'rgba(3,252,190,0.8)',
							yAxis: 0,
							tooltip: {
								valueSuffix: ' A',
								valueDecimals: 1
							}					
						}
					);
					series = chart.get('current1min');
					series.setData(datatablev1);
					series = chart.get('current1max');
					series.setData(datatablev2);
				}
				if (data.haveL2) {
					chart.addSeries(
						{
							id: 'current2min',
							name: 'Current_L2_Min',
							color: 'rgba(252,190,3,0.8)',
							yAxis: 0,
							tooltip: {
								valueSuffix: ' A',
								valueDecimals: 1
							}					
						}
					);
					chart.addSeries(
						{
							id: 'current2max',
							name: 'Current_L2_Max',
							color: 'rgba(252,3,190,0.8)',
							yAxis: 0,
							tooltip: {
								valueSuffix: ' A',
								valueDecimals: 1
							}					
						}
					);
					series = chart.get('current2min');
					series.setData(datatablev3);
					series = chart.get('current2max');
					series.setData(datatablev4);
				}
				if (data.haveL3) {
					chart.addSeries(
						{
							id: 'current3min',
							name: 'Current_L3_Min',
							color: 'rgba(190,252,3,0.8)',
							yAxis: 0,
							tooltip: {
								valueSuffix: ' A',
								valueDecimals: 1
							}					
						}
					);
					chart.addSeries(
						{
							id: 'current3max',
							name: 'Current_L3_Min',
							color: 'rgba(112,146,190,0.8)',
							yAxis: 0,
							tooltip: {
								valueSuffix: ' A',
								valueDecimals: 1
							}					
						}
					);
					series = chart.get('current3min');
					series.setData(datatablev5);
					series = chart.get('current3max');
					series.setData(datatablev6);
				}
			}
			chart.yAxis[0].axisTitle.attr({
					text: 'Current (A)'
			});			
    }
    else if (switchtype==1)
    {
			//Watt
			if (isday==1) {
				if (data.haveL1) {
					chart.addSeries(
						{
							id: 'current1',
							name: 'Usage_L1',
							color: 'rgba(3,190,252,0.8)',
							yAxis: 0,
							tooltip: {
								valueSuffix: ' Watt',
								valueDecimals: 1
							}					
						}
					);
					series = chart.get('current1');
					series.setData(datatablev1);
				}
				if (data.haveL2) {
					chart.addSeries(
						{
							id: 'current2',
							name: 'Usage_L2',
							color: 'rgba(252,190,3,0.8)',
							yAxis: 0,
							tooltip: {
								valueSuffix: ' Watt',
								valueDecimals: 1
							}					
						}
					);
					series = chart.get('current2');
					series.setData(datatablev2);
				}
				if (data.haveL3) {
					chart.addSeries(
						{
							id: 'current3',
							name: 'Usage_L3',
							color: 'rgba(190,252,3,0.8)',
							yAxis: 0,
							tooltip: {
								valueSuffix: ' Watt',
								valueDecimals: 1
							}					
						}
					);
					series = chart.get('current3');
					series.setData(datatablev3);
				}
			}
			else {
				if (data.haveL1) {
					chart.addSeries(
						{
							id: 'current1min',
							name: 'Usage_L1_Min',
							color: 'rgba(3,190,252,0.8)',
							yAxis: 0,
							tooltip: {
								valueSuffix: ' Watt',
								valueDecimals: 1
							}					
						}
					);
					chart.addSeries(
						{
							id: 'current1max',
							name: 'Usage_L1_Max',
							color: 'rgba(3,252,190,0.8)',
							yAxis: 0,
							tooltip: {
								valueSuffix: ' Watt',
								valueDecimals: 1
							}					
						}
					);
					series = chart.get('current1min');
					series.setData(datatablev1);
					series = chart.get('current1max');
					series.setData(datatablev2);
				}
				if (data.haveL2) {
					chart.addSeries(
						{
							id: 'current2min',
							name: 'Usage_L2_Min',
							color: 'rgba(252,190,3,0.8)',
							yAxis: 0,
							tooltip: {
								valueSuffix: ' Watt',
								valueDecimals: 1
							}					
						}
					);
					chart.addSeries(
						{
							id: 'current2max',
							name: 'Usage_L2_Max',
							color: 'rgba(252,3,190,0.8)',
							yAxis: 0,
							tooltip: {
								valueSuffix: ' Watt',
								valueDecimals: 1
							}					
						}
					);
					series = chart.get('current2min');
					series.setData(datatablev3);
					series = chart.get('current2max');
					series.setData(datatablev4);
				}
				if (data.haveL3) {
					chart.addSeries(
						{
							id: 'current3min',
							name: 'Usage_L3_Min',
							color: 'rgba(190,252,3,0.8)',
							yAxis: 0,
							tooltip: {
								valueSuffix: ' Watt',
								valueDecimals: 1
							}					
						}
					);
					chart.addSeries(
						{
							id: 'current3max',
							name: 'Usage_L3_Min',
							color: 'rgba(112,146,190,0.8)',
							yAxis: 0,
							tooltip: {
								valueSuffix: ' Watt',
								valueDecimals: 1
							}					
						}
					);
					series = chart.get('current3min');
					series.setData(datatablev5);
					series = chart.get('current3max');
					series.setData(datatablev6);
				}
			}
			chart.yAxis[0].axisTitle.attr({
					text: 'Usage (Watt)'
			});			
    }
		chart.yAxis[0].redraw();
}

function ShowCurrentLog(contentdiv,backfunction, id,name,switchtype)
{
	clearInterval($.myglobals.refreshTimer);
  $('#modal').show();
  $.content=contentdiv;
  $.backfunction=backfunction;
  $.devIdx=id;
  $.devName=name;
  $.devSwitchType=switchtype;
  var htmlcontent = '';
  htmlcontent='<p><center><h2>' + name + '</h2></center></p>\n';
  htmlcontent+=$('#daymonthyearlog').html();
  $($.content).html(GetBackbuttonHTMLTable(backfunction)+htmlcontent);
  $($.content).i18n();
  
  $.DayChart = $($.content + ' #daygraph');
  $.DayChart.highcharts({
      chart: {
          type: 'line',
          zoomType: 'x',
          events: {
              load: function() {
                $.getJSON("json.htm?type=graph&sensor=counter&idx="+id+"&range=day",
                function(data) {
					if (typeof data.result != 'undefined') {
						AddDataToCurrentChart(data,$.DayChart.highcharts(),switchtype,1);
					}
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: Get5MinuteHistoryDaysGraphTitle()
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: $.i18n('Usage')
            },
            min: 0
        },
		tooltip: {
		  crosshairs: true,
		  shared: true
		},
        plotOptions: {
			series: {
				point: {
					events: {
						click: function(event) {
							chartPointClickNew(event,true,ShowCurrentLog);
						}
					}
				}
			},
			 line: {
						lineWidth: 3,
						states: {
								hover: {
										lineWidth: 3
								}
						},
						marker: {
								enabled: false,
								states: {
										hover: {
												enabled: true,
												symbol: 'circle',
												radius: 5,
												lineWidth: 1
										}
								}
						}
				}
        },
        legend: {
            enabled: true
        }
    });
  
  $.MonthChart = $($.content + ' #monthgraph');
  $.MonthChart.highcharts({
      chart: {
          type: 'spline',
          marginRight: 10,
          zoomType: 'x',
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=counter&idx="+id+"&range=month",
                function(data) {
					if (typeof data.result != 'undefined') {
						AddDataToCurrentChart(data,$.MonthChart.highcharts(),switchtype,0);
					}
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('Last Month')
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: $.i18n('Usage')
            },
            min: 0
        },
		tooltip: {
		  crosshairs: true,
		  shared: true
		},
        plotOptions: {
			series: {
				point: {
					events: {
						click: function(event) {
							chartPointClickNew(event,false,ShowCurrentLog);
						}
					}
				}
			},
			spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        legend: {
            enabled: true
        }
    });

  $.YearChart = $($.content + ' #yeargraph');
  $.YearChart.highcharts({
      chart: {
          type: 'spline',
          marginRight: 10,
          zoomType: 'x',
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=counter&idx="+id+"&range=year",
                function(data) {
					if (typeof data.result != 'undefined') {
						AddDataToCurrentChart(data,$.YearChart.highcharts(),switchtype,0);
					}
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('Last Year')
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: $.i18n('Usage')
            },
            min: 0
        },
		tooltip: {
		  crosshairs: true,
		  shared: true
		},
        plotOptions: {
			series: {
				point: {
					events: {
						click: function(event) {
							chartPointClickNew(event,false,ShowCurrentLog);
						}
					}
				}
			},
			spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        legend: {
            enabled: true
        }
    });
}

function ShowUVLog(contentdiv,backfunction,id,name)
{
	clearInterval($.myglobals.refreshTimer);
  $('#modal').show();
  $.content=contentdiv;
  $.backfunction=backfunction;
  $.devIdx=id;
  $.devName=name;
  var htmlcontent = '';
  htmlcontent='<p><center><h2>' + name + '</h2></center></p><br>\n';
  htmlcontent+=$('#daymonthyearlog').html();
  $($.content).html(GetBackbuttonHTMLTable(backfunction)+htmlcontent);
  $($.content).i18n();
  
  $.DayChart = $($.content + ' #daygraph');
  $.DayChart.highcharts({
      chart: {
          type: 'spline',
          zoomType: 'x',
          marginRight: 10,
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=uv&idx="+id+"&range=day",
                function(data) {
					if (typeof data.result != 'undefined') {
                      var series = $.DayChart.highcharts().series[0];
                      var datatable = [];
                      
                      $.each(data.result, function(i,item)
                      {
                        datatable.push( [GetUTCFromString(item.d), parseFloat(item.uvi) ] );
                      });
                      series.setData(datatable);
                   }
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: 'UV '  + Get5MinuteHistoryDaysGraphTitle()
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'UV (UVI)'
            },
            min: 0
        },
		tooltip: {
		  crosshairs: true,
		  shared: true
		},
        plotOptions: {
            spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        series: [{
            name: 'uv',
			tooltip: {
				valueSuffix: ' UVI',
				valueDecimals: 1
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,true,ShowUVLog);
					}
				}
			}
        }]
        ,
        legend: {
            enabled: false
        },
        navigation: {
            menuItemStyle: {
                fontSize: '10px'
            }
        }
    });

  $.MonthChart = $($.content + ' #monthgraph');
  $.MonthChart.highcharts({
      chart: {
          type: 'spline',
          zoomType: 'x',
          marginRight: 10,
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=uv&idx="+id+"&range=month",
                function(data) {
					if (typeof data.result != 'undefined') {
                      var series = $.MonthChart.highcharts().series[0];
                      var datatable = [];
                      $.each(data.result, function(i,item)
                      {
                        datatable.push( [GetDateFromString(item.d), parseFloat(item.uvi) ] );
                      });
                      series.setData(datatable);
						var bHavePrev=(typeof data.resultprev!= 'undefined');
						if (bHavePrev) {
							datatable = [];
							series = $.MonthChart.highcharts().series[1];
							$.each(data.resultprev, function(i,item)
							{
								datatable.push( [GetPrevDateFromString(item.d), parseFloat(item.uvi) ] );
							});
							series.setData(datatable);
						}
					}
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: 'UV ' + $.i18n('Last Month')
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'UV (UVI)'
            },
            min: 0
        },
		tooltip: {
		  crosshairs: true,
		  shared: true
		},
        plotOptions: {
            spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        series: [{
            name: 'uv',
			tooltip: {
				valueSuffix: ' UVI',
				valueDecimals: 1
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowUVLog);
					}
				}
			}
        },{
            name: 'Prev_uv',
            visible: false,
			tooltip: {
				valueSuffix: ' UVI',
				valueDecimals: 1
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowUVLog);
					}
				}
			}
        }]
        ,
        legend: {
            enabled: true
        },
        navigation: {
            menuItemStyle: {
                fontSize: '10px'
            }
        }
    });

  $.YearChart = $($.content + ' #yeargraph');
  $.YearChart.highcharts({
      chart: {
          type: 'spline',
          zoomType: 'x',
          marginRight: 10,
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=uv&idx="+id+"&range=year",
                function(data) {
					if (typeof data.result != 'undefined') {
                      var series = $.YearChart.highcharts().series[0];
                      var datatable = [];
                      $.each(data.result, function(i,item)
                      {
                        datatable.push( [GetDateFromString(item.d), parseFloat(item.uvi) ] );
                      });
                      series.setData(datatable);
						var bHavePrev=(typeof data.resultprev!= 'undefined');
						if (bHavePrev) {
							datatable = [];
							series = $.YearChart.highcharts().series[1];
							$.each(data.resultprev, function(i,item)
							{
								datatable.push( [GetPrevDateFromString(item.d), parseFloat(item.uvi) ] );
							});
							series.setData(datatable);
						}
					}
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: 'UV ' + $.i18n('Last Year')
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'UV (UVI)'
            },
            min: 0
        },
		tooltip: {
		  crosshairs: true,
		  shared: true
		},
        plotOptions: {
            spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        series: [{
            name: 'uv',
			tooltip: {
				valueSuffix: ' UVI',
				valueDecimals: 1
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowUVLog);
					}
				}
			}
        },{
            name: 'Prev_uv',
            visible: false,
			tooltip: {
				valueSuffix: ' UVI',
				valueDecimals: 1
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowUVLog);
					}
				}
			}
        }]
        ,
        legend: {
            enabled: true
        },
        navigation: {
            menuItemStyle: {
                fontSize: '10px'
            }
        }
    });
  $('#modal').hide();
  cursordefault();
  return false;
}

function ShowWindLog(contentdiv,backfunction,id,name)
{
	clearInterval($.myglobals.refreshTimer);
  $('#modal').show();
  $.content=contentdiv;
  $.backfunction=backfunction;
  $.devIdx=id;
  $.devName=name;
  var htmlcontent = '';
        
  htmlcontent='<p><center><h2>' + name + '</h2></center></p><br>\n';
  htmlcontent+=$('#windlog').html();
  $($.content).html(GetBackbuttonHTMLTable(backfunction)+htmlcontent);
  $($.content).i18n();
  
  $.DayChart = $($.content + ' #winddaygraph');
  $.DayChart.highcharts({
      chart: {
          type: 'spline',
          zoomType: 'x',
          marginRight: 10,
          events: {
              load: function() {
                $.getJSON("json.htm?type=graph&sensor=wind&idx="+id+"&range=day",
                function(data) {
					if (typeof data.result != 'undefined') {
                      var seriessp = $.DayChart.highcharts().series[0];
                      var seriesgu = $.DayChart.highcharts().series[1];
                      var datatablesp = [];
                      var datatablegu = [];
                      
                      $.each(data.result, function(i,item)
                      {
                        datatablesp.push( [GetUTCFromString(item.d), parseFloat(item.sp) ] );
                        datatablegu.push( [GetUTCFromString(item.d), parseFloat(item.gu) ] );
                      });
                      seriessp.setData(datatablesp);
                      seriesgu.setData(datatablegu);
                   }
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('Wind') + ' ' + $.i18n('speed/gust') + ' '  + Get5MinuteHistoryDaysGraphTitle()
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: $.i18n('Speed') + ' (' + $.myglobals.windsign + ')'
            },
            min: 0,
            minorGridLineWidth: 0,
            gridLineWidth: 0,
            alternateGridColor: null,
            plotBands: [{ // Light air
                from: 0.3*$.myglobals.windscale,
                to: 1.5*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.3)',
                label: {
                    text: $.i18n('Light air'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // Light breeze
                from: 1.5*$.myglobals.windscale,
                to: 3.5*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.5)',
                label: {
                    text: $.i18n('Light breeze'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // Gentle breeze
                from: 3.5*$.myglobals.windscale,
                to: 5.5*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.3)',
                label: {
                    text: $.i18n('Gentle breeze'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // Moderate breeze
                from: 5.5*$.myglobals.windscale,
                to: 8*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.5)',
                label: {
                    text: $.i18n('Moderate breeze'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // Fresh breeze
                from: 8*$.myglobals.windscale,
                to: 10.8*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.3)',
                label: {
                    text: $.i18n('Fresh breeze'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // Strong breeze
                from: 10.8*$.myglobals.windscale,
                to: 13.9*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.5)',
                label: {
                    text: $.i18n('Strong breeze'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // High wind
                from: 13.9*$.myglobals.windscale,
                to: 17.2*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.3)',
                label: {
                    text: $.i18n('High wind'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // fresh gale
                from: 17.2*$.myglobals.windscale,
                to: 20.8*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.3)',
                label: {
                    text: $.i18n('Fresh gale'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // strong gale
                from: 20.8*$.myglobals.windscale,
                to: 24.5*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.5)',
                label: {
                    text: $.i18n('Strong gale'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // storm
                from: 24.5*$.myglobals.windscale,
                to: 28.5*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.3)',
                label: {
                    text: $.i18n('Storm'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // Violent storm
                from: 28.5*$.myglobals.windscale,
                to: 32.7*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.5)',
                label: {
                    text: $.i18n('Violent storm'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // hurricane
                from: 32.7*$.myglobals.windscale,
                to: 100*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.3)',
                label: {
                    text: $.i18n('Hurricane'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }
            ]
        },
		tooltip: {
		  crosshairs: true,
		  shared: true
		},
        plotOptions: {
            spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        series: [{
            name: $.i18n('Speed'),
			tooltip: {
				valueSuffix: ' ' + $.myglobals.windsign,
				valueDecimals: 1
			}
        }, {
            name: $.i18n('Gust'),
			tooltip: {
				valueSuffix: ' ' + $.myglobals.windsign,
				valueDecimals: 1
			}
        }]
        ,
        navigation: {
            menuItemStyle: {
                fontSize: '10px'
            }
        }
    });

  $.DirChart = $($.content + ' #winddirgraph');
  $.DirChart.highcharts({
      chart: {
          polar: true,
          events: {
              load: function() {
                $.getJSON("json.htm?type=graph&sensor=winddir&idx="+id+"&range=day",
                function(data) {
					if (typeof data.result != 'undefined') {
                      var series = $.DirChart.highcharts().series[0];
                      var datatable = [];
                      
                      $.each(data.result, function(i,item)
                      {
                        datatable.push( [item.dig, parseFloat(item.div) ] );
                      });
                      series.setData(datatable);
                   }
                });
              }
          }
        },
        title: {
            text: $.i18n('Wind') + ' ' + $.i18n('Direction') + ' '  + Get5MinuteHistoryDaysGraphTitle()
        },
        pane: {
            startAngle: 0,
            endAngle: 360
        },
        credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        xAxis: {
            min: 0,
            max: 360,
            tickWidth: 1,
            tickPosition: 'outside',
            tickLength: 20,
            tickColor: '#999',
            tickInterval:45,
            labels: {
                formatter:function(){
                    if(this.value == 0) { return 'N'; }
                    else if(this.value == 45) { return 'NE'; }
                    else if(this.value == 90) { return 'E'; }
                    else if(this.value == 135) { return 'SE'; }
                    else if(this.value == 180) { return 'S'; }
                    else if(this.value == 225) { return 'SW'; }
                    else if(this.value == 270) { return 'W'; }
                    else if(this.value == 315) { return 'NW'; }
                }
            }
        },
        yAxis: {
            min: 0
        },
        tooltip: {
            formatter: function() {
                    return ''+
                    this.x +'\u00B0: '+ this.y +' %';
            }
        },
        plotOptions: {
            area: {
                lineWidth: 2,
                states: {
                    hover: {
                        lineWidth: 2
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        series: [{
            type: 'area',
            color: 'rgba(68, 170, 213, 0.2)',
            name: $.i18n('Direction')
        }]
    });

  $.MonthChart = $($.content + ' #windmonthgraph');
  $.MonthChart.highcharts({
      chart: {
          type: 'spline',
          zoomType: 'x',
          marginRight: 10,
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=wind&idx="+id+"&range=month",
                function(data) {
					if (typeof data.result != 'undefined') {
                      var seriessp = $.MonthChart.highcharts().series[0];
                      var seriesgu = $.MonthChart.highcharts().series[1];
                      var datatablesp = [];
                      var datatablegu = [];
                      
                      $.each(data.result, function(i,item)
                      {
                        datatablesp.push( [GetDateFromString(item.d), parseFloat(item.sp) ] );
                        datatablegu.push( [GetDateFromString(item.d), parseFloat(item.gu) ] );
                      });
                      seriessp.setData(datatablesp);
                      seriesgu.setData(datatablegu);
                    }
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('Wind') + ' ' + $.i18n('speed/gust') + ' ' + $.i18n('Last Month')
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: $.i18n('Speed') + ' (' + $.myglobals.windsign + ')'
            },
            min: 0,
            minorGridLineWidth: 0,
            gridLineWidth: 0,
            alternateGridColor: null,
            plotBands: [{ // Light air
                from: 0.3*$.myglobals.windscale,
                to: 1.5*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.3)',
                label: {
                    text: $.i18n('Light air'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // Light breeze
                from: 1.5*$.myglobals.windscale,
                to: 3.5*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.5)',
                label: {
                    text: $.i18n('Light breeze'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // Gentle breeze
                from: 3.5*$.myglobals.windscale,
                to: 5.5*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.3)',
                label: {
                    text: $.i18n('Gentle breeze'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // Moderate breeze
                from: 5.5*$.myglobals.windscale,
                to: 8*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.5)',
                label: {
                    text: $.i18n('Moderate breeze'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // Fresh breeze
                from: 8*$.myglobals.windscale,
                to: 10.8*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.3)',
                label: {
                    text: $.i18n('Fresh breeze'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // Strong breeze
                from: 10.8*$.myglobals.windscale,
                to: 13.9*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.5)',
                label: {
                    text: $.i18n('Strong breeze'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // High wind
                from: 13.9*$.myglobals.windscale,
                to: 17.2*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.3)',
                label: {
                    text: $.i18n('High wind'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // fresh gale
                from: 17.2*$.myglobals.windscale,
                to: 20.8*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.3)',
                label: {
                    text: $.i18n('Fresh gale'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // strong gale
                from: 20.8*$.myglobals.windscale,
                to: 24.5*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.5)',
                label: {
                    text: $.i18n('Strong gale'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // storm
                from: 24.5*$.myglobals.windscale,
                to: 28.5*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.3)',
                label: {
                    text: $.i18n('Storm'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // Violent storm
                from: 28.5*$.myglobals.windscale,
                to: 32.7*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.5)',
                label: {
                    text: $.i18n('Violent storm'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // hurricane
                from: 32.7*$.myglobals.windscale,
                to: 100*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.3)',
                label: {
                    text: $.i18n('Hurricane'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }
           ]
        },
		tooltip: {
		  crosshairs: true,
		  shared: true
		},
        plotOptions: {
            spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        series: [{
            name: $.i18n('Speed'),
			tooltip: {
				valueSuffix: ' ' + $.myglobals.windsign,
				valueDecimals: 1
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowWindLog);
					}
				}
			}
        }, {
            name: $.i18n('Gust'),
			tooltip: {
				valueSuffix: ' ' + $.myglobals.windsign,
				valueDecimals: 1
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowWindLog);
					}
				}
			}
        }]
        ,
        navigation: {
            menuItemStyle: {
                fontSize: '10px'
            }
        }
    });

  $.YearChart = $($.content + ' #windyeargraph');
  $.YearChart.highcharts({
      chart: {
          type: 'spline',
          zoomType: 'x',
          marginRight: 10,
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=wind&idx="+id+"&range=year",
                function(data) {
					if (typeof data.result != 'undefined') {
                      var seriessp = $.YearChart.highcharts().series[0];
                      var seriesgu = $.YearChart.highcharts().series[1];
                      var datatablesp = [];
                      var datatablegu = [];
                      
                      $.each(data.result, function(i,item)
                      {
                        datatablesp.push( [GetDateFromString(item.d), parseFloat(item.sp) ] );
                        datatablegu.push( [GetDateFromString(item.d), parseFloat(item.gu) ] );
                      });
                      seriessp.setData(datatablesp);
                      seriesgu.setData(datatablegu);
                    }
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('Wind') + ' ' + $.i18n('speed/gust') + ' ' + $.i18n('Last Year')
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: $.i18n('Speed') + ' (' + $.myglobals.windsign + ')'
            },
            min: 0,
            minorGridLineWidth: 0,
            gridLineWidth: 0,
            alternateGridColor: null,
            plotBands: [{ // Light air
                from: 0.3*$.myglobals.windscale,
                to: 1.5*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.3)',
                label: {
                    text: $.i18n('Light air'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // Light breeze
                from: 1.5*$.myglobals.windscale,
                to: 3.5*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.5)',
                label: {
                    text: $.i18n('Light breeze'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // Gentle breeze
                from: 3.5*$.myglobals.windscale,
                to: 5.5*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.3)',
                label: {
                    text: $.i18n('Gentle breeze'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // Moderate breeze
                from: 5.5*$.myglobals.windscale,
                to: 8*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.5)',
                label: {
                    text: $.i18n('Moderate breeze'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // Fresh breeze
                from: 8*$.myglobals.windscale,
                to: 10.8*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.3)',
                label: {
                    text: $.i18n('Fresh breeze'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // Strong breeze
                from: 10.8*$.myglobals.windscale,
                to: 13.9*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.5)',
                label: {
                    text: $.i18n('Strong breeze'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // High wind
                from: 13.9*$.myglobals.windscale,
                to: 17.2*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.3)',
                label: {
                    text: $.i18n('High wind'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // fresh gale
                from: 17.2*$.myglobals.windscale,
                to: 20.8*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.3)',
                label: {
                    text: $.i18n('Fresh gale'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // strong gale
                from: 20.8*$.myglobals.windscale,
                to: 24.5*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.5)',
                label: {
                    text: $.i18n('Strong gale'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // storm
                from: 24.5*$.myglobals.windscale,
                to: 28.5*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.3)',
                label: {
                    text: $.i18n('Storm'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // Violent storm
                from: 28.5*$.myglobals.windscale,
                to: 32.7*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.5)',
                label: {
                    text: $.i18n('Violent storm'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // hurricane
                from: 32.7*$.myglobals.windscale,
                to: 100*$.myglobals.windscale,
                color: 'rgba(68, 170, 213, 0.3)',
                label: {
                    text: $.i18n('Hurricane'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }
           ]
        },
		tooltip: {
		  crosshairs: true,
		  shared: true
		},
        plotOptions: {
            spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        series: [{
            name: $.i18n('Speed'),
			tooltip: {
				valueSuffix: ' ' + $.myglobals.windsign,
				valueDecimals: 1
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowWindLog);
					}
				}
			}
        }, {
            name: $.i18n('Gust'),
			tooltip: {
				valueSuffix: ' ' + $.myglobals.windsign,
				valueDecimals: 1
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowWindLog);
					}
				}
			}
        }]
        ,
        navigation: {
            menuItemStyle: {
                fontSize: '10px'
            }
        }
    });
  $('#modal').hide();
  cursordefault();
  return false;
}

function ShowRainLog(contentdiv,backfunction,id,name)
{
	clearInterval($.myglobals.refreshTimer);
  $('#modal').show();
  $.content=contentdiv;
  $.backfunction=backfunction;
  $.devIdx=id;
  $.devName=name;
  var htmlcontent = '';
  htmlcontent='<p><center><h2>' + name + '</h2></center></p>\n';
  htmlcontent+=$('#dayweekmonthyearlog').html();
  $($.content).html(GetBackbuttonHTMLTable(backfunction)+htmlcontent);
  $($.content).i18n();

  $.DayChart = $($.content + ' #daygraph');
  $.DayChart.highcharts({
      chart: {
          type: 'column',
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=rain&idx="+id+"&range=day",
                function(data) {
					if (typeof data.result != 'undefined') {
                      var series = $.DayChart.highcharts().series[0];
                      var datatable = [];
                      
                      $.each(data.result, function(i,item)
                      {
                        datatable.push( [GetUTCFromString(item.d), parseFloat(item.mm) ] );
                      });
                      series.setData(datatable);
                   }
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('Rainfall') + ' ' + Get5MinuteHistoryDaysGraphTitle()
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            min: 0,
            maxPadding: 0.2,
            endOnTick: false,
            title: {
                text: $.i18n('Rainfall') + ' (mm)'
            }
        },
        tooltip: {
            formatter: function() {
                    return ''+
                    $.i18n(Highcharts.dateFormat('%A',this.x)) + '<br/>' + Highcharts.dateFormat('%Y-%m-%d %H:%M', this.x) +': '+ this.y +' mm';
            }
        },
        plotOptions: {
            column: {
                minPointLength: 3,
                pointPadding: 0.1,
                groupPadding: 0,
				dataLabels: {
                        enabled: false,
                        color: 'white'
                }                
            }
        },
        series: [{
            name: 'mm',
            color: 'rgba(3,190,252,0.8)'
        }]
        ,
        legend: {
            enabled: false
        }
    });

  $.WeekChart = $($.content + ' #weekgraph');
  $.WeekChart.highcharts({
      chart: {
          type: 'column',
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=rain&idx="+id+"&range=week",
                function(data) {
					if (typeof data.result != 'undefined') {
                      var series = $.WeekChart.highcharts().series[0];
                      var datatable = [];
                      $.each(data.result, function(i,item)
                      {
                        datatable.push( [GetDateFromString(item.d), parseFloat(item.mm) ] );
                      });
                      series.setData(datatable);
                    }
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('Rainfall') + ' ' + $.i18n('Last Week')
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                day: '%a'
            },
            tickInterval: 24 * 3600 * 1000
        },
        yAxis: {
            min: 0,
            maxPadding: 0.2,
            endOnTick: false,
            title: {
                text: $.i18n('Rainfall') + ' (mm)'
            }
        },
        tooltip: {
            formatter: function() {
                    return ''+
                    $.i18n(Highcharts.dateFormat('%A',this.x)) + '<br/>' + Highcharts.dateFormat('%Y-%m-%d', this.x) +': '+ this.y +' mm';
            }
        },
        plotOptions: {
            column: {
                minPointLength: 4,
                pointPadding: 0.1,
                groupPadding: 0,
				dataLabels: {
                        enabled: true,
                        color: 'white'
                }                
            }
        },
        series: [{
            name: 'mm',
            color: 'rgba(3,190,252,0.8)'
        }]
        ,
        legend: {
            enabled: false
        }
    });

  $.MonthChart = $($.content + ' #monthgraph');
  $.MonthChart.highcharts({
      chart: {
          type: 'spline',
          marginRight: 10,
          zoomType: 'x',
          events: {
              load: function() {
                $.getJSON("json.htm?type=graph&sensor=rain&idx="+id+"&range=month",
                function(data) {
					if (typeof data.result != 'undefined') {
                      var series = $.MonthChart.highcharts().series[0];
                      var datatable = [];
                      $.each(data.result, function(i,item)
                      {
                        datatable.push( [GetDateFromString(item.d), parseFloat(item.mm) ] );
                      });
                      series.setData(datatable);
						var bHavePrev=(typeof data.resultprev!= 'undefined');
						if (bHavePrev) {
							datatable = [];
							series = $.MonthChart.highcharts().series[1];
							$.each(data.resultprev, function(i,item)
							{
								datatable.push( [GetPrevDateFromString(item.d), parseFloat(item.mm) ] );
							});
							series.setData(datatable);
						}
					}
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('Rainfall') + ' ' + $.i18n('Last Month')
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: $.i18n('Rainfall') + ' (mm)'
            },
            min: 0
        },
		tooltip: {
		  crosshairs: true,
		  shared: true
		},
        plotOptions: {
           spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        series: [{
            name: 'mm',
            color: 'rgba(3,190,252,0.8)',
			tooltip: {
				valueSuffix: ' mm',
				valueDecimals: 1
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowRainLog);
					}
				}
			}
        },{
            name: 'Prev_mm',
            visible: false,
            color: 'rgba(190,3,252,0.8)',
			tooltip: {
				valueSuffix: ' mm',
				valueDecimals: 1
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowRainLog);
					}
				}
			}
        }]
        ,
        legend: {
            enabled: true
        }
    });

  $.YearChart = $($.content + ' #yeargraph');
  $.YearChart.highcharts({
      chart: {
          type: 'spline',
          marginRight: 10,
          zoomType: 'x',
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=rain&idx="+id+"&range=year",
                function(data) {
					if (typeof data.result != 'undefined') {
                      var series = $.YearChart.highcharts().series[0];
                      var datatable = [];
                      $.each(data.result, function(i,item)
                      {
                        datatable.push( [GetDateFromString(item.d), parseFloat(item.mm) ] );
                      });
                      series.setData(datatable);
						var bHavePrev=(typeof data.resultprev!= 'undefined');
						if (bHavePrev) {
							datatable = [];
							series = $.YearChart.highcharts().series[1];
							$.each(data.resultprev, function(i,item)
							{
								datatable.push( [GetPrevDateFromString(item.d), parseFloat(item.mm) ] );
							});
							series.setData(datatable);
						}
					}
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('Rainfall') + ' ' + $.i18n('Last Year')
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: $.i18n('Rainfall') + ' (mm)'
            },
            min: 0
        },
		tooltip: {
		  crosshairs: true,
		  shared: true
		},
        plotOptions: {
           spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        series: [{
            name: 'mm',
            color: 'rgba(3,190,252,0.8)',
			tooltip: {
				valueSuffix: ' mm',
				valueDecimals: 1
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowRainLog);
					}
				}
			}
        },{
            name: 'Prev_mm',
            visible: false,
            color: 'rgba(190,3,252,0.8)',
			tooltip: {
				valueSuffix: ' mm',
				valueDecimals: 1
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowRainLog);
					}
				}
			}
        }]
        ,
        legend: {
            enabled: true
        }
    });
  $('#modal').hide();
  cursordefault();
  return false;
}

function ShowBaroLog(contentdiv,backfunction,id,name)
{
	clearInterval($.myglobals.refreshTimer);
  $('#modal').show();
  $.content=contentdiv;
  $.backfunction=backfunction;
  $.devIdx=id;
  $.devName=name;
  var htmlcontent = '';
  htmlcontent='<p><center><h2>' + name + '</h2></center></p><br>\n';
  htmlcontent+=$('#daymonthyearlog').html();
  $($.content).html(GetBackbuttonHTMLTable(backfunction)+htmlcontent);
  $($.content).i18n();
  
  $.DayChart = $($.content + ' #daygraph');
  $.DayChart.highcharts({
      chart: {
          type: 'spline',
          zoomType: 'x',
          marginRight: 10,
          events: {
              load: function() {
                $.getJSON("json.htm?type=graph&sensor=temp&idx="+id+"&range=day",
                function(data) {
					if (typeof data.result != 'undefined') {
                      var series = $.DayChart.highcharts().series[0];
                      var datatable = [];
                      $.each(data.result, function(i,item)
                      {
                        datatable.push( [GetUTCFromString(item.d), parseFloat(item.ba) ] );
                      });
                      series.setData(datatable);
					}
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('Barometer') + ' '  + Get5MinuteHistoryDaysGraphTitle()
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: $.i18n('Pressure') + ' (hPa)'
            },
            labels: {
							formatter: function(){
									return this.value;       
							}
						}
        },
		tooltip: {
		  crosshairs: true,
		  shared: true
		},
        plotOptions: {
            spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        series: [{
            name: 'Baro',
			tooltip: {
				valueSuffix: ' hPa',
				valueDecimals: 1
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,true,ShowBaroLog);
					}
				}
			}
        }]
        ,
        legend: {
            enabled: false
        },
        navigation: {
            menuItemStyle: {
                fontSize: '10px'
            }
        }
    });

  $.MonthChart = $($.content + ' #monthgraph');
  $.MonthChart.highcharts({
      chart: {
          type: 'spline',
          zoomType: 'x',
          marginRight: 10,
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=temp&idx="+id+"&range=month",
                function(data) {
					if (typeof data.result != 'undefined') {
                      var series = $.MonthChart.highcharts().series[0];
                      var datatable = [];
                      
                      $.each(data.result, function(i,item)
                      {
                        datatable.push( [GetDateFromString(item.d), parseFloat(item.ba) ] );
                      });
                      series.setData(datatable);
                   }
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('Barometer') + ' ' + $.i18n('Last Month')
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: $.i18n('Pressure') + ' (hPa)'
            },
            labels: {
							formatter: function(){
									return this.value;       
							}
						}
        },
		tooltip: {
		  crosshairs: true,
		  shared: true
		},
        plotOptions: {
            spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        series: [{
            name: 'Baro',
			tooltip: {
				valueSuffix: ' hPa',
				valueDecimals: 1
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowBaroLog);
					}
				}
			}
        }]
        ,
        legend: {
            enabled: false
        },
        navigation: {
            menuItemStyle: {
                fontSize: '10px'
            }
        }
    });

  $.YearChart = $($.content + ' #yeargraph');
  $.YearChart.highcharts({
      chart: {
          type: 'spline',
          zoomType: 'x',
          marginRight: 10,
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=temp&idx="+id+"&range=year",
                function(data) {
					if (typeof data.result != 'undefined') {
                      var series = $.YearChart.highcharts().series[0];
                      var datatable = [];
                      
                      $.each(data.result, function(i,item)
                      {
                        datatable.push( [GetDateFromString(item.d), parseFloat(item.ba) ] );
                      });
                      series.setData(datatable);
                    }
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('Barometer') + ' ' + $.i18n('Last Year')
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: $.i18n('Pressure') + ' (hPa)'
            },
            labels: {
							formatter: function(){
									return this.value;       
							}
						}
        },
		tooltip: {
		  crosshairs: true,
		  shared: true
		},
        plotOptions: {
            spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        series: [{
            name: 'Baro',
			tooltip: {
				valueSuffix: ' hPa',
				valueDecimals: 1
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowBaroLog);
					}
				}
			}
        }]
        ,
        legend: {
            enabled: false
        },
        navigation: {
            menuItemStyle: {
                fontSize: '10px'
            }
        }
    });
  $('#modal').hide();
  cursordefault();
  return false;
}

function ShowAirQualityLog(contentdiv,backfunction,id,name)
{
	clearInterval($.myglobals.refreshTimer);
  $('#modal').show();
  $.content=contentdiv;
  $.backfunction=backfunction;
  $.devIdx=id;
  $.devName=name;
  var htmlcontent = '';
  htmlcontent='<p><center><h2>' + name + '</h2></center></p>\n';
  htmlcontent+=$('#daymonthyearlog').html();
  $($.content).html(GetBackbuttonHTMLTable(backfunction)+htmlcontent);
  $($.content).i18n();

  $.DayChart = $($.content + ' #daygraph');
  $.DayChart.highcharts({
      chart: {
          type: 'spline',
          zoomType: 'x',
          marginRight: 10,
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=counter&idx="+id+"&range=day",
                function(data) {
					if (typeof data.result != 'undefined') {
                      var series = $.DayChart.highcharts().series[0];
                      var datatable = [];
                      
                      $.each(data.result, function(i,item)
                      {
                        datatable.push( [GetUTCFromString(item.d), parseInt(item.co2) ] );
                      });
                      series.setData(datatable);
                    }
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('Air Quality') + ' '  + Get5MinuteHistoryDaysGraphTitle()
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'co2 (ppm)'
            },
            min: 0,
            minorGridLineWidth: 0,
            gridLineWidth: 0,
            alternateGridColor: null,
            plotBands: [{ // Excellent
                from: 0,
                to: 700,
                color: 'rgba(68, 170, 213, 0.3)',
                label: {
                    text: $.i18n('Excellent'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // Good
                from: 700,
                to: 900,
                color: 'rgba(68, 170, 213, 0.5)',
                label: {
                    text: $.i18n('Good'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // Fair
                from: 900,
                to: 1100,
                color: 'rgba(68, 170, 213, 0.3)',
                label: {
                    text: $.i18n('Fair'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // Mediocre
                from: 1100,
                to: 1600,
                color: 'rgba(68, 170, 213, 0.5)',
                label: {
                    text: $.i18n('Mediocre'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // Bad
                from: 1600,
                to: 6000,
                color: 'rgba(68, 170, 213, 0.3)',
                label: {
                    text: $.i18n('Bad'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }
           ]
        },
		tooltip: {
		  crosshairs: true,
		  shared: true
		},
        plotOptions: {
            spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        series: [{
            name: 'co2',
			tooltip: {
				valueSuffix: ' ppm',
				valueDecimals: 0
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,true,ShowAirQualityLog);
					}
				}
			}
        }]
        ,
        navigation: {
            menuItemStyle: {
                fontSize: '10px'
            }
        }
    });

  $.MonthChart = $($.content + ' #monthgraph');
  $.MonthChart.highcharts({
      chart: {
          type: 'spline',
          zoomType: 'x',
          marginRight: 10,
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=counter&idx="+id+"&range=month",
                function(data) {
					if (typeof data.result != 'undefined') {
                      var datatable1 = [];
                      var datatable2 = [];
                      
                      $.each(data.result, function(i,item)
                      {
                        datatable1.push( [GetDateFromString(item.d), parseInt(item.co2_min) ] );
                        datatable2.push( [GetDateFromString(item.d), parseInt(item.co2_max) ] );
                      });
                      var series1 = $.MonthChart.highcharts().series[0];
                      var series2 = $.MonthChart.highcharts().series[1];
                      series1.setData(datatable1);
                      series2.setData(datatable2);
                    }
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('Air Quality') + ' ' + $.i18n('Last Month')
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'co2 (ppm)'
            },
            min: 0,
            minorGridLineWidth: 0,
            gridLineWidth: 0,
            alternateGridColor: null,
            plotBands: [{ // Excellent
                from: 0,
                to: 700,
                color: 'rgba(68, 170, 213, 0.3)',
                label: {
                    text: $.i18n('Excellent'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // Good
                from: 700,
                to: 900,
                color: 'rgba(68, 170, 213, 0.5)',
                label: {
                    text: $.i18n('Good'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // Fair
                from: 900,
                to: 1100,
                color: 'rgba(68, 170, 213, 0.3)',
                label: {
                    text: $.i18n('Fair'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // Mediocre
                from: 1100,
                to: 1600,
                color: 'rgba(68, 170, 213, 0.5)',
                label: {
                    text: $.i18n('Mediocre'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // Bad
                from: 1600,
                to: 6000,
                color: 'rgba(68, 170, 213, 0.3)',
                label: {
                    text: $.i18n('Bad'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }
           ]
        },
		tooltip: {
		  crosshairs: true,
		  shared: true
		},
        plotOptions: {
            spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        series: [{
            name: 'co2_min',
			tooltip: {
				valueSuffix: ' ppm',
				valueDecimals: 0
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowAirQualityLog);
					}
				}
			}
		}, {
            name: 'co2_max',
			tooltip: {
				valueSuffix: ' ppm',
				valueDecimals: 0
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowAirQualityLog);
					}
				}
			}
        }]
        ,
        navigation: {
            menuItemStyle: {
                fontSize: '10px'
            }
        }
    });

  $.YearChart = $($.content + ' #yeargraph');
  $.YearChart.highcharts({
      chart: {
          type: 'spline',
          zoomType: 'x',
          marginRight: 10,
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=counter&idx="+id+"&range=year",
                function(data) {
					if (typeof data.result != 'undefined') {
                      var datatable1 = [];
                      var datatable2 = [];
                      
                      $.each(data.result, function(i,item)
                      {
                        datatable1.push( [GetDateFromString(item.d), parseInt(item.co2_min) ] );
                        datatable2.push( [GetDateFromString(item.d), parseInt(item.co2_max) ] );
                      });
                      var series1 = $.YearChart.highcharts().series[0];
                      var series2 = $.YearChart.highcharts().series[1];
                      series1.setData(datatable1);
                      series2.setData(datatable2);
                    }
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('Air Quality') + ' ' + $.i18n('Last Year')
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'co2 (ppm)'
            },
            min: 0,
            minorGridLineWidth: 0,
            gridLineWidth: 0,
            alternateGridColor: null,
            plotBands: [{ // Excellent
                from: 0,
                to: 700,
                color: 'rgba(68, 170, 213, 0.3)',
                label: {
                    text: $.i18n('Excellent'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // Good
                from: 700,
                to: 900,
                color: 'rgba(68, 170, 213, 0.5)',
                label: {
                    text: $.i18n('Good'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // Fair
                from: 900,
                to: 1100,
                color: 'rgba(68, 170, 213, 0.3)',
                label: {
                    text: $.i18n('Fair'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // Mediocre
                from: 1100,
                to: 1600,
                color: 'rgba(68, 170, 213, 0.5)',
                label: {
                    text: $.i18n('Mediocre'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }, { // Bad
                from: 1600,
                to: 6000,
                color: 'rgba(68, 170, 213, 0.3)',
                label: {
                    text: $.i18n('Bad'),
                    style: {
                        color: '#CCCCCC'
                    }
                }
            }
           ]
        },
		tooltip: {
		  crosshairs: true,
		  shared: true
		},
        plotOptions: {
            spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        series: [{
            name: 'co2_min',
			tooltip: {
				valueSuffix: ' ppm',
				valueDecimals: 0
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowAirQualityLog);
					}
				}
			}
		}, {
            name: 'co2_max',
			tooltip: {
				valueSuffix: ' ppm',
				valueDecimals: 0
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowAirQualityLog);
					}
				}
			}
        }]
        ,
        navigation: {
            menuItemStyle: {
                fontSize: '10px'
            }
        }
    });
  $('#modal').hide();
  cursordefault();
  return false;
}


function ShowFanLog(contentdiv,backfunction,id,name,sensor)
{
	clearInterval($.myglobals.refreshTimer);
  $('#modal').show();
  $.content=contentdiv;
  $.backfunction=backfunction;
  $.devIdx=id;
  $.devName=name;
  var htmlcontent = '';
  htmlcontent='<p><center><h2>' + name + '</h2></center></p>\n';
  htmlcontent+=$('#daymonthyearlog').html();
  $($.content).html(GetBackbuttonHTMLTable(backfunction)+htmlcontent);
  $($.content).i18n();  

  $.DayChart = $($.content + ' #daygraph');
  $.DayChart.highcharts({
      chart: {
          type: 'spline',
          zoomType: 'x',
          marginRight: 10,
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=fan&idx="+id+"&range=day",
                function(data) {
					if (typeof data.result != 'undefined') {
                      var series = $.DayChart.highcharts().series[0];
                      var datatable = [];
                      
                      $.each(data.result, function(i,item)
                      {
                        datatable.push( [GetUTCFromString(item.d), parseInt(item.v) ] );
                      });
                      series.setData(datatable);
                    }
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('RPM') + ' '  + Get5MinuteHistoryDaysGraphTitle()
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'RPM'
            },
            min: 0,
            minorGridLineWidth: 0,
            gridLineWidth: 0,
            alternateGridColor: null
        },
		tooltip: {
		  crosshairs: true,
		  shared: true
		},
        plotOptions: {
			series: {
				point: {
					events: {
						click: function(event) {
							chartPointClickNew(event,true,ShowFanLog);
						}
					}
				}
			},
            spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        series: [{
            name: sensor,
			tooltip: {
				valueSuffix: ' rpm',
				valueDecimals: 0
			},
        }]
        ,
        navigation: {
            menuItemStyle: {
                fontSize: '10px'
            }
        },
        legend: {
            enabled: false
        }
    });
  
  $.MonthChart = $($.content + ' #monthgraph');
  $.MonthChart.highcharts({
      chart: {
          type: 'spline',
          zoomType: 'x',
          marginRight: 10,
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=fan&idx="+id+"&range=month",
                function(data) {
					if (typeof data.result != 'undefined') {
                      var datatable1 = [];
                      var datatable2 = [];
                      
                      $.each(data.result, function(i,item)
                      {
                        datatable1.push( [GetDateFromString(item.d), parseInt(item.v_min) ] );
                        datatable2.push( [GetDateFromString(item.d), parseInt(item.v_max) ] );
                      });
                      var series1 = $.MonthChart.highcharts().series[0];
                      var series2 = $.MonthChart.highcharts().series[1];
                      series1.setData(datatable1);
                      series2.setData(datatable2);
                   }
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('RPM') + ' ' + $.i18n('Last Month')
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'RPM'
            },
            min: 0,
            minorGridLineWidth: 0,
            gridLineWidth: 0,
            alternateGridColor: null
        },
		tooltip: {
		  crosshairs: true,
		  shared: true
		},
        plotOptions: {
            spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        series: [{
            name: 'min',
			tooltip: {
				valueSuffix: ' rpm',
				valueDecimals: 0
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowFanLog);
					}
				}
			}
		}, {
            name: 'max',
			tooltip: {
				valueSuffix: ' rpm',
				valueDecimals: 0
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowFanLog);
					}
				}
			}
        }]
        ,
        navigation: {
            menuItemStyle: {
                fontSize: '10px'
            }
        }
    });

  $.YearChart = $($.content + ' #yeargraph');
  $.YearChart.highcharts({
      chart: {
          type: 'spline',
          zoomType: 'x',
          marginRight: 10,
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=fan&idx="+id+"&range=year",
                function(data) {
					if (typeof data.result != 'undefined') {
                      var datatable1 = [];
                      var datatable2 = [];
                      
                      $.each(data.result, function(i,item)
                      {
                        datatable1.push( [GetDateFromString(item.d), parseInt(item.v_min) ] );
                        datatable2.push( [GetDateFromString(item.d), parseInt(item.v_max) ] );
                      });
                      var series1 = $.YearChart.highcharts().series[0];
                      var series2 = $.YearChart.highcharts().series[1];
                      series1.setData(datatable1);
                      series2.setData(datatable2);
                    }
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('RPM') + ' ' + $.i18n('Last Year')
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'RPM'
            },
            min: 0,
            minorGridLineWidth: 0,
            gridLineWidth: 0,
            alternateGridColor: null
        },
		tooltip: {
		  crosshairs: true,
		  shared: true
		},
        plotOptions: {
            spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        series: [{
            name: 'min',
			tooltip: {
				valueSuffix: ' rpm',
				valueDecimals: 0
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowFanLog);
					}
				}
			}
		}, {
            name: 'max',
			tooltip: {
				valueSuffix: ' rpm',
				valueDecimals: 0
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowFanLog);
					}
				}
			}
        }]
        ,
        navigation: {
            menuItemStyle: {
                fontSize: '10px'
            }
        }
    });
	$('#modal').hide();
  cursordefault();
  return false;
}
function ShowPercentageLog(contentdiv,backfunction,id,name)
{
	clearInterval($.myglobals.refreshTimer);
  $('#modal').show();
  $.content=contentdiv;
  $.backfunction=backfunction;
  $.devIdx=id;
  $.devName=name;
  var htmlcontent = '';
  htmlcontent='<p><center><h2>' + name + '</h2></center></p>\n';
  htmlcontent+=$('#daymonthyearlog').html();
  $($.content).html(GetBackbuttonHTMLTable(backfunction)+htmlcontent);
  $($.content).i18n();  

  $.DayChart = $($.content + ' #daygraph');
  $.DayChart.highcharts({
      chart: {
          type: 'spline',
          zoomType: 'x',
          marginRight: 10,
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=Percentage&idx="+id+"&range=day",
                function(data) {
					if (typeof data.result != 'undefined') {
                      var series = $.DayChart.highcharts().series[0];
                      var datatable = [];
                      
                      $.each(data.result, function(i,item)
                      {
                        datatable.push( [GetUTCFromString(item.d), parseFloat(item.v) ] );
                      });
                      series.setData(datatable);
                    }
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('Percentage') + ' '  + Get5MinuteHistoryDaysGraphTitle()
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'Percentage'
            },
            min: 0,
            minorGridLineWidth: 0,
            gridLineWidth: 0,
            alternateGridColor: null
        },
		tooltip: {
		  crosshairs: true,
		  shared: true
		},
        plotOptions: {
			series: {
				point: {
					events: {
						click: function(event) {
							chartPointClickNew(event,true,ShowPercentageLog);
						}
					}
				}
			},
            spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        series: [{
            name: 'Percentage',
			tooltip: {
				valueSuffix: ' %',
				valueDecimals: 2
			},
        }]
        ,
        navigation: {
            menuItemStyle: {
                fontSize: '10px'
            }
        }
    });
  
  $.MonthChart = $($.content + ' #monthgraph');
  $.MonthChart.highcharts({
      chart: {
          type: 'spline',
          zoomType: 'x',
          marginRight: 10,
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=Percentage&idx="+id+"&range=month",
                function(data) {
					if (typeof data.result != 'undefined') {
                      var datatable1 = [];
                      var datatable2 = [];
                      var datatable3 = [];
                      
                      $.each(data.result, function(i,item)
                      {
                        datatable1.push( [GetDateFromString(item.d), parseFloat(item.v_min) ] );
                        datatable2.push( [GetDateFromString(item.d), parseFloat(item.v_max) ] );
                        datatable3.push( [GetDateFromString(item.d), parseFloat(item.v_avg) ] );
                      });
                      var series1 = $.MonthChart.highcharts().series[0];
                      var series2 = $.MonthChart.highcharts().series[1];
                      var series3 = $.MonthChart.highcharts().series[2];
                      series1.setData(datatable1);
                      series2.setData(datatable2);
                      series3.setData(datatable3);
                    }
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('Percentage') + ' ' + $.i18n('Last Month')
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'Percentage'
            },
            min: 0,
            minorGridLineWidth: 0,
            gridLineWidth: 0,
            alternateGridColor: null
        },
		tooltip: {
		  crosshairs: true,
		  shared: true
		},
        plotOptions: {
            spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        series: [{
            name: 'min',
			tooltip: {
				valueSuffix: ' %',
				valueDecimals: 2
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowPercentageLog);
					}
				}
			}
		}, {
            name: 'max',
			tooltip: {
				valueSuffix: ' %',
				valueDecimals: 2
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowPercentageLog);
					}
				}
			}
		}, {
            name: 'avg',
			tooltip: {
				valueSuffix: ' %',
				valueDecimals: 2
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowPercentageLog);
					}
				}
			}
        }]
        ,
        navigation: {
            menuItemStyle: {
                fontSize: '10px'
            }
        }
    });

  $.YearChart = $($.content + ' #yeargraph');
  $.YearChart.highcharts({
      chart: {
          type: 'spline',
          zoomType: 'x',
          marginRight: 10,
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=Percentage&idx="+id+"&range=year",
                function(data) {
					if (typeof data.result != 'undefined') {
                      var datatable1 = [];
                      var datatable2 = [];
                      var datatable3 = [];
                      
                      $.each(data.result, function(i,item)
                      {
                        datatable1.push( [GetDateFromString(item.d), parseFloat(item.v_min) ] );
                        datatable2.push( [GetDateFromString(item.d), parseFloat(item.v_max) ] );
                        datatable3.push( [GetDateFromString(item.d), parseFloat(item.v_avg) ] );
                      });
                      var series1 = $.YearChart.highcharts().series[0];
                      var series2 = $.YearChart.highcharts().series[1];
                      var series3 = $.YearChart.highcharts().series[2];
                      series1.setData(datatable1);
                      series2.setData(datatable2);
                      series3.setData(datatable3);
                    }
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('Percentage') + ' ' + $.i18n('Last Year')
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'Percentage'
            },
            min: 0,
            minorGridLineWidth: 0,
            gridLineWidth: 0,
            alternateGridColor: null
        },
		tooltip: {
		  crosshairs: true,
		  shared: true
		},
        plotOptions: {
            spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        series: [{
            name: 'min',
			tooltip: {
				valueSuffix: ' %',
				valueDecimals: 2
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowPercentageLog);
					}
				}
			}
		}, {
            name: 'max',
			tooltip: {
				valueSuffix: ' %',
				valueDecimals: 2
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowPercentageLog);
					}
				}
			}
		}, {
            name: 'avg',
			tooltip: {
				valueSuffix: ' %',
				valueDecimals: 2
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowPercentageLog);
					}
				}
			}
        }]
        ,
        navigation: {
            menuItemStyle: {
                fontSize: '10px'
            }
        }
    });
	$('#modal').hide();
  cursordefault();
  return false;
}




function AddDataToUtilityChart(data,chart,switchtype)
{
    var datatableUsage1 = [];
    var datatableUsage2 = [];
    var datatableReturn1 = [];
    var datatableReturn2 = [];
    var datatableTotalUsage = [];
    var datatableTotalReturn = [];

    var datatableUsage1Prev = [];
    var datatableUsage2Prev = [];
    var datatableReturn1Prev = [];
    var datatableReturn2Prev = [];
    var datatableTotalUsagePrev = [];
    var datatableTotalReturnPrev = [];

	var bHaveDelivered=(typeof data.delivered!= 'undefined');

	var bHavePrev=(typeof data.resultprev!= 'undefined');
	if (bHavePrev)
	{
		$.each(data.resultprev, function(i,item)
		{
			var cdate=GetPrevDateFromString(item.d);
			datatableUsage1Prev.push( [cdate, parseFloat(item.v) ] );
			if (typeof item.v2!= 'undefined') {
				datatableUsage2Prev.push( [cdate, parseFloat(item.v2) ] );
			}
			if (bHaveDelivered) {
				datatableReturn1Prev.push( [cdate, parseFloat(item.r1) ] );
				if (typeof item.r2!= 'undefined') {
					datatableReturn2Prev.push( [cdate, parseFloat(item.r2) ] );
				}
			}
			if (datatableUsage2Prev.length>0) {
				datatableTotalUsagePrev.push( [cdate, parseFloat(item.v)+parseFloat(item.v2) ] );
			}
			else {
				datatableTotalUsagePrev.push( [cdate, parseFloat(item.v) ] );
			}
			if (datatableUsage2Prev.length>0) {
				datatableTotalReturnPrev.push( [cdate, parseFloat(item.r1)+parseFloat(item.r2) ] );
			}
			else {
				if (typeof item.r1!= 'undefined') {
					datatableTotalReturnPrev.push( [cdate, parseFloat(item.r1) ] );
				}
			}
		});
	}
	
    $.each(data.result, function(i,item)
    {
			if (chart == $.DayChart) {
				var cdate=GetUTCFromString(item.d);
				datatableUsage1.push( [cdate, parseFloat(item.v) ] );
				if (typeof item.v2!= 'undefined') {
					datatableUsage2.push( [cdate, parseFloat(item.v2) ] );
				}
				if (bHaveDelivered) {
					datatableReturn1.push( [cdate, parseFloat(item.r1) ] );
					if (typeof item.r2!= 'undefined') {
						datatableReturn2.push( [cdate, parseFloat(item.r2) ] );
					}
				}
			}
			else {
				var cdate=GetDateFromString(item.d);
				datatableUsage1.push( [cdate, parseFloat(item.v) ] );
				if (typeof item.v2!= 'undefined') {
					datatableUsage2.push( [cdate, parseFloat(item.v2) ] );
				}
				if (bHaveDelivered) {
					datatableReturn1.push( [cdate, parseFloat(item.r1) ] );
					if (typeof item.r2!= 'undefined') {
						datatableReturn2.push( [cdate, parseFloat(item.r2) ] );
					}
				}
				if (datatableUsage2.length>0) {
					datatableTotalUsage.push( [cdate, parseFloat(item.v)+parseFloat(item.v2) ] );
				}
				else {
					datatableTotalUsage.push( [cdate, parseFloat(item.v) ] );
				}
				if (datatableUsage2.length>0) {
					datatableTotalReturn.push( [cdate, parseFloat(item.r1)+parseFloat(item.r2) ] );
				}
				else {
					if (typeof item.r1!= 'undefined') {
						datatableTotalReturn.push( [cdate, parseFloat(item.r1) ] );
					}
				}
			}
    });

    var series;
    if (switchtype==0)
    {
		if ((chart == $.DayChart)||(chart == $.WeekChart)) {
			var totDecimals=3;
			if (chart == $.DayChart) {
				totDecimals=0;
			}
			if (datatableUsage1.length>0) {
				if (datatableUsage2.length>0) {
					chart.highcharts().addSeries({
						id: 'usage1',
						name: 'Usage_1',
						tooltip: {
							valueSuffix: ' Watt',
							valueDecimals: totDecimals
						},
						color: 'rgba(60,130,252,0.8)',
						stack: 'susage',
						yAxis: 0
					});
				}
				else {
					chart.highcharts().addSeries({
					  id: 'usage1',
					  name: 'Usage',
						tooltip: {
							valueSuffix: ' Watt',
							valueDecimals: totDecimals
						},
					  color: 'rgba(3,190,252,0.8)',
					  stack: 'susage',
					  yAxis: 0
					});
				}
				series = chart.highcharts().get('usage1');
				series.setData(datatableUsage1);
			}
			if (datatableUsage2.length>0) {
				chart.highcharts().addSeries({
				  id: 'usage2',
				  name: 'Usage_2',
					tooltip: {
						valueSuffix: ' Watt',
						valueDecimals: totDecimals
					},
				  color: 'rgba(3,190,252,0.8)',
				  stack: 'susage',
				  yAxis: 0
				});
				series = chart.highcharts().get('usage2');
				series.setData(datatableUsage2);
			}
			if (bHaveDelivered) {
				if (datatableReturn1.length>0) {
					chart.highcharts().addSeries({
						id: 'return1',
						name: 'Return_1',
						tooltip: {
							valueSuffix: ' Watt',
							valueDecimals: totDecimals
						},
						color: 'rgba(30,242,110,0.8)',
						stack: 'sreturn',
						yAxis: 0
					});
					series = chart.highcharts().get('return1');
					series.setData(datatableReturn1);
				}
				if (datatableReturn2.length>0) {
					chart.highcharts().addSeries({
						id: 'return2',
						name: 'Return_2',
						tooltip: {
							valueSuffix: ' Watt',
							valueDecimals: totDecimals
						},				
						color: 'rgba(3,252,190,0.8)',
						stack: 'sreturn',
						yAxis: 0
					});
					series = chart.highcharts().get('return2');
					series.setData(datatableReturn2);
				}
			}
		}
		else {
			//month/year, show total for now
			if (datatableTotalUsage.length>0) {
				chart.highcharts().addSeries({
				  id: 'usage',
				  name: 'Total_Usage',
					zIndex: 2,
					tooltip: {
						valueSuffix: ' kWh',
						valueDecimals: 3
					},
				  color: 'rgba(3,190,252,0.8)',
				  yAxis: 0
				});
				series = chart.highcharts().get('usage');
				series.setData(datatableTotalUsage);
				var trandLine = CalculateTrendLine(datatableTotalUsage);
				if (typeof trandLine != 'undefined') {
					var datatableTrendlineUsage = [];
					
					datatableTrendlineUsage.push( [trandLine.x0, trandLine.y0 ] );
					datatableTrendlineUsage.push( [trandLine.x1, trandLine.y1 ] );
					
					chart.highcharts().addSeries({
					  id: 'usage_trendline',
					  name: 'Trendline_Usage',
						zIndex: 1,
						tooltip: {
							valueSuffix: ' kWh',
							valueDecimals: 3
						},
					  color: 'rgba(252,3,3,0.8)',
					  yAxis: 0
					});
					series = chart.highcharts().get('usage_trendline');
					series.setData(datatableTrendlineUsage);
					series.setVisible(false);
				}
			}
			if (bHaveDelivered) {
				if (datatableTotalReturn.length>0) {
					chart.highcharts().addSeries({
						id: 'return',
						name: 'Total_Return',
						zIndex: 1,
						tooltip: {
							valueSuffix: ' kWh',
							valueDecimals: 3
						},
						color: 'rgba(3,252,190,0.8)',
						yAxis: 0
					});
					series = chart.highcharts().get('return');
					series.setData(datatableTotalReturn);
					var trandLine = CalculateTrendLine(datatableTotalReturn);
					if (typeof trandLine != 'undefined') {
						var datatableTrendlineReturn = [];
						
						datatableTrendlineReturn.push( [trandLine.x0, trandLine.y0 ] );
						datatableTrendlineReturn.push( [trandLine.x1, trandLine.y1 ] );
						
						chart.highcharts().addSeries({
						  id: 'return_trendline',
						  name: 'Trendline_Return',
							zIndex: 1,
							tooltip: {
								valueSuffix: ' kWh',
								valueDecimals: 3
							},
						  color: 'rgba(255,127,39,0.8)',
						  yAxis: 0
						});
						series = chart.highcharts().get('return_trendline');
						series.setData(datatableTrendlineReturn);
						series.setVisible(false);
					}
				}
			}
			if (datatableTotalUsagePrev.length>0) {
				chart.highcharts().addSeries({
				  id: 'usageprev',
				  name: 'Past_Usage',
					tooltip: {
						valueSuffix: ' kWh',
						valueDecimals: 3
					},
				  color: 'rgba(190,3,252,0.8)',
				  yAxis: 0
				});
				series = chart.highcharts().get('usageprev');
				series.setData(datatableTotalUsagePrev);
				series.setVisible(false);
			}
			if (bHaveDelivered) {
				if (datatableTotalReturnPrev.length>0) {
					chart.highcharts().addSeries({
						id: 'returnprev',
						name: 'Past_Return',
						tooltip: {
							valueSuffix: ' kWh',
							valueDecimals: 3
						},
						color: 'rgba(252,190,3,0.8)',
						yAxis: 0
					});
					series = chart.highcharts().get('returnprev');
					series.setData(datatableTotalReturnPrev);
					series.setVisible(false);
				}
			}
		}

		if (chart == $.DayChart) {
			chart.highcharts().yAxis[0].axisTitle.attr({
				text: $.i18n('Energy') + ' Watt'
			});			
		}
		else {
			chart.highcharts().yAxis[0].axisTitle.attr({
				text: $.i18n('Energy') + ' kWh'
			});			
		}
		chart.highcharts().yAxis[0].redraw();
    }
    else if (switchtype==1)
    {
		//gas
		chart.highcharts().addSeries({
          id: 'gas',
          name: 'Gas',
		  zIndex: 1,
			tooltip: {
				valueSuffix: ' m3',
				valueDecimals: 3
			},
          color: 'rgba(3,190,252,0.8)',
          yAxis: 0
        });
		if ((chart == $.MonthChart)||(chart == $.YearChart)) {
			var trandLine = CalculateTrendLine(datatableUsage1);
			if (typeof trandLine != 'undefined') {
				var datatableTrendlineUsage = [];
				
				datatableTrendlineUsage.push( [trandLine.x0, trandLine.y0 ] );
				datatableTrendlineUsage.push( [trandLine.x1, trandLine.y1 ] );
				
				chart.highcharts().addSeries({
				  id: 'usage_trendline',
				  name: 'Trendline_Gas',
					zIndex: 1,
					tooltip: {
						valueSuffix: ' m3',
						valueDecimals: 3
					},
				  color: 'rgba(252,3,3,0.8)',
				  yAxis: 0
				});
				series = chart.highcharts().get('usage_trendline');
				series.setData(datatableTrendlineUsage);
				series.setVisible(false);
			}
			if (datatableUsage1Prev.length>0) {
				chart.highcharts().addSeries({
				  id: 'gasprev',
				  name: 'Past_Gas',
					tooltip: {
						valueSuffix: ' m3',
						valueDecimals: 3
					},
				  color: 'rgba(190,3,252,0.8)',
				  yAxis: 0
				});
				series = chart.highcharts().get('gasprev');
				series.setData(datatableUsage1Prev);
				series.setVisible(false);
			}
		}
		series = chart.highcharts().get('gas');
		series.setData(datatableUsage1);
		chart.highcharts().yAxis[0].axisTitle.attr({
			text: 'Gas m3'
		});
    }
    else if (switchtype==2)
    {
		//water
		chart.highcharts().addSeries({
          id: 'water',
          name: 'Water',
			tooltip: {
				valueSuffix: ' m3',
				valueDecimals: 3
			},
          color: 'rgba(3,190,252,0.8)',
          yAxis: 0
        });
		chart.highcharts().yAxis[0].axisTitle.attr({
			text: 'Water m3'
		});			
		series = chart.highcharts().get('water');
		series.setData(datatableUsage1);
    }
    else if (switchtype==3)
    {
		//counter
		chart.highcharts().addSeries({
          id: 'counter',
          name: 'Counter',
          color: 'rgba(3,190,252,0.8)',
          yAxis: 0
        });
		chart.highcharts().yAxis[0].axisTitle.attr({
			text: 'Count'
		});			
		series = chart.highcharts().get('counter');
		series.setData(datatableUsage1);
    }
}


function ShowSmartLog(contentdiv,backfunction,id,name,switchtype)
{
	clearInterval($.myglobals.refreshTimer);
  $('#modal').show();
  $.content=contentdiv;
  $.backfunction=backfunction;
  $.devIdx=id;
  $.devName=name;
  $.devSwitchType=switchtype;
  var htmlcontent = '';
  htmlcontent='<p><center><h2>' + name + '</h2></center></p>\n';
  htmlcontent+=$('#dayweekmonthyearlog').html();

	$.costsT1=0.2389;
	$.costsT2=0.2389;
	$.costsGas=0.6218;
	$.costsWater=1.6473;

	$.ajax({
		 url: "json.htm?type=command&param=getcosts&idx="+$.devIdx,
		 async: false, 
		 dataType: 'json',
		 success: function(data) {
			$.costsT1=parseFloat(data.CostEnergy)/10000;
			$.costsT2=parseFloat(data.CostEnergyT2)/10000;
			$.costsGas=parseFloat(data.CostGas)/10000;
			$.costsWater=parseFloat(data.CostWater)/10000;
			$.CounterT1=parseFloat(data.CounterT1);
			$.CounterT2=parseFloat(data.CounterT2);
			$.CounterR1=parseFloat(data.CounterR1);
			$.CounterR2=parseFloat(data.CounterR2);
		 }
	});

	$.costsR1=$.costsT1;
	$.costsR2=$.costsT2;

	$.monthNames = [ "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December" ];
    
	var d = new Date();
	var actMonth = d.getMonth()+1;
	var actYear = d.getYear()+1900;

  $($.content).html(GetBackbuttonHTMLTableWithRight(backfunction,'ShowP1YearReport('+actYear+')',$.i18n('Report'))+htmlcontent);
  $($.content).i18n();
  
  $.DayChart = $($.content + ' #daygraph');
  $.DayChart.highcharts({
      chart: {
          type: 'line',
          zoomType: 'x',
          events: {
              load: function() {
                $.getJSON("json.htm?type=graph&sensor=counter&idx="+id+"&range=day",
                function(data) {
					if (typeof data.result != 'undefined') {
						AddDataToUtilityChart(data,$.DayChart,switchtype);
					}
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: Get5MinuteHistoryDaysGraphTitle()
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
				title: {
					text: $.i18n('Usage')
				},
				min: 0,
				endOnTick: false,
				startOnTick: false
		},
		tooltip: {
		  crosshairs: true,
		  shared: true
		},
        plotOptions: {
			series: {
				point: {
					events: {
						click: function(event) {
							chartPointClickNewEx(event,true,ShowSmartLog);
						}
					}
				}
			},
			line: {
				lineWidth: 3,
				states: {
					hover: {
							lineWidth: 3
					}
				},
				marker: {
					enabled: false,
					states: {
							hover: {
									enabled: true,
									symbol: 'circle',
									radius: 5,
									lineWidth: 1
							}
					}
				}
			}
        },
        legend: {
            enabled: true
        }
    });
  
  $.WeekChart = $($.content + ' #weekgraph');
  $.WeekChart.highcharts({
      chart: {
          type: 'column',
          marginRight: 10,
          events: {
              load: function() {
                $.getJSON("json.htm?type=graph&sensor=counter&idx="+id+"&range=week",
                function(data) {
					if (typeof data.result != 'undefined') {
						AddDataToUtilityChart(data,$.WeekChart,switchtype);
					}
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('Last Week')
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                day: '%a'
            },
            tickInterval: 24 * 3600 * 1000
        },
        yAxis: {
            title: {
                text: $.i18n('Energy') + ' (kWh)'
            },
            min: 0
        },
        tooltip: {
            formatter: function() {
					var unit = {
						'Usage': 'Watt',
						'Usage_1': 'kWh',
						'Usage_2': 'kWh',
						'Return_1': 'kWh',
						'Return_2': 'kWh',
						'Gas': 'm3',
						'Past_Gas': 'm3',
						'Water': 'm3'
					}[this.series.name];
                    return $.i18n(Highcharts.dateFormat('%A',this.x)) + ' ' + Highcharts.dateFormat('%Y-%m-%d', this.x) +'<br/>'+ this.series.name + ': ' + this.y + ' ' + unit + '<br/>Total: '+ this.point.stackTotal + ' ' + unit;
            }
        },
        plotOptions: {
            column: {
				stacking: 'normal',
                minPointLength: 4,
                pointPadding: 0.1,
                groupPadding: 0
            }
        },
        legend: {
            enabled: true
        }
    });

  $.MonthChart = $($.content + ' #monthgraph');
  $.MonthChart.highcharts({
      chart: {
          type: 'spline',
          marginRight: 10,
          zoomType: 'x',
          events: {
              load: function() {
                $.getJSON("json.htm?type=graph&sensor=counter&idx="+id+"&range=month",
                function(data) {
					if (typeof data.result != 'undefined') {
						AddDataToUtilityChart(data,$.MonthChart,switchtype);
					}
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('Last Month')
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: $.i18n('Usage')
            },
            min: 0
        },
		tooltip: {
		  crosshairs: true,
		  shared: true
		},
        plotOptions: {
			series: {
				point: {
					events: {
						click: function(event) {
							chartPointClickNewEx(event,false,ShowSmartLog);
						}
					}
				}
			},
			spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        legend: {
            enabled: true
        }
    });

  $.YearChart = $($.content + ' #yeargraph');
  $.YearChart.highcharts({
      chart: {
          type: 'spline',
          marginRight: 10,
          zoomType: 'x',
          events: {
              load: function() {
                $.getJSON("json.htm?type=graph&sensor=counter&idx="+id+"&range=year",
                function(data) {
					if (typeof data.result != 'undefined') {
						AddDataToUtilityChart(data,$.YearChart,switchtype);
					}
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('Last Year')
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: $.i18n('Usage')
            },
            min: 0
        },
		tooltip: {
		  crosshairs: true,
		  shared: true
		},
        plotOptions: {
			series: {
				point: {
					events: {
						click: function(event) {
							chartPointClickNewEx(event,false,ShowSmartLog);
						}
					}
				}
			},
			spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        legend: {
            enabled: true
        }
    });
}

function OnSelChangeYearP1ReportGas()
{
	var yearidx=$($.content + ' #comboyear option:selected').val();
	if (typeof yearidx == 'undefined') {
		return ;
	}
	ShowP1YearReportGas(yearidx);
}

function ShowP1MonthReportGas(actMonth,actYear)
{
  var htmlcontent = '';

  htmlcontent+=$('#toptextmonthgas').html();
  htmlcontent+=$('#monthreportviewgas').html();
  $($.content).html(htmlcontent);
  $($.content).i18n();

  $($.content + ' #theader').html($.i18n("Usage")+ " "+ $.i18n($.monthNames[actMonth-1])+" " + actYear);

	if ($.devSwitchType==0) {
		//Electra
		$($.content + ' #munit').html("kWh");
	}
	else if ($.devSwitchType==1) {
		//Gas
		$($.content + ' #munit').html("m3");
	}
	else {
		//Water
		$($.content + ' #munit').html("m3");
	}

  $($.content + ' #monthreport').dataTable( {
		"sDom": '<"H"rC>t<"F">',
		"oTableTools": {
			"sRowSelect": "single"
		},
		"aaSorting": [[ 0, "asc" ]],
		"aoColumnDefs": [
			{ "bSortable": false, "aTargets": [ 3 ] }
		],
		"bSortClasses": false,
		"bProcessing": true,
		"bStateSave": false,
		"bJQueryUI": true,
		"aLengthMenu": [[50, 100, -1], [50, 100, "All"]],
		"iDisplayLength" : 50
  });
  var mTable = $($.content + ' #monthreport');
  var oTable = mTable.dataTable();
  oTable.fnClearTable();

  $.UsageChart = $($.content + ' #usagegraph');
  $.UsageChart.highcharts({
      chart: {
          type: 'column'
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: ''
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            min: 0,
            maxPadding: 0.2,
            endOnTick: false,
            title: {
                text: $.i18n('Usage')
            },
            min: 0
        },
        tooltip: {
            formatter: function() {
										var unit = {
																'Power': 'kWh',
																'Total_Usage': 'kWh',
																'Past_Usage': 'kWh',
																'Return': 'kWh',
																'Gas': 'm3',
																'Past_Gas': 'm3',
																'Water': 'm3'
													}[this.series.name];
                    return $.i18n(Highcharts.dateFormat('%A',this.x)) + ' ' + Highcharts.dateFormat('%B %d', this.x) + '<br/>' + this.series.name + ': ' + this.y + ' ' + unit;
            }
        },
        plotOptions: {
            column: {
                minPointLength: 4,
                pointPadding: 0.1,
                groupPadding: 0
            }
        },
        legend: {
            enabled: true
        }
    });
  
  var total=0;
  var datachart = [];
  
	$.getJSON("json.htm?type=graph&sensor=counter&idx="+$.devIdx+"&range=year&actmonth="+actMonth+"&actyear="+actYear,
	function(data) {
		var lastTotal=-1;
	    $.each(data.result, function(i,item)
		{
			var month=parseInt(item.d.substring(5, 7), 10);
			var year=parseInt(item.d.substring(0, 4), 10);

			if ((month==actMonth)&&(year==actYear)) {
				var day=parseInt(item.d.substring(8, 10), 10);
				var Usage=parseFloat(item.v);
			
				total+=Usage;

				var cdate = Date.UTC(actYear,actMonth-1,day);
				datachart.push( [cdate, parseFloat(item.v) ] );

				var rcost;
				if ($.devSwitchType==0) {
					//Electra
					rcost=Usage*$.costsT1;
				}
				else if ($.devSwitchType==1) {
					//Gas
					rcost=Usage*$.costsGas;
				}
				else {
					//Water
					rcost=Usage*$.costsWater;
				}

				var img;
				if ((lastTotal==-1)||(lastTotal==Usage)) {
					img='<img src="images/equal.png"></img>';
				}
				else if (Usage<lastTotal) {
					img='<img src="images/down.png"></img>';
				}
				else {
					img='<img src="images/up.png"></img>';
				}
				lastTotal=Usage;

				var addId = oTable.fnAddData([
					  day,
					  Usage.toFixed(3),
					  rcost.toFixed(2),
					  img
					], false);
			}
		});

	  $($.content + ' #tu').html(total.toFixed(3));
	  
		var montlycosts;
		if ($.devSwitchType==0) {
			//Electra
			montlycosts=(total*$.costsT1)
			$.UsageChart.highcharts().addSeries({
			  id: 'power',
			  name: 'Power',
			  showInLegend: false,
			  color: 'rgba(3,190,252,0.8)',
			  yAxis: 0
			});
			var series = $.UsageChart.highcharts().get('power');
			series.setData(datachart);
		}
		else if ($.devSwitchType==1) {
			//Gas
			montlycosts=(total*$.costsGas)
			$.UsageChart.highcharts().addSeries({
			  id: 'gas',
			  name: 'Gas',
			  showInLegend: false,
			  color: 'rgba(3,190,252,0.8)',
			  yAxis: 0
			});
			var series = $.UsageChart.highcharts().get('gas');
			series.setData(datachart);
		}
		else {
			//Water
			montlycosts=(total*$.costsWater)
			$.UsageChart.highcharts().addSeries({
			  id: 'water',
			  name: 'Water',
			  showInLegend: false,
			  color: 'rgba(3,190,252,0.8)',
			  yAxis: 0
			});
			var series = $.UsageChart.highcharts().get('water');
			series.setData(datachart);
		}
		$($.content + ' #mc').html(montlycosts.toFixed(2));
	  
	  mTable.fnDraw();
		/* Add a click handler to the rows - this could be used as a callback */
		$($.content + ' #monthreport tbody tr').click( function( e ) {
			if ( $(this).hasClass('row_selected') ) {
				$(this).removeClass('row_selected');
			}
			else {
				oTable.$('tr.row_selected').removeClass('row_selected');
				$(this).addClass('row_selected');
			}
		});  
	});

  return false;
}
function addLeadingZeros(n, length)
{
    var str = n.toString();
    var zeros = "";
    for (var i = length - str.length; i > 0; i--)
        zeros += "0";
    zeros += str;
    return zeros;
}

function Add2YearTableP1ReportGas(oTable,total,lastTotal,lastMonth,actYear)
{
	var rcost;
	if ($.devSwitchType==0) {
		//Electra
		rcost=total*$.costsT1;
	}
	else if ($.devSwitchType==1) {
		//Gas
		rcost=total*$.costsGas;
	}
	else {
		//Water
		rcost=total*$.costsWater;
	}

	var img;
	if ((lastTotal==-1)||(lastTotal==total)) {
		img='<img src="images/equal.png"></img>';
	}
	else if (total<lastTotal) {
		img='<img src="images/down.png"></img>';
	}
	else {
		img='<img src="images/up.png"></img>';
	}

	var monthtxt=addLeadingZeros(parseInt(lastMonth),2) + ". " + $.i18n($.monthNames[lastMonth-1]) + " ";
	monthtxt+='<img src="images/next.png" onclick="ShowP1MonthReportGas(' + lastMonth +',' + actYear + ')">';

	var addId = oTable.fnAddData([
		  monthtxt,
		  total.toFixed(3),
		  rcost.toFixed(2),
		  img
		], false);
	return total;
}

function ShowP1YearReportGas(actYear)
{
	if (actYear==0) {
		actYear=$.actYear;
	}
	else {
		$.actYear=actYear;
	}
  var htmlcontent = '';
  htmlcontent+=$('#toptextyeargas').html();
  htmlcontent+=$('#yearreportviewgas').html();
  
  $($.content).html(htmlcontent);
  $($.content + ' #backbutton').click( function( e ) {
	eval($.backfunction)();
  });
  $($.content).i18n();

  $($.content + ' #theader').html($.i18n("Usage") + " "+actYear);

	if ($.devSwitchType==0) {
		//Electra
		$($.content + ' #munit').html("kWh");
	}
	else if ($.devSwitchType==1) {
		//Gas
		$($.content + ' #munit').html("m3");
	}
	else {
		//Water
		$($.content + ' #munit').html("m3");
	}

	$($.content + ' #comboyear').val(actYear);
	
	$($.content + ' #comboyear').change(function() { 
		OnSelChangeYearP1ReportGas();
	});
	$($.content + ' #comboyear').keypress(function() {
	  $(this).change();
	});

  $($.content + ' #yearreport').dataTable( {
		"sDom": '<"H"rC>t<"F">',
		"oTableTools": {
			"sRowSelect": "single"
		},
		"aaSorting": [[ 0, "asc" ]],
		"aoColumnDefs": [
			{ "bSortable": false, "aTargets": [ 3 ] }
		],
		"bSortClasses": false,
		"bProcessing": true,
		"bStateSave": false,
		"bJQueryUI": true,
		"aLengthMenu": [[50, 100, -1], [50, 100, "All"]],
		"iDisplayLength" : 50
  });

  var mTable = $($.content + ' #yearreport');
  var oTable = mTable.dataTable();
  oTable.fnClearTable();

  $.UsageChart = $($.content + ' #usagegraph');
  $.UsageChart.highcharts({
      chart: {
          type: 'column'
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: ''
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            min: 0,
            maxPadding: 0.2,
            endOnTick: false,
            title: {
                text: $.i18n('Usage')
            },
            min: 0
        },
        tooltip: {
            formatter: function() {
										var unit = {
																'Power': 'kWh',
																'Total_Usage': 'kWh',
																'Past_Usage': 'kWh',
																'Return': 'kWh',
																'Gas': 'm3',
																'Past_Gas': 'm3',
																'Water': 'm3'
													}[this.series.name];
                    return $.i18n(Highcharts.dateFormat('%B', this.x)) + '<br/>' + this.series.name + ': ' + this.y + ' ' + unit;
            }
        },
        plotOptions: {
            column: {
                minPointLength: 4,
                pointPadding: 0.1,
                groupPadding: 0,
				dataLabels: {
                        enabled: true,
                        color: 'white'
                }                
            }
        },
        legend: {
            enabled: true
        }
    });
  
  var total=0;
  var global=0;
  var datachart = [];

  var actual_counter="Unknown?";
  
	$.getJSON("json.htm?type=graph&sensor=counter&idx="+$.devIdx+"&range=year&actyear="+actYear,
	function(data) {
		var lastTotal=-1;
		var lastMonth=-1;
		if (typeof data.counter!= 'undefined') {
			actual_counter=data.counter;
		}
		
	    $.each(data.result, function(i,item)
		{
			var month=parseInt(item.d.substring(5, 7), 10);
			var year=parseInt(item.d.substring(0, 4), 10);
			if (year==actYear) {
				if (lastMonth==-1) {
					lastMonth=month;
				}
				if (lastMonth!=month)
				{
					//add totals to table
					lastTotal=Add2YearTableP1ReportGas(oTable,total,lastTotal,lastMonth,actYear);

					var cdate = Date.UTC(actYear,lastMonth-1,1);
					datachart.push( [cdate, parseFloat(total.toFixed(3)) ] );
					
					lastMonth=month;
					global+=total;

					total=0;
				}
				var day=parseInt(item.d.substring(8, 10), 10);
				var Usage=0;

				Usage=parseFloat(item.v);
				total+=Usage;
			}
		});

	//add last month
	if (total!=0) {
		lastTotal=Add2YearTableP1ReportGas(oTable,total,lastTotal,lastMonth,actYear);
		var cdate = Date.UTC(actYear,lastMonth-1,1);
		datachart.push( [cdate, parseFloat(total.toFixed(3))] );
		global+=lastTotal;
	}

	$($.content + ' #tu').html(global.toFixed(3));
	var montlycosts=0;
	if ($.devSwitchType==0) {
		//Electra
		montlycosts=(global*$.costsT1);
		$.UsageChart.highcharts().addSeries({
          id: 'power',
          name: 'Power',
          showInLegend: false,
          color: 'rgba(3,190,252,0.8)',
          yAxis: 0
        });
		var series = $.UsageChart.highcharts().get('power');
		series.setData(datachart);
	}
	else if ($.devSwitchType==1) {
		//Gas
		montlycosts=(global*$.costsGas);
		$.UsageChart.highcharts().addSeries({
          id: 'gas',
          name: 'Gas',
          showInLegend: false,
          color: 'rgba(3,190,252,0.8)',
          yAxis: 0
        });
		var series = $.UsageChart.highcharts().get('gas');
		series.setData(datachart);
	}
	else {
		//Water
		montlycosts=(global*$.costsWater);
		$.UsageChart.highcharts().addSeries({
          id: 'water',
          name: 'Water',
          showInLegend: false,
          color: 'rgba(3,190,252,0.8)',
          yAxis: 0
        });
		var series = $.UsageChart.highcharts().get('water');
		series.setData(datachart);
	}
	
	$($.content + ' #mc').html(montlycosts.toFixed(2));
	$($.content + ' #cntr').html(actual_counter);
	  
	mTable.fnDraw();
		/* Add a click handler to the rows - this could be used as a callback */
		$($.content + ' #yearreport tbody tr').click( function( e ) {
			if ( $(this).hasClass('row_selected') ) {
				$(this).removeClass('row_selected');
			}
			else {
				oTable.$('tr.row_selected').removeClass('row_selected');
				$(this).addClass('row_selected');
			}
		});  
	});

  return false;
}

function ShowP1MonthReport(actMonth,actYear)
{
  var htmlcontent = '';

  htmlcontent+=$('#toptextmonth').html();
  htmlcontent+=$('#monthreportview').html();
  $($.content).html(htmlcontent);
  $($.content).i18n();

  $($.content + ' #theader').html($.i18n("Usage")+ " "+ $.i18n($.monthNames[actMonth-1])+" " + actYear);

  $($.content + ' #monthreport').dataTable( {
		"sDom": '<"H"rC>t<"F">',
		"oTableTools": {
			"sRowSelect": "single"
		},
		"aaSorting": [[ 0, "asc" ]],
		"aoColumnDefs": [
			{ "bSortable": false, "aTargets": [ 10 ] }
		],
		"bSortClasses": false,
		"bProcessing": true,
		"bStateSave": false,
		"bJQueryUI": true,
		"aLengthMenu": [[50, 100, -1], [50, 100, "All"]],
		"iDisplayLength" : 50
  });
  var mTable = $($.content + ' #monthreport');
  var oTable = mTable.dataTable();
  oTable.fnClearTable();

  $.UsageChart = $($.content + ' #usagegraph');
  $.UsageChart.highcharts({
      chart: {
          type: 'column',
          marginRight: 10
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: ''
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: $.i18n('Energy') + ' (kWh)'
            },
            min: 0
        },
        tooltip: {
            formatter: function() {
					var unit = {
						'Usage': 'Watt',
						'Usage_1': 'kWh',
						'Usage_2': 'kWh',
						'Return_1': 'kWh',
						'Return_2': 'kWh',
						'Gas': 'm3',
						'Past_Gas': 'm3',
						'Water': 'm3'
					}[this.series.name];
                    return $.i18n(Highcharts.dateFormat('%B',this.x)) + " " + Highcharts.dateFormat('%d',this.x) + '<br/>'+ this.series.name + ': ' + this.y + ' ' + unit + '<br/>Total: '+ this.point.stackTotal + ' ' + unit;
            }
        },
        plotOptions: {
            column: {
				stacking: 'normal',
                minPointLength: 4,
                pointPadding: 0.1,
                groupPadding: 0
            }
        },
        legend: {
            enabled: true
        }
    });
  var datachartT1 = [];
  var datachartT2 = [];
  var datachartR1 = [];
  var datachartR2 = [];
  
  var totalT1=0;
  var totalT2=0;
  var totalR1=0;
  var totalR2=0;
  
  var bHaveDelivered=false;
  
	$.getJSON("json.htm?type=graph&sensor=counter&idx="+$.devIdx+"&range=year&actmonth="+actMonth+"&actyear="+actYear,
	function(data) {
		bHaveDelivered=(typeof data.delivered!= 'undefined');
		if (bHaveDelivered==false) {
			$($.content + ' #dreturn').hide();
		}
		else {
			$($.content + ' #dreturn').show();
		}
		oTable.fnSetColumnVis( 5, bHaveDelivered);
		oTable.fnSetColumnVis( 6, bHaveDelivered);
		oTable.fnSetColumnVis( 7, bHaveDelivered);
		oTable.fnSetColumnVis( 8, bHaveDelivered);
	
		var lastTotal=-1;
		
	    $.each(data.result, function(i,item)
		{
			var month=parseInt(item.d.substring(5, 7), 10);
			var year=parseInt(item.d.substring(0, 4), 10);

			if ((month==actMonth)&&(year==actYear)) {
				var day=parseInt(item.d.substring(8, 10), 10);
				var UsageT1=0;
				var UsageT2=0;
				var ReturnT1=0;
				var ReturnT2=0;

				UsageT1=parseFloat(item.v);
				if (typeof item.v2!= 'undefined') {
					UsageT2=parseFloat(item.v2);
				}
				if (typeof item.r1!= 'undefined') {
					ReturnT1=parseFloat(item.r1);
				}
				if (typeof item.r2!= 'undefined') {
					ReturnT2=parseFloat(item.r2);
				}
				
				var cdate = Date.UTC(actYear,actMonth-1,day);
				datachartT1.push( [cdate, parseFloat(UsageT1.toFixed(3)) ] );
				datachartT2.push( [cdate, parseFloat(UsageT2.toFixed(3)) ] );
				datachartR1.push( [cdate, parseFloat(ReturnT1.toFixed(3)) ] );
				datachartR2.push( [cdate, parseFloat(ReturnT2.toFixed(3)) ] );
			
				totalT1+=UsageT1;
				totalT2+=UsageT2;
				totalR1+=ReturnT1;
				totalR2+=ReturnT2;

				var rcostT1=UsageT1*$.costsT1;
				var rcostT2=UsageT2*$.costsT2;
				var rcostR1=-(ReturnT1*$.costsR1);
				var rcostR2=-(ReturnT2*$.costsR2);
				var rTotal=rcostT1+rcostT2+rcostR1+rcostR2;

				var textR1="";
				var textR2="";
				var textCostR1="";
				var textCostR2="";
				
				if (ReturnT1!=0) {
					textR1=ReturnT1.toFixed(3);
					textCostR1=rcostR1.toFixed(2);
				}
				if (ReturnT2!=0) {
					textR2=ReturnT2.toFixed(3);
					textCostR2=rcostR2.toFixed(2);
				}
				
				var img;
				if ((lastTotal==-1)||(lastTotal==rTotal)) {
					img='<img src="images/equal.png"></img>';
				}
				else if (rTotal<lastTotal) {
					img='<img src="images/down.png"></img>';
				}
				else {
					img='<img src="images/up.png"></img>';
				}
				lastTotal=rTotal;

				var addId = oTable.fnAddData([
					  day,
					  UsageT1.toFixed(3),
					  rcostT1.toFixed(2),
					  UsageT2.toFixed(3),
					  rcostT2.toFixed(2),
					  textR1,
					  textCostR1,
					  textR2,
					  textCostR2,
					  rTotal.toFixed(2),
					  img
					], false);
			}
		});

		if (datachartT1.length>0) {
			if (datachartT2.length>0) {
				$.UsageChart.highcharts().addSeries({
				  id: 'usage1',
				  name: 'Usage_1',
				  color: 'rgba(60,130,252,0.8)',
				  stack: 'susage',
				  yAxis: 0
				});
			}
			else {
				$.UsageChart.highcharts().addSeries({
				  id: 'usage1',
				  name: 'Usage',
				  color: 'rgba(3,190,252,0.8)',
				  stack: 'susage',
				  yAxis: 0
				});
			}
			series = $.UsageChart.highcharts().get('usage1');
			series.setData(datachartT1);
		}
		if (datachartT2.length>0) {
			$.UsageChart.highcharts().addSeries({
			  id: 'usage2',
			  name: 'Usage_2',
			  color: 'rgba(3,190,252,0.8)',
			  stack: 'susage',
			  yAxis: 0
			});
			series = $.UsageChart.highcharts().get('usage2');
			series.setData(datachartT2);
		}
		if (bHaveDelivered) {
			if (datachartR1.length>0) {
				$.UsageChart.highcharts().addSeries({
					id: 'return1',
					name: 'Return_1',
					color: 'rgba(30,242,110,0.8)',
					stack: 'sreturn',
					yAxis: 0
				});
				series = $.UsageChart.highcharts().get('return1');
				series.setData(datachartR1);
			}
			if (datachartR2.length>0) {
				$.UsageChart.highcharts().addSeries({
					id: 'return2',
					name: 'Return_2',
					color: 'rgba(3,252,190,0.8)',
					stack: 'sreturn',
					yAxis: 0
				});
				series = $.UsageChart.highcharts().get('return2');
				series.setData(datachartR2);
			}
		}

	  $($.content + ' #tut1').html(totalT1.toFixed(3));
	  $($.content + ' #tut2').html(totalT2.toFixed(3));
	  $($.content + ' #trt1').html(totalR1.toFixed(3));
	  $($.content + ' #trt2').html(totalR2.toFixed(3));
	  
	  var gtotal=totalT1+totalT2;
	  var greturn=totalR1+totalR2;
	  $($.content + ' #tu').html(gtotal.toFixed(3));
	  $($.content + ' #tr').html(greturn.toFixed(3));
	  var montlycosts=(totalT1*$.costsT1)+(totalT2*$.costsT2)-(totalR1*$.costsR1)-(totalR2*$.costsR2);
	  $($.content + ' #mc').html(montlycosts.toFixed(2));
	  
	  mTable.fnDraw();
		/* Add a click handler to the rows - this could be used as a callback */
		$($.content + ' #monthreport tbody tr').click( function( e ) {
			if ( $(this).hasClass('row_selected') ) {
				$(this).removeClass('row_selected');
			}
			else {
				oTable.$('tr.row_selected').removeClass('row_selected');
				$(this).addClass('row_selected');
			}
		});  
	});

  return false;
}

function OnSelChangeYearP1Report()
{
	var yearidx=$($.content + ' #comboyear option:selected').val();
	if (typeof yearidx == 'undefined') {
		return ;
	}
	ShowP1YearReport(yearidx);
}

function Add2YearTableP1Report(oTable,totalT1,totalT2,totalR1,totalR2,lastTotal,lastMonth,actYear)
{
	var rcostT1=totalT1*$.costsT1;
	var rcostT2=totalT2*$.costsT2;
	var rcostR1=-(totalR1*$.costsR1);
	var rcostR2=-(totalR2*$.costsR2);
	var rTotal=rcostT1+rcostT2+rcostR1+rcostR2;

	var textR1="";
	var textR2="";
	var textCostR1="";
	var textCostR2="";

	if (totalR1!=0) {
		textR1=totalR1.toFixed(3);
		textCostR1=rcostR1.toFixed(2);
	}
	if (totalR2!=0) {
		textR2=totalR2.toFixed(3);
		textCostR2=rcostR2.toFixed(2);
	}

	
	var img;
	if ((lastTotal==-1)||(lastTotal==rTotal)) {
		img='<img src="images/equal.png"></img>';
	}
	else if (rTotal<lastTotal) {
		img='<img src="images/down.png"></img>';
	}
	else {
		img='<img src="images/up.png"></img>';
	}

	var monthtxt=addLeadingZeros(parseInt(lastMonth),2) + ". " + $.i18n($.monthNames[lastMonth-1]) + " ";
	monthtxt+='<img src="images/next.png" onclick="ShowP1MonthReport(' + lastMonth +',' + actYear + ')">';

	var addId = oTable.fnAddData([
		  monthtxt,
		  totalT1.toFixed(3),
		  rcostT1.toFixed(2),
		  totalT2.toFixed(3),
		  rcostT2.toFixed(2),
		  textR1,
		  textCostR1,
		  textR2,
		  textCostR2,
		  rTotal.toFixed(2),
		  img
		], false);
	return rTotal;
}

function ShowP1YearReport(actYear)
{
	if (actYear==0) {
		actYear=$.actYear;
	}
	else {
		$.actYear=actYear;
	}
  var htmlcontent = '';
  htmlcontent+=$('#toptextyear').html();
  htmlcontent+=$('#yearreportview').html();
  
  $($.content).html(htmlcontent);
  $($.content + ' #backbutton').click( function( e ) {
	eval($.backfunction)();
  });
  $($.content).i18n();
  
  $($.content + ' #theader').html($.i18n("Usage") + " "+actYear);

	$($.content + ' #comboyear').val(actYear);
	
	$($.content + ' #comboyear').change(function() { 
		OnSelChangeYearP1Report();
	});
	$($.content + ' #comboyear').keypress(function() {
	  $(this).change();
	});

  $($.content + ' #yearreport').dataTable( {
		"sDom": '<"H"rC>t<"F">',
		"oTableTools": {
			"sRowSelect": "single"
		},
		"aaSorting": [[ 0, "asc" ]],
		"aoColumnDefs": [
			{ "bSortable": false, "aTargets": [ 10 ] }
		],
		"bSortClasses": false,
		"bProcessing": true,
		"bStateSave": false,
		"bJQueryUI": true,
		"aLengthMenu": [[50, 100, -1], [50, 100, "All"]],
		"iDisplayLength" : 50
  });
  var mTable = $($.content + ' #yearreport');
  var oTable = mTable.dataTable();
  oTable.fnClearTable();

  $.UsageChart = $($.content + ' #usagegraph');
  $.UsageChart.highcharts({
      chart: {
          type: 'column',
          marginRight: 10
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: ''
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: $.i18n('Energy') + ' (kWh)'
            },
            min: 0
        },
        tooltip: {
            formatter: function() {
					var unit = {
						'Usage': 'Watt',
						'Usage_1': 'kWh',
						'Usage_2': 'kWh',
						'Return_1': 'kWh',
						'Return_2': 'kWh',
						'Gas': 'm3',
						'Past_Gas': 'm3',
						'Water': 'm3'
					}[this.series.name];
                    return $.i18n(Highcharts.dateFormat('%B',this.x)) + '<br/>'+ this.series.name + ': ' + this.y + ' ' + unit + '<br/>Total: '+ this.point.stackTotal + ' ' + unit;
            }
        },
        plotOptions: {
            column: {
				stacking: 'normal',
                minPointLength: 4,
                pointPadding: 0.1,
                groupPadding: 0
            }
        },
        legend: {
            enabled: true
        }
    });
  var datachartT1 = [];
  var datachartT2 = [];
  var datachartR1 = [];
  var datachartR2 = [];

  var totalT1=0;
  var totalT2=0;
  var totalR1=0;
  var totalR2=0;

  var globalT1=0;
  var globalT2=0;
  var globalR1=0;
  var globalR2=0;

  var bHaveDelivered=false;
  
	$.getJSON("json.htm?type=graph&sensor=counter&idx="+$.devIdx+"&range=year&actyear="+actYear,
	function(data) {
		bHaveDelivered=(typeof data.delivered!= 'undefined');
		if (bHaveDelivered==false) {
			$($.content + ' #dreturn').hide();
		}
		else {
			$($.content + ' #dreturn').show();
		}
		
		oTable.fnSetColumnVis( 5, bHaveDelivered);
		oTable.fnSetColumnVis( 6, bHaveDelivered);
		oTable.fnSetColumnVis( 7, bHaveDelivered);
		oTable.fnSetColumnVis( 8, bHaveDelivered);
	
		var lastTotal=-1;
		var lastMonth=-1;
		
	    $.each(data.result, function(i,item)
		{
			var month=parseInt(item.d.substring(5, 7), 10);
			var year=parseInt(item.d.substring(0, 4), 10);

			if (year==actYear) {
				if (lastMonth==-1) {
					lastMonth=month;
				}
				if (lastMonth!=month)
				{
					//add totals to table
					lastTotal=Add2YearTableP1Report(oTable,totalT1,totalT2,totalR1,totalR2,lastTotal,lastMonth,actYear);
					
					var cdate = Date.UTC(actYear,lastMonth-1,1);
					datachartT1.push( [cdate, parseFloat(totalT1.toFixed(3)) ] );
					datachartT2.push( [cdate, parseFloat(totalT2.toFixed(3)) ] );
					datachartR1.push( [cdate, parseFloat(totalR1.toFixed(3)) ] );
					datachartR2.push( [cdate, parseFloat(totalR2.toFixed(3)) ] );

					lastMonth=month;
					globalT1+=totalT1;
					globalT2+=totalT2;
					globalR1+=totalR1;
					globalR2+=totalR2;

					totalT1=0;
					totalT2=0;
					totalR1=0;
					totalR2=0;
				}
				var day=parseInt(item.d.substring(8, 10), 10);
				var UsageT1=0;
				var UsageT2=0;
				var ReturnT1=0;
				var ReturnT2=0;

				UsageT1=parseFloat(item.v);
				if (typeof item.v2!= 'undefined') {
					UsageT2=parseFloat(item.v2);
				}
				if (typeof item.r1!= 'undefined') {
					ReturnT1=parseFloat(item.r1);
				}
				if (typeof item.r2!= 'undefined') {
					ReturnT2=parseFloat(item.r2);
				}
			
				totalT1+=UsageT1;
				totalT2+=UsageT2;
				totalR1+=ReturnT1;
				totalR2+=ReturnT2;
			}
		});

	//add last month
	if ((totalT1!=0)||(totalT2!=0)||(totalR1!=0)||(totalR2!=0)) {
		lastTotal=Add2YearTableP1Report(oTable,totalT1,totalT2,totalR1,totalR2,lastTotal,lastMonth,actYear);
		var cdate = Date.UTC(actYear,lastMonth-1,1);
		datachartT1.push( [cdate, parseFloat(totalT1.toFixed(3)) ] );
		datachartT2.push( [cdate, parseFloat(totalT2.toFixed(3)) ] );
		datachartR1.push( [cdate, parseFloat(totalR1.toFixed(3)) ] );
		datachartR2.push( [cdate, parseFloat(totalR2.toFixed(3)) ] );
		
		globalT1+=totalT1;
		globalT2+=totalT2;
		globalR1+=totalR1;
		globalR2+=totalR2;
	}

	if (datachartT1.length>0) {
		if (datachartT2.length>0) {
			$.UsageChart.highcharts().addSeries({
			  id: 'usage1',
			  name: 'Usage_1',
			  color: 'rgba(60,130,252,0.8)',
			  stack: 'susage',
			  yAxis: 0
			});
		}
		else {
			$.UsageChart.highcharts().addSeries({
			  id: 'usage1',
			  name: 'Usage',
			  color: 'rgba(3,190,252,0.8)',
			  stack: 'susage',
			  yAxis: 0
			});
		}
		series = $.UsageChart.highcharts().get('usage1');
		series.setData(datachartT1);
	}
	if (datachartT2.length>0) {
		$.UsageChart.highcharts().addSeries({
		  id: 'usage2',
		  name: 'Usage_2',
		  color: 'rgba(3,190,252,0.8)',
		  stack: 'susage',
		  yAxis: 0
		});
		series = $.UsageChart.highcharts().get('usage2');
		series.setData(datachartT2);
	}
	if (bHaveDelivered) {
		if (datachartR1.length>0) {
			$.UsageChart.highcharts().addSeries({
				id: 'return1',
				name: 'Return_1',
				color: 'rgba(30,242,110,0.8)',
				stack: 'sreturn',
				yAxis: 0
			});
			series = $.UsageChart.highcharts().get('return1');
			series.setData(datachartR1);
		}
		if (datachartR2.length>0) {
			$.UsageChart.highcharts().addSeries({
				id: 'return2',
				name: 'Return_2',
				color: 'rgba(3,252,190,0.8)',
				stack: 'sreturn',
				yAxis: 0
			});
			series = $.UsageChart.highcharts().get('return2');
			series.setData(datachartR2);
		}
	}

	$($.content + ' #tut1').html(globalT1.toFixed(3));
	  $($.content + ' #tut2').html(globalT2.toFixed(3));
	  $($.content + ' #trt1').html(globalR1.toFixed(3));
	  $($.content + ' #trt2').html(globalR2.toFixed(3));

	  $($.content + ' #cntrt1').html($.CounterT1.toFixed(3));
	  $($.content + ' #cntrt2').html($.CounterT2.toFixed(3));
	  $($.content + ' #cntrr1').html($.CounterR1.toFixed(3));
	  $($.content + ' #cntrr2').html($.CounterR2.toFixed(3));

	  var gtotal=globalT1+globalT2;
	  var greturn=globalR1+globalR2;
	  $($.content + ' #tu').html(gtotal.toFixed(3));
	  $($.content + ' #tr').html(greturn.toFixed(3));
	  var montlycosts=(globalT1*$.costsT1)+(globalT2*$.costsT2)-(globalR1*$.costsR1)-(globalR2*$.costsR2);
	  $($.content + ' #mc').html(montlycosts.toFixed(2));
	  
	  mTable.fnDraw();
		/* Add a click handler to the rows - this could be used as a callback */
		$($.content + ' #tbody tr').click( function( e ) {
			if ( $(this).hasClass('row_selected') ) {
				$(this).removeClass('row_selected');
			}
			else {
				oTable.$('tr.row_selected').removeClass('row_selected');
				$(this).addClass('row_selected');
			}
		});  
	});

  return false;
}

function ShowCounterLog(contentdiv,backfunction,id,name,switchtype)
{
	clearInterval($.myglobals.refreshTimer);
  $('#modal').show();
  $.content=contentdiv;
  $.backfunction=backfunction;
  $.devIdx=id;
  $.devName=name;
  if (typeof switchtype != 'undefined') {
	$.devSwitchType=switchtype;
  }
  else {
	switchtype=$.devSwitchType;
  }
  var htmlcontent = '';
  htmlcontent='<p><center><h2>' + name + '</h2></center></p>\n';
  htmlcontent+=$('#dayweekmonthyearlog').html();
  if ((switchtype==0)||(switchtype==1)||(switchtype==2)) {
	$.costsT1=0.2389;
	$.costsT2=0.2389;
	$.costsGas=0.6218;
	$.costsWater=1.6473;

	$.ajax({
		 url: "json.htm?type=command&param=getcosts&idx="+$.devIdx,
		 async: false, 
		 dataType: 'json',
		 success: function(data) {
			$.costsT1=parseFloat(data.CostEnergy)/10000;
			$.costsT2=parseFloat(data.CostEnergyT2)/10000;
			$.costsGas=parseFloat(data.CostGas)/10000;
			$.costsWater=parseFloat(data.CostWater)/10000;
		 }
	});

	$.costsR1=$.costsT1;
	$.costsR2=$.costsT2;

	$.monthNames = [ "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December" ];
    
	var d = new Date();
	var actMonth = d.getMonth()+1;
	var actYear = d.getYear()+1900;
	$($.content).html(GetBackbuttonHTMLTableWithRight(backfunction,'ShowP1YearReportGas('+actYear+')',$.i18n('Report'))+htmlcontent);
  }
  else {
	$($.content).html(GetBackbuttonHTMLTable(backfunction)+htmlcontent);
  }

  $($.content).i18n();
  
  $.DayChart = $($.content + ' #daygraph');
  $.DayChart.highcharts({
      chart: {
          type: 'column',
          marginRight: 10,
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=counter&idx="+id+"&range=day",
                function(data) {
					if (typeof data.result != 'undefined') {
						AddDataToUtilityChart(data,$.DayChart,switchtype);
					}
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('Usage') + ' ' + Get5MinuteHistoryDaysGraphTitle()
        },
        xAxis: {
            type: 'datetime',
            labels: {
							formatter: function() {
								return Highcharts.dateFormat("%H:%M", this.value);
							}
						}
        },
        yAxis: {
            title: {
                text: $.i18n('Energy') + ' (Watt)'
            },
            min: 0
        },
		tooltip: {
		  crosshairs: true,
		  shared: true
		},
        plotOptions: {
			series: {
				point: {
					events: {
						click: function(event) {
							chartPointClickNew(event,true,ShowCounterLog);
						}
					}
				}
			},
            column: {
                minPointLength: 4,
                pointPadding: 0.1,
                groupPadding: 0
            }
        },
        legend: {
            enabled: false
        }
    });
  
  $.WeekChart = $($.content + ' #weekgraph');
  $.WeekChart.highcharts({
      chart: {
          type: 'column',
          marginRight: 10,
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=counter&idx="+id+"&range=week",
                function(data) {
					if (typeof data.result != 'undefined') {
						AddDataToUtilityChart(data,$.WeekChart,switchtype);
					}
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('Last Week')
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                day: '%a'
            },
            tickInterval: 24 * 3600 * 1000
        },
        yAxis: {
            min: 0,
            maxPadding: 0.2,
            endOnTick: false,
            title: {
                text: $.i18n('Energy') + ' (kWh)'
            }
        },
		tooltip: {
		  crosshairs: true,
		  shared: true
		},
        plotOptions: {
            column: {
                minPointLength: 4,
                pointPadding: 0.1,
                groupPadding: 0,
				dataLabels: {
                        enabled: true,
                        color: 'white'
                }
            }
        },
        legend: {
            enabled: false
        }
    });

  $.MonthChart = $($.content + ' #monthgraph');
  $.MonthChart.highcharts({
      chart: {
          type: 'spline',
          marginRight: 10,
          zoomType: 'x',
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=counter&idx="+id+"&range=month",
                function(data) {
					if (typeof data.result != 'undefined') {
						AddDataToUtilityChart(data,$.MonthChart,switchtype);
					}
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('Last Month')
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: $.i18n('Usage')
            },
            min: 0
        },
		tooltip: {
		  crosshairs: true,
		  shared: true
		},
        plotOptions: {
			series: {
				point: {
					events: {
						click: function(event) {
							chartPointClickNewEx(event,false,ShowCounterLog);
						}
					}
				}
			},
			spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        legend: {
            enabled: true
        }
    });

  $.YearChart = $($.content + ' #yeargraph');
  $.YearChart.highcharts({
      chart: {
          type: 'spline',
          marginRight: 10,
          zoomType: 'x',
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=counter&idx="+id+"&range=year",
                function(data) {
					if (typeof data.result != 'undefined') {
						AddDataToUtilityChart(data,$.YearChart,switchtype);
					}
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('Last Year')
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: $.i18n('Usage')
            },
            min: 0
        },
		tooltip: {
		  crosshairs: true,
		  shared: true
		},
        plotOptions: {
			series: {
				point: {
					events: {
						click: function(event) {
							chartPointClickNewEx(event,false,ShowCounterLog);
						}
					}
				}
			},
			spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        legend: {
            enabled: true
        }
    });
}

function ShowCounterLogSpline(contentdiv,backfunction,id,name,switchtype)
{
	clearInterval($.myglobals.refreshTimer);
  $('#modal').show();
  
  $.content=contentdiv;
  $.backfunction=backfunction;
  $.devIdx=id;
  $.devName=name;
  if (typeof switchtype != 'undefined') {
	$.devSwitchType=switchtype;
  }
  else {
	switchtype=$.devSwitchType;
  }
  var htmlcontent = '';
  htmlcontent='<p><center><h2>' + name + '</h2></center></p>\n';
  htmlcontent+=$('#dayweekmonthyearlog').html();

  if ((switchtype==0)||(switchtype==1)||(switchtype==2)) {
	$.costsT1=0.2389;
	$.costsT2=0.2389;
	$.costsGas=0.6218;
	$.costsWater=1.6473;

	$.ajax({
		 url: "json.htm?type=command&param=getcosts&idx="+$.devIdx,
		 async: false, 
		 dataType: 'json',
		 success: function(data) {
			$.costsT1=parseFloat(data.CostEnergy)/10000;
			$.costsT2=parseFloat(data.CostEnergyT2)/10000;
			$.costsGas=parseFloat(data.CostGas)/10000;
			$.costsWater=parseFloat(data.CostWater)/10000;
		 }
	});

	$.costsR1=$.costsT1;
	$.costsR2=$.costsT2;

	$.monthNames = [ "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December" ];
    
	var d = new Date();
	var actMonth = d.getMonth()+1;
	var actYear = d.getYear()+1900;
	$($.content).html(GetBackbuttonHTMLTableWithRight(backfunction,'ShowP1YearReportGas('+actYear+')',$.i18n('Report'))+htmlcontent);
  }
  else {
	$($.content).html(GetBackbuttonHTMLTable(backfunction)+htmlcontent);
  }
  $($.content).i18n();
  
  $.DayChart = $($.content + ' #daygraph');
  $.DayChart.highcharts({
      chart: {
          type: 'spline',
          marginRight: 10,
          zoomType: 'x',
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=counter&method=1&idx="+id+"&range=day",
                function(data) {
					if (typeof data.result != 'undefined') {
						AddDataToUtilityChart(data,$.DayChart,switchtype);
					}
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('Usage') + ' ' + Get5MinuteHistoryDaysGraphTitle()
        },
        xAxis: {
            type: 'datetime',
            labels: {
							formatter: function() {
								return Highcharts.dateFormat("%H:%M", this.value);
							}
						}
        },
        yAxis: {
            title: {
                text: $.i18n('Energy') + ' (Watt)'
            },
            min: 0
        },
		tooltip: {
		  crosshairs: true,
		  shared: true
		},
        plotOptions: {
			series: {
				point: {
					events: {
						click: function(event) {
							chartPointClickNew(event,true,ShowCounterLogSpline);
						}
					}
				}
			},
			spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        legend: {
            enabled: false
        }
    });
  $.WeekChart = $($.content + ' #weekgraph');
  $.WeekChart.highcharts({
      chart: {
          type: 'column',
          marginRight: 10,
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=counter&idx="+id+"&range=week",
                function(data) {
					if (typeof data.result != 'undefined') {
						AddDataToUtilityChart(data,$.WeekChart,switchtype);
					}
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('Last Week')
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                day: '%a'
            },
            tickInterval: 24 * 3600 * 1000
        },
        yAxis: {
            min: 0,
            maxPadding: 0.2,
            endOnTick: false,
            title: {
                text: $.i18n('Energy') + ' (kWh)'
            }
        },
        tooltip: {
            formatter: function() {
										var unit = {
																'Usage': 'kWh',
																'Return': 'kWh',
																'Gas': 'm3',
																'Past_Gas': 'm3',
																'Water': 'm3'
													}[this.series.name];
                    return $.i18n(Highcharts.dateFormat('%A',this.x)) + ' ' + Highcharts.dateFormat('%Y-%m-%d', this.x) + '<br/>' + this.series.name + ': ' + this.y + ' ' + unit;
            }
        },
        plotOptions: {
            column: {
                minPointLength: 4,
                pointPadding: 0.1,
                groupPadding: 0,
				dataLabels: {
                        enabled: true,
                        color: 'white'
                }
            }
        },
        legend: {
            enabled: false
        }
    });

  $.MonthChart = $($.content + ' #monthgraph');
  $.MonthChart.highcharts({
      chart: {
          type: 'spline',
          marginRight: 10,
          zoomType: 'x',
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=counter&idx="+id+"&range=month",
                function(data) {
					if (typeof data.result != 'undefined') {
						AddDataToUtilityChart(data,$.MonthChart,switchtype);
					}
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('Last Month')
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: $.i18n('Usage')
            },
            min: 0
        },
		tooltip: {
		  crosshairs: true,
		  shared: true
		},
        plotOptions: {
			series: {
				point: {
					events: {
						click: function(event) {
							chartPointClickNewEx(event,false,ShowCounterLogSpline);
						}
					}
				}
			},
			spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        legend: {
            enabled: true
        }
    });

  $.YearChart = $($.content + ' #yeargraph');
  $.YearChart.highcharts({
      chart: {
          type: 'spline',
          marginRight: 10,
          zoomType: 'x',
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=counter&idx="+id+"&range=year",
                function(data) {
					if (typeof data.result != 'undefined') {
						AddDataToUtilityChart(data,$.YearChart,switchtype);
					}
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('Last Year')
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: $.i18n('Usage')
            },
            min: 0
        },
		tooltip: {
		  crosshairs: true,
		  shared: true
		},
        plotOptions: {
			series: {
				point: {
					events: {
						click: function(event) {
							chartPointClickNewEx(event,false,ShowCounterLogSpline);
						}
					}
				}
			},
			spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        legend: {
            enabled: true
        }
    });
}

function ShowUsageLog(contentdiv,backfunction,id,name)
{
	clearInterval($.myglobals.refreshTimer);
  $('#modal').show();
  $.content=contentdiv;
  $.backfunction=backfunction;
  $.devIdx=id;
  $.devName=name;
  var htmlcontent = '';
  htmlcontent='<p><center><h2>' + name + '</h2></center></p>\n';
  htmlcontent+=$('#daymonthyearlog').html();
  $($.content).html(GetBackbuttonHTMLTable(backfunction)+htmlcontent);
  $($.content).i18n();

  $.DayChart = $($.content + ' #daygraph');
  $.DayChart.highcharts({
      chart: {
          type: 'spline',
          zoomType: 'x',
          marginRight: 10,
          events: {
              load: function() {
                $.getJSON("json.htm?type=graph&sensor=counter&idx="+id+"&range=day",
                function(data) {
					if (typeof data.result != 'undefined') {
                      var series = $.DayChart.highcharts().series[0];
                      var datatable = [];
                      
                      $.each(data.result, function(i,item)
                      {
                        datatable.push( [GetUTCFromString(item.d), parseFloat(item.u) ] );
                      });
                      series.setData(datatable);
                    }
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('Usage') + ' '  + Get5MinuteHistoryDaysGraphTitle()
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: $.i18n('Usage') + ' (Watt)'
            },
            min: 0
        },
		  tooltip: {
			  crosshairs: true,
			  shared: true
		  },
        plotOptions: {
            spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        series: [{
            name: $.i18n('Usage'),
			tooltip: {
				valueSuffix: ' Watt',
				valueDecimals: 1
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,true,ShowUsageLog);
					}
				}
			}
        }]
        ,
        navigation: {
            menuItemStyle: {
                fontSize: '10px'
            }
        }
    });

  $.MonthChart = $($.content + ' #monthgraph');
  $.MonthChart.highcharts({
      chart: {
          type: 'spline',
          zoomType: 'x',
          marginRight: 10,
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=counter&idx="+id+"&range=month",
                function(data) {
					if (typeof data.result != 'undefined') {
                      var datatable1 = [];
                      var datatable2 = [];
                      
                      $.each(data.result, function(i,item)
                      {
                        datatable1.push( [GetDateFromString(item.d), parseFloat(item.u_min) ] );
                        datatable2.push( [GetDateFromString(item.d), parseFloat(item.u_max) ] );
                      });
                      var series1 = $.MonthChart.highcharts().series[0];
                      var series2 = $.MonthChart.highcharts().series[1];
                      series1.setData(datatable1);
                      series2.setData(datatable2);
                    }
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('Usage') + ' ' + $.i18n('Last Month')
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: $.i18n('Usage') + ' (Watt)'
            },
            min: 0
        },
		  tooltip: {
			  crosshairs: true,
			  shared: true
		  },
        plotOptions: {
            spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        series: [{
            name: 'Usage_min',
			tooltip: {
				valueSuffix: ' Watt',
				valueDecimals: 1
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowUsageLog);
					}
				}
			}
		}, {
            name: 'Usage_max',
			tooltip: {
				valueSuffix: ' Watt',
				valueDecimals: 1
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowUsageLog);
					}
				}
			}
        }]
        ,
        navigation: {
            menuItemStyle: {
                fontSize: '10px'
            }
        }
    });

  $.YearChart = $($.content + ' #yeargraph');
  $.YearChart.highcharts({
      chart: {
          type: 'spline',
          zoomType: 'x',
          marginRight: 10,
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=counter&idx="+id+"&range=year",
                function(data) {
					if (typeof data.result != 'undefined') {
                      var datatable1 = [];
                      var datatable2 = [];
                      
                      $.each(data.result, function(i,item)
                      {
                        datatable1.push( [GetDateFromString(item.d), parseFloat(item.u_min) ] );
                        datatable2.push( [GetDateFromString(item.d), parseFloat(item.u_max) ] );
                      });
                      var series1 = $.YearChart.highcharts().series[0];
                      var series2 = $.YearChart.highcharts().series[1];
                      series1.setData(datatable1);
                      series2.setData(datatable2);
                    }
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('Usage') + ' ' + $.i18n('Last Year')
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: $.i18n('Usage') + ' (Watt)'
            },
            min: 0
        },
		  tooltip: {
			  crosshairs: true,
			  shared: true
		  },
        plotOptions: {
            spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        series: [{
            name: 'Usage_min',
			tooltip: {
				valueSuffix: ' Watt',
				valueDecimals: 1
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowUsageLog);
					}
				}
			}
		}, {
            name: 'Usage_max',
			tooltip: {
				valueSuffix: ' Watt',
				valueDecimals: 1
			},
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowUsageLog);
					}
				}
			}
        }]
        ,
        navigation: {
            menuItemStyle: {
                fontSize: '10px'
            }
        }
    });
}

function ShowLuxLog(contentdiv,backfunction,id,name)
{
	clearInterval($.myglobals.refreshTimer);
  $('#modal').show();
  $.content=contentdiv;
  $.backfunction=backfunction;
  $.devIdx=id;
  $.devName=name;
  var htmlcontent = '';
  htmlcontent='<p><center><h2>' + name + '</h2></center></p>\n';
  htmlcontent+=$('#daymonthyearlog').html();
  $($.content).html(GetBackbuttonHTMLTable(backfunction)+htmlcontent);
  $($.content).i18n();

  $.DayChart = $($.content + ' #daygraph');
  $.DayChart.highcharts({
      chart: {
          type: 'spline',
          zoomType: 'x',
          marginRight: 10,
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=counter&idx="+id+"&range=day",
                function(data) {
					if (typeof data.result != 'undefined') {
                      var series = $.DayChart.highcharts().series[0];
                      var datatable = [];
                      
                      $.each(data.result, function(i,item)
                      {
                        datatable.push( [GetUTCFromString(item.d), parseInt(item.lux) ] );
                      });
                      series.setData(datatable);
                   }
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('Lux') + ' '  + Get5MinuteHistoryDaysGraphTitle()
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'Lux'
            },
            min: 0,
            minorGridLineWidth: 0,
            gridLineWidth: 0,
            alternateGridColor: null
        },
        tooltip: {
            formatter: function() {
                    return ''+
                    $.i18n(Highcharts.dateFormat('%A',this.x)) + '<br/>' + Highcharts.dateFormat('%Y-%m-%d %H:%M', this.x) +': '+ this.y +' Lux';
            }
        },
        plotOptions: {
            spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        series: [{
            name: 'lux',
			events: {
				click: function(event) {
					chartPointClickNew(event,true,ShowLuxLog);
				}
			}
        }]
        ,
        navigation: {
            menuItemStyle: {
                fontSize: '10px'
            }
        }
    });

  $.MonthChart = $($.content + ' #monthgraph');
  $.MonthChart.highcharts({
      chart: {
          type: 'spline',
          zoomType: 'x',
          marginRight: 10,
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=counter&idx="+id+"&range=month",
                function(data) {
					if (typeof data.result != 'undefined') {
                      var datatable1 = [];
                      var datatable2 = [];
                      
                      $.each(data.result, function(i,item)
                      {
                        datatable1.push( [GetDateFromString(item.d), parseInt(item.lux_min) ] );
                        datatable2.push( [GetDateFromString(item.d), parseInt(item.lux_max) ] );
                      });
                      var series1 = $.MonthChart.highcharts().series[0];
                      var series2 = $.MonthChart.highcharts().series[1];
                      series1.setData(datatable1);
                      series2.setData(datatable2);
                    }
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('Lux') + ' ' + $.i18n('Last Month')
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'Lux'
            },
            min: 0,
            minorGridLineWidth: 0,
            gridLineWidth: 0,
            alternateGridColor: null
        },
        tooltip: {
            formatter: function() {
                    return ''+
                    $.i18n(Highcharts.dateFormat('%A',this.x)) + '<br/>' + Highcharts.dateFormat('%Y-%m-%d', this.x) +': '+ this.y +' Lux';
            }
        },
        plotOptions: {
            spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        series: [{
            name: 'lux_min',
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowLuxLog);
					}
				}
			}
		}, {
            name: 'lux_max',
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowLuxLog);
					}
				}
			}
        }]
        ,
        navigation: {
            menuItemStyle: {
                fontSize: '10px'
            }
        }
    });

  $.YearChart = $($.content + ' #yeargraph');
  $.YearChart.highcharts({
      chart: {
          type: 'spline',
          zoomType: 'x',
          marginRight: 10,
          events: {
              load: function() {
                  
                $.getJSON("json.htm?type=graph&sensor=counter&idx="+id+"&range=year",
                function(data) {
					if (typeof data.result != 'undefined') {
                      var datatable1 = [];
                      var datatable2 = [];
                      
                      $.each(data.result, function(i,item)
                      {
                        datatable1.push( [GetDateFromString(item.d), parseInt(item.lux_min) ] );
                        datatable2.push( [GetDateFromString(item.d), parseInt(item.lux_max) ] );
                      });
                      var series1 = $.YearChart.highcharts().series[0];
                      var series2 = $.YearChart.highcharts().series[1];
                      series1.setData(datatable1);
                      series2.setData(datatable2);
                    }
                });
              }
          }
        },
       credits: {
          enabled: true,
          href: "http://www.domoticz.com",
          text: "Domoticz.com"
        },
        title: {
            text: $.i18n('Lux') + ' ' + $.i18n('Last Year')
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'Lux'
            },
            min: 0,
            minorGridLineWidth: 0,
            gridLineWidth: 0,
            alternateGridColor: null
        },
        tooltip: {
            formatter: function() {
                    return ''+
                    $.i18n(Highcharts.dateFormat('%A',this.x)) + '<br/>' + Highcharts.dateFormat('%Y-%m-%d', this.x) +': '+ this.y +' Lux';
            }
        },
        plotOptions: {
            spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true,
                            symbol: 'circle',
                            radius: 5,
                            lineWidth: 1
                        }
                    }
                }
            }
        },
        series: [{
            name: 'lux_min',
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowLuxLog);
					}
				}
			}
		}, {
            name: 'lux_max',
			point: {
				events: {
					click: function(event) {
						chartPointClickNew(event,false,ShowLuxLog);
					}
				}
			}
        }]
        ,
        navigation: {
            menuItemStyle: {
                fontSize: '10px'
            }
        }
    });
}

