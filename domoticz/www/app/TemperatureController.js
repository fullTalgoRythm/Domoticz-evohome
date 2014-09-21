define(['app'], function (app) {
	app.controller('TemperatureController', [ '$scope', '$rootScope', '$location', '$http', '$interval', 'permissions', function($scope,$rootScope,$location,$http,$interval,permissions) {

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
			  ShowTemps();
			 }
		  });
		}
			
		EditTempDevice = function(idx,name,addjvalue)
		{
			if (typeof $scope.mytimer != 'undefined') {
				$interval.cancel($scope.mytimer);
				$scope.mytimer = undefined;
			}
			$.devIdx=idx;
			$("#dialog-edittempdevice #devicename").val(name);
			$("#dialog-edittempdevice #adjustment").val(addjvalue);
			$("#dialog-edittempdevice #tempcf").html($.myglobals.tempsign);
			$("#dialog-edittempdevice" ).dialog( "open" );
		}

		EditTempDeviceSmall = function(idx,name,addjvalue)
		{
			if (typeof $scope.mytimer != 'undefined') {
				$interval.cancel($scope.mytimer);
				$scope.mytimer = undefined;
			}
			$.devIdx=idx;
			$("#dialog-edittempdevicesmall #devicename").val(name);
			$("#dialog-edittempdevicesmall" ).dialog( "open" );
		}

		AddTempDevice = function()
		{
		  bootbox.alert($.i18n('Please use the devices tab for this.'));
		}


			
		AddMultipleDataToTempChart = function(data,chart,isday,deviceid,devicename)
		{
			var datatablete = [];
			var datatabletm = [];
			var datatablehu = [];
			var datatablech = [];
			var datatablecm = [];
			var datatabledp = [];
			var datatableba = [];

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
			  } else {
				if (typeof item.te != 'undefined') {
				  datatablete.push( [GetDateFromString(item.d), parseFloat(item.te) ] );
				  datatabletm.push( [GetDateFromString(item.d), parseFloat(item.tm) ] );
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
			  }
			});
			var series;

			if (datatablehu.length!=0)
			{
			  chart.addSeries(
				{
				  id: 'humidity'+deviceid,
				  name: devicename+':'+$.i18n('Humidity'),
				  yAxis: 1
				}
			  );
			  series = chart.get('humidity'+deviceid);
			  series.setData(datatablehu);
			}

			if (datatablech.length!=0)
			{
			  chart.addSeries(
				{
				  id: 'chill'+deviceid,
				  name: devicename+':'+$.i18n('Chill'),
				  yAxis: 0
				}
			  );
			  series = chart.get('chill'+deviceid);
			  series.setData(datatablech);
			  
			  if (isday==0) {
				chart.addSeries(
				  {
					id: 'chillmin'+deviceid,
					name: devicename+':'+$.i18n('Chill')+'_min',
					yAxis: 0
				  }
				);
				series = chart.get('chillmin'+deviceid);
				series.setData(datatablecm);
			  }
			}
			if (datatablete.length!=0)
			{
			  //Add Temperature series
			  chart.addSeries(
				{
				  id: 'temperature'+deviceid,
				  name: devicename+':'+$.i18n('Temperature'),
				  yAxis: 0
				}
			  );
			  series = chart.get('temperature'+deviceid);
			  series.setData(datatablete);
			  if (isday==0) {
				chart.addSeries(
				  {
					id: 'temperaturemin'+deviceid,
					name: devicename+':'+$.i18n('Temperature')+'_min',
					yAxis: 0
				  }
				);
				series = chart.get('temperaturemin'+deviceid);
				series.setData(datatabletm);
			  }
			}
			
			if (datatabledp.length!=0)
			{
			  chart.addSeries(
				{
				  id: 'dewpoint'+deviceid,
				  name: devicename+':'+$.i18n('Dew Point'),
				  yAxis: 0
				}
			  );
			  series = chart.get('dewpoint'+deviceid);
			  series.setData(datatabledp);
			}
			
			if (datatableba.length!=0)
			{
			  chart.addSeries(
				{
				  id: 'baro'+deviceid,
				  name: devicename+':'+$.i18n('Barometer'),
				  yAxis: 2
				}
			  );
			  series = chart.get('baro'+deviceid);
			  series.setData(datatableba);
			}

		}    

		RemoveMultipleDataFromTempChart = function(chart,deviceid)
		{
			hum=chart.get('humidity'+deviceid);
			if(hum!=null) {hum.remove()};
			chill=chart.get('chill'+deviceid)
			if(chill!=null) {chill.remove()};
			chillmin=chart.get('chillmin'+deviceid);
			if(chillmin!=null) {chillmin.remove()};
			temperature=chart.get('temperature'+deviceid);
			if(temperature!=null) {temperature.remove()};
			temperaturemin=chart.get('temperaturemin'+deviceid);
			if(temperaturemin!=null) {temperaturemin.remove()};
			dew=chart.get('dewpoint'+deviceid);
			if(dew!=null) {dew.remove()};
			baro=chart.get('baro'+deviceid);
			if(baro!=null) {baro.remove()};
		}

		ClearCustomGraph = function()
		{
			$('div[id="devicecontainer"] input:checkbox:checked').each(function() {
				RemoveMultipleDataFromTempChart($.CustomChart.highcharts(),$(this).attr('id'));
				$(this).prop("checked", false);
			});   
		}
			
		SelectGraphDevices = function()
		{
			if (typeof $scope.mytimer != 'undefined') {
				$interval.cancel($scope.mytimer);
				$scope.mytimer = undefined;
			}
			
			$.ajax({
				   url: "json.htm?type=devices&filter=temp&used=true&order=Name",
				   async: false,
				   dataType: 'json',
				   success: function(data) {
					if (typeof data.result != 'undefined') {
						$.each(data.result, function(i,item){
							$("#tempcontent #devicecontainer").append('<input type="checkbox" class="devicecheckbox" id="'+item.idx+'" value="'+item.Name+'" onChange="AddDeviceToGraph(this)">'+item.Name+'<br />');
							});
					}
				   }
			});
		}

		AddDeviceToGraph = function(cb)
		{
			if (cb.checked==true) {
				$.ajax({
				   url: "json.htm?type=graph&sensor=temp&idx="+cb.id+"&range="+$("#tempcontent #graphfrom").val()+"T"+$("#tempcontent #graphto").val()+"&graphtype="+$("#tempcontent #combocustomgraphtype").val()+
				   "&graphTemp="+$("#tempcontent #graphTemp").prop("checked")+"&graphChill="+$("#tempcontent #graphChill").prop("checked")+"&graphHum="+$("#tempcontent #graphHum").prop("checked")+"&graphBaro="+$("#tempcontent #graphBaro").prop("checked")+"&graphDew="+$("#tempcontent #graphDew").prop("checked"),
				   async: false,
				   dataType: 'json',
				   success: function(data) {
					AddMultipleDataToTempChart(data,$.CustomChart.highcharts(),$("#tempcontent #combocustomgraphtype").val(),cb.id,cb.value);
				   }
				});
			}
			else {
				RemoveMultipleDataFromTempChart($.CustomChart.highcharts(),cb.id);
			}
		}
		datePickerChanged = function(dpicker)
		{
			if ($("#graphfrom").val()!='') {
				$("#tempcontent #graphfrom").datepicker("setDate",$("#graphfrom").val());
			}
			else {
				$("#tempcontent #graphto").datepicker("setDate",$("#graphto").val());
			}
			$( "#tempcontent #graphfrom" ).datepicker('option', 'maxDate', $("#tempcontent #graphto").val());
			$( "#tempcontent #graphto" ).datepicker('option', 'minDate', $("#tempcontent #graphfrom").val());

			$('div[id="devicecontainer"] input:checkbox:checked').each(function() {
				RemoveMultipleDataFromTempChart($.CustomChart.highcharts(),$(this).attr('id'));
				$.ajax({
				   url: "json.htm?type=graph&sensor=temp&idx="+$(this).attr('id')+"&range="+$("#tempcontent #graphfrom").val()+"T"+$("#tempcontent #graphto").val()+"&graphtype="+$("#tempcontent #combocustomgraphtype").val()+
				   "&graphTemp="+$("#tempcontent #graphTemp").prop("checked")+"&graphChill="+$("#tempcontent #graphChill").prop("checked")+"&graphHum="+$("#tempcontent #graphHum").prop("checked")+"&graphBaro="+$("#tempcontent #graphBaro").prop("checked")+"&graphDew="+$("#tempcontent #graphDew").prop("checked"),
				   async: false,
				   dataType: 'json',
				   graphid: $(this).attr('id'),
				   graphval: $(this).val(),
				   success: function(data) {
					AddMultipleDataToTempChart(data,$.CustomChart.highcharts(),$("#tempcontent #combocustomgraphtype").val(),this.graphid,this.graphval);
				   }
				});
			}); 
			return false;
		}
			
		ShowCustomTempLog = function()
		{
			if (typeof $scope.mytimer != 'undefined') {
				$interval.cancel($scope.mytimer);
				$scope.mytimer = undefined;
			}
		  $('#modal').show();
		  var htmlcontent = '';
		  htmlcontent+=$('#customlog').html();
		  $('#tempcontent').html(GetBackbuttonHTMLTable('ShowTemps')+htmlcontent);
		  $('#tempcontent').i18n();
		  
		  $.content="#tempcontent";

			$('.datepick').datepicker({
								   dateFormat: 'yy-mm-dd',
								   onClose:function() {
										datePickerChanged(this);
								   }
								  });
			$("#graphfrom").datepicker('setDate', '-7');
			$("#graphto").datepicker('setDate', '-0');
			$("#tempcontent #graphfrom").datepicker('setDate', '-7');
			$("#tempcontent #graphto").datepicker('setDate', '-0');
			
		  $.CustomChart = $($.content + ' #customgraph');
		  $.CustomChart.highcharts({
			  chart: {
				  type: 'line',
				  zoomType: 'x',
				  alignTicks: false,
				  
				  events: {
					  load: function() {
					  }
				  }
			  },
			  colors: ['#FF99CC','#FFCC99','#FFFF99','#CCFFCC','#CCFFFF','#99CCFF','#CC99FF','#FFFFFF',
					   '#9999FF','#993366','#FFFFCC','#CCFFFF','#660066','#FF8080','#0066CC','#CCCCFF',
					   '#000080','#FF00FF','#FFFF00','#00FFFF','#800080','#800000','#008080','#0000FF',
					   '#00C0C0','#993300','#333300','#003300','#003366','#000080','#333399','#333333',
					   '#800000','#FF6600','#808000','#008000','#008080','#0000FF','#666699','#808080',
					   '#FF0000','#FF9900','#99CC00','#339966','#33CCCC','#3366FF','#800080','#969696',
					   '#FF00FF','#FFCC00','#FFFF00','#00FF00','#00FFFF','#00CCFF','#993366','#C0C0C0'],
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
				  text: 'Custom Temperature Graph'
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
							  color: 'white'
						   }
				  },
				  title: {
					   text: 'degrees Celsius',
					   style: {
						  color: 'white'
					   }
				  },
				  showEmpty: false
			  }, { //humidity label
				  labels:  {
						   formatter: function() {
								return this.value +'%';
						   },
						   style: {
							  color: 'white'
						   }
				  },
				  title: {
					   text: $.i18n('Humidity') +' %',
					   style: {
						  color: 'white'
					   }
				  },
				  showEmpty: false
			  }, { //pressure label
				  labels:  {
						   formatter: function() {
								return this.value;
						   },
						   style: {
							  color: 'white'
						   }
				  },
				  title: {
					   text: $.i18n('Pressure') + ' (hPa)',
					   style: {
						  color: 'white'
					   }
				  },
				  showEmpty: false
			  }],
			  tooltip: {
				  formatter: function() {
						var unit = '';
						var baseName = this.series.name.split(':')[1];
						if (baseName==$.i18n("Humidity")) {unit = '%'} else {unit = '\u00B0 ' + $.myglobals.tempsign};
						return $.i18n(Highcharts.dateFormat('%A',this.x)) + '<br/>' + Highcharts.dateFormat('%Y-%m-%d %H:%M', this.x) +'<br/>'+ this.series.name + ': ' + this.y + unit ;
				  }
			  },
			  legend: {
				  enabled: true
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
			  }
		  });
		  SelectGraphDevices();
		  $('#modal').hide();
		  return false;
		}

		RefreshTemps = function()
		{
			if (typeof $scope.mytimer != 'undefined') {
				$interval.cancel($scope.mytimer);
				$scope.mytimer = undefined;
			}
		  var id="";

		  $.ajax({
			 url: "json.htm?type=devices&filter=temp&used=true&order=Name&lastupdate="+$.LastUpdateTime,
			 async: false,
			 dataType: 'json',
			 success: function(data) {
			  if (typeof data.result != 'undefined') {
			  
				if (typeof data.ActTime != 'undefined') {
					$.LastUpdateTime=parseInt(data.ActTime);
				}
			  
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
			  
				$.each(data.result, function(i,item){
							id="#tempcontent #" + item.idx;
							var obj=$(id);
							if (typeof obj != 'undefined') {
								if ($(id + " #name").html()!=item.Name) {
									$(id + " #name").html(item.Name);
								}
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
					img+='" height="48" width="48">';
					
					if ($(id + " #img").html()!=img) {
									$(id + " #img").html(img);
								}
					
					var status="";
					var bigtext="";
					var bHaveTemperature=false;
					var bHaveBefore=false;
					if (typeof item.Temp != 'undefined') {
						 status+=item.Temp + '\u00B0 ' + $.myglobals.tempsign;
						 bigtext=item.Temp + '\u00B0';
						 bHaveTemperature=true;
						 bHaveBefore=true;
					}
					if (typeof item.Chill != 'undefined') {
						if (bigtext!="") {
							bigtext+=' / ';
						}
						bigtext+=item.Chill + '\u00B0';
						if (status!="") {
							status+=', ';
						}
						status+=$.i18n('Chill') + ': ' + item.Chill + '\u00B0 ' + $.myglobals.tempsign;
						bHaveBefore=true;
					}
					var bHaveHumidity=false;
					if (typeof item.Humidity != 'undefined') {
									if (bHaveBefore==true) {
										status+=', ';
										bigtext+=' / ';
									}
					  status+=$.i18n('Humidity') + ': ' + item.Humidity + ' %';
					  bigtext+=item.Humidity + '%';
					  bHaveHumidity=true;
					}
					if (typeof item.HumidityStatus != 'undefined') {
					  status+=' (' + $.i18n(item.HumidityStatus) + ')';
					}
					if (typeof item.Barometer != 'undefined') {
					  status+='<br>Barometer: ' + item.Barometer + ' hPa';
					}
					if (typeof item.ForecastStr != 'undefined') {
					  status+=', ' + $.i18n('Prediction') + ': ' + $.i18n(item.ForecastStr);
					}
					if (typeof item.Direction != 'undefined') {
					  status+='<br>' + item.Direction + ' ' + item.DirectionStr + ', ' + $.i18n('Speed') + ': ' + item.Speed + ' ' + $.myglobals.windsign;
					  if (typeof item.Gust != 'undefined') {
						status+=', ' + $.i18n('Gust') + ': ' + item.Gust + ' ' + $.myglobals.windsign;
					  }
					}
					if (typeof item.DewPoint != 'undefined') {
						status+="<br>"+$.i18n("Dew Point") + ": " + item.DewPoint + '\u00B0 ' + $.myglobals.tempsign;
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
				RefreshTemps();
			}, 10000);
		}

		ShowForecast = function()
		{
			SwitchLayout("Forecast");
		}

		ShowTemps = function()
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
				'\t  <td align="left">\n' +
				'\t    <div id="timesun" />\n' +
				'\t  </td>\n' +
				'\t  <td align="right">\n' +
				'\t    <a class="btnstyle" onclick="ShowCustomTempLog();" data-i18n="Custom Graph">Custom Graph</a>\n';
		  if ($.myglobals.Latitude!="") {
			tophtm+=
				'\t    <a id="Forecast" class="btnstyle" onclick="ShowForecast();" data-i18n="Forecast">Forecast</a>\n';
		  }
		  tophtm+=     
				'\t  </td>\n' +
				'\t</tr>\n' +
				'\t</table>\n';


		  var i=0;

		  $.ajax({
			 url: "json.htm?type=devices&filter=temp&used=true&order=Name",
			 async: false,
			 dataType: 'json',
			 success: function(data) {
			  if (typeof data.result != 'undefined') {

				if (typeof data.ActTime != 'undefined') {
					$.LastUpdateTime=parseInt(data.ActTime);
				}
			  
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
						'\t    <table id="itemtablenotype" border="0" cellpadding="0" cellspacing="0">\n' +
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
							xhtm+='" height="48" width="48"></td>\n' +
									'\t      <td id="status">';
							var bHaveTemperature=false;
							var bHaveBefore=false;
							if (typeof item.Temp != 'undefined') {
									 xhtm+=item.Temp + '\u00B0 ' + $.myglobals.tempsign;
									 bHaveTemperature=true;
									 bHaveBefore=true;
							}
							if (typeof item.Chill != 'undefined') {
								if (typeof item.Temp != 'undefined') {
									xhtm+=', ';
								}
								xhtm+=$.i18n('Chill') + ': ' + item.Chill + '\u00B0 ' + $.myglobals.tempsign;
								bHaveBefore=true;
							}
							var bHaveHumidity=false;
							if (typeof item.Humidity != 'undefined') {
								if (bHaveBefore==true) {
									xhtm+=', ';
								}
								xhtm+=$.i18n('Humidity') + ': ' + item.Humidity + ' %';
								bHaveHumidity=true;
							}
							if (typeof item.HumidityStatus != 'undefined') {
								xhtm+=' (' + $.i18n(item.HumidityStatus) + ')';
							}
							if (typeof item.Barometer != 'undefined') {
								xhtm+='<br>Barometer: ' + item.Barometer + ' hPa';
							}
							if (typeof item.ForecastStr != 'undefined') {
								xhtm+=', ' + $.i18n('Prediction') + ': ' + $.i18n(item.ForecastStr);
							}
							if (typeof item.Direction != 'undefined') {
								xhtm+='<br>' + item.Direction + ' ' + item.DirectionStr + ', ' + $.i18n('Speed') + ': ' + item.Speed + ' ' + $.myglobals.windsign;
								if (typeof item.Gust != 'undefined') {
									xhtm+=', ' + $.i18n('Gust') + ': ' + item.Gust + ' ' + $.myglobals.windsign;
								}
							}
							if (typeof item.DewPoint != 'undefined') {
								xhtm+="<br>"+$.i18n("Dew Point") + ": " + item.DewPoint + '\u00B0 ' + $.myglobals.tempsign;
							}
							xhtm+=
									'</td>\n' +
									'\t      <td id="lastupdate">' + item.LastUpdate + '</td>\n' +
									'\t      <td>';
				  if (item.Favorite == 0) {
					xhtm+=
						  '<img src="images/nofavorite.png" title="' + $.i18n('Add to Dashboard') +'" onclick="MakeFavorite(' + item.idx + ',1);" class="lcursor">&nbsp;&nbsp;&nbsp;&nbsp;';
				  }
				  else {
					xhtm+=
						  '<img src="images/favorite.png" title="' + $.i18n('Remove from Dashboard') +'" onclick="MakeFavorite(' + item.idx + ',0);" class="lcursor">&nbsp;&nbsp;&nbsp;&nbsp;';
				  }
				  xhtm+=
						'<a class="btnsmall" onclick="ShowTempLog(\'#tempcontent\',\'ShowTemps\',' + item.idx + ',\'' + item.Name + '\');" data-i18n="Log">Log</a> ';
				if (permissions.hasPermission("Admin")) {
				  if (item.Type=="Humidity") {
					  xhtm+='<a class="btnsmall" onclick="EditTempDeviceSmall(' + item.idx + ',\'' + item.Name + '\',' + item.AddjValue + ');" data-i18n="Edit">Edit</a> ';
				  }
				  else {
					  xhtm+='<a class="btnsmall" onclick="EditTempDevice(' + item.idx + ',\'' + item.Name + '\',' + item.AddjValue + ');" data-i18n="Edit">Edit</a> ';
				  }
				  if (item.Notifications == "true")
					xhtm+='<a class="btnsmall-sel" onclick="ShowNotifications(' + item.idx + ',\'' + item.Name + '\', \'#tempcontent\', \'ShowTemps\');" data-i18n="Notifications">Notifications</a>';
				  else
					xhtm+='<a class="btnsmall" onclick="ShowNotifications(' + item.idx + ',\'' + item.Name + '\', \'#tempcontent\', \'ShowTemps\');" data-i18n="Notifications">Notifications</a>';
				}
				if (typeof item.forecast_url != 'undefined') {
					xhtm+='&nbsp;<a class="btnsmall" onclick="ShowForecast(\'' + atob(item.forecast_url) + '\',\'' + item.Name + '\', \'#tempcontent\', \'ShowTemps\');" data-i18n="Forecast">Forecast</a>';
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
			htmlcontent='<h2>' + $.i18n('No Temperature sensors found or added in the system...') + '</h2>';
		  }
		  $('#modal').hide();
		  $('#tempcontent').html(tophtm+htmlcontent);
		  $('#tempcontent').i18n();

			$rootScope.RefreshTimeAndSun();
			
			if (bAllowWidgetReorder==true) {
				if (permissions.hasPermission("Admin")) {
					if (window.myglobals.ismobileint==false) {
						$("#tempcontent .span4").draggable({
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
						$("#tempcontent .span4").droppable({
								drop: function() {
									var myid=$(this).attr("id");
									$.devIdx.split(' ');
									$.ajax({
										 url: "json.htm?type=command&param=switchdeviceorder&idx1=" + myid + "&idx2=" + $.devIdx,
										 async: false, 
										 dataType: 'json',
										 success: function(data) {
												ShowTemps();
										 }
									});
								}
						});
					}
				}
			}
			$scope.mytimer=$interval(function() {
				RefreshTemps();
			}, 10000);
		  return false;
		}


		init();

		function init()
		{
			//global var
			$.devIdx=0;
			$.LastUpdateTime=parseInt(0);
			
			$( "#dialog-edittempdevice" ).dialog({
				  autoOpen: false,
				  width: 450,
				  height: 200,
				  modal: true,
				  resizable: false,
				  buttons: {
					  "Update": function() {
						  var bValid = true;
						  bValid = bValid && checkLength( $("#dialog-edittempdevice #edittable #devicename"), 2, 100 );
						  if ( bValid ) {
							  $( this ).dialog( "close" );
							  var aValue=$("#dialog-edittempdevice #edittable #adjustment").val();
							  $.ajax({
								 url: "json.htm?type=setused&idx=" + $.devIdx + '&name=' + encodeURIComponent($("#dialog-edittempdevice #devicename").val()) + '&addjvalue=' + aValue + '&used=true',
								 async: false,
								 dataType: 'json',
								 success: function(data) {
									ShowTemps();
								 }
							  });

						  }
					  },
					  "Remove Device": function() {
						$( this ).dialog( "close" );
						bootbox.confirm($.i18n("Are you sure to remove this Device?"), function(result) {
							if (result==true) {
							  $.ajax({
								 url: "json.htm?type=setused&idx=" + $.devIdx + '&name=' + encodeURIComponent($("#dialog-edittempdevice #devicename").val()) + '&used=false',
								 async: false,
								 dataType: 'json',
								 success: function(data) {
									ShowTemps();
								 }
							  });
							}
						});
					  },
					  "Transfer": function() {
						  $( this ).dialog( "close" );
						  TransferDevice($.devIdx,ShowTemps);
					  },
					  Cancel: function() {
						  $( this ).dialog( "close" );
					  }
				  },
				  close: function() {
					$( this ).dialog( "close" );
				  }
			});
			$( "#dialog-edittempdevicesmall" ).dialog({
				  autoOpen: false,
				  width: 450,
				  height: 160,
				  modal: true,
				  resizable: false,
				  buttons: {
					  "Update": function() {
						  var bValid = true;
						  bValid = bValid && checkLength( $("#dialog-edittempdevicesmall #edittable #devicename"), 2, 100 );
						  if ( bValid ) {
							  $( this ).dialog( "close" );
							  $.ajax({
								 url: "json.htm?type=setused&idx=" + $.devIdx + '&name=' + encodeURIComponent($("#dialog-edittempdevicesmall #devicename").val()) + '&used=true',
								 async: false,
								 dataType: 'json',
								 success: function(data) {
									ShowTemps();
								 }
							  });

						  }
					  },
					  "Remove Device": function() {
						$( this ).dialog( "close" );
						bootbox.confirm($.i18n("Are you sure to remove this Device?"), function(result) {
							if (result==true) {
							  $.ajax({
								 url: "json.htm?type=setused&idx=" + $.devIdx + '&name=' + encodeURIComponent($("#dialog-edittempdevicesmall #devicename").val()) + '&used=false',
								 async: false,
								 dataType: 'json',
								 success: function(data) {
									ShowTemps();
								 }
							  });
							}
						});
					  },
					  "Transfer": function() {
						  $( this ).dialog( "close" );
						  TransferDevice($.devIdx,ShowTemps);
					  },
					  Cancel: function() {
						  $( this ).dialog( "close" );
					  }
				  },
				  close: function() {
					$( this ).dialog( "close" );
				  }
			});

		  ShowTemps();
			
			$( "#dialog-edittempdevice" ).keydown(function (event) {
				if (event.keyCode == 13) {
					$(this).siblings('.ui-dialog-buttonpane').find('button:eq(0)').trigger("click");
					return false;
				}
			});
			$( "#dialog-edittempdevicesmall" ).keydown(function (event) {
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