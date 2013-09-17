/* 
	Copyright © 2013 Reagan Lopez
	[This program is licensed under the "MIT License"]
	Please see the file LICENSE in the source
	distribution of this software for license terms
*/	
	// global variables
	var URL = "speedlimit.xml"; 	// name of speedlimit xml
	var MPS_TO_MPH = 2.23694; 			// Meters per second to Miles per hour conversion constant
	var UOM_DIST = "M";					// Unit of Measure of distance is Miles
	var watchID = null; 				// watch id
	var geo_lat = 0;		            // latitude from geolocation
	var geo_lng = 0;					// longitude from geolocation
	var geo_speed = 0;					// speed from geolocation
	var xml_lat = 0;					// latitude from xml
	var xml_lng = 0;                    // longitude from xml
	var xml_speedlimit = 0;             // speedlimit from xml
	var xml_contributor;                // contributor of speed limit	
	var tolerance;						// tolerance from user input
	var dist = 0;				        // distance between current coordinates and speedlimit coordinates

/*************************************************************************************************************************************/
// Function to play notification sound. The notification sound set for the phone will be played. 
// To change the sound, the notification sound in the phone must be changed. The program need not be compiled again.
/*************************************************************************************************************************************/
	function playBeep() 
	{
		navigator.notification.beep(1);
	}
	
/*************************************************************************************************************************************/
// Function to calculate distance between two coordinates. Input parameters are the latitude and longitude of the two coordinates,
// and the unit of distance. Returns distance.
/*************************************************************************************************************************************/
	function distance(lat1, lng1, lat2, lng2, unit) 
	{
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var radlng1 = Math.PI * lng1/180;
		var radlng2 = Math.PI * lng2/180;
		var theta = lng1-lng2;
		var radtheta = Math.PI * theta/180
		var d = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		d = Math.acos(d);
		d = d * 180/Math.PI;
		d = d * 60 * 1.1515;
		if (unit=="K") { d = d * 1.609344; }
		if (unit==UOM_DIST) { d = d * 0.8684; }
		return d
	}
	
/*************************************************************************************************************************************/
// Function to read speedlimit from xml file and display.
/*************************************************************************************************************************************/
	function loadXMLDoc() 
	{
		var xmlhttp;
		var x;
		var lat, lng, slimit;
		var i = 0;
		var	short_node = 0;
		var shortest_dist = 0;
		if (window.XMLHttpRequest) 
		{ // code for IE7+, Firefox, Chrome, Opera, Safari
			xmlhttp=new XMLHttpRequest();
		}
		else 
		{ // code for IE6, IE5
			xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
		}
		  
		xmlhttp.onreadystatechange=function()
		{
			if (xmlhttp.readyState==4 && xmlhttp.status==200)
			{
				x = xmlhttp.responseXML.documentElement.getElementsByTagName("marker");
				
				// fetch first node from xml and calculate distance
				shortest_dist = distance(geo_lat, geo_lng, x[0].getAttribute('lat'), x[0].getAttribute('lng'), UOM_DIST); 
				short_node = 0;
	
				for ( i = 1; i < x.length; i++)
				{
					dist = distance(geo_lat, geo_lng, x[i].getAttribute('lat'), x[i].getAttribute('lng'), UOM_DIST);
					
					if (dist <= shortest_dist) // shortest distance between coordinates?
					{
						short_node = i; // capture shortest node position
					}
				}
				xml_speedlimit = x[short_node].getAttribute('mph');	
				xml_lat = x[short_node].getAttribute('lat');
				xml_lng = x[short_node].getAttribute('lng');
				xml_contributor = x[short_node].getAttribute('label');
				
				// populate the html fields
				if (geo_speed > (xml_speedlimit + parseInt(tolerance)))
				{
					document.getElementById("my-speed").style.color = "red";
					setTimeout(function(){playBeep()},1000);	
				}
				else
				{
					document.getElementById("my-speed").style.color="green";
				}	
				
				document.getElementById("speed-limit").innerHTML = xml_speedlimit + " mph";
				document.getElementById("my-speed").innerHTML = geo_speed + " mph";	
				document.getElementById("geo-div").innerHTML = "Speed Limit Contributor: " + xml_contributor;

			}
		  }
		xmlhttp.open("GET",URL,true);
		xmlhttp.send();
		return xml_speedlimit;
	}		
	
/*************************************************************************************************************************************/
// Function to display the position properties from the geolocation.
/*************************************************************************************************************************************/				
	function onSuccess(position) 
	{
		geo_latitude = position.coords.latitude;
		geo_longitude = position.coords.longitude;
		geo_speed = Math.round(position.coords.speed * 2.23694); // convert Meters per sec to Miles per hour
		// UNCOMMENT FOR DEBUGGING
/*
		var element = document.getElementById('geo-div');
		element.innerHTML = 'GEOLOC-Latitude      : '           + position.coords.latitude              + '<br />' +
							'GEOLOC-Longitude     : '           + position.coords.longitude             + '<br />' +
							'GEOLOC-Speed (mps)   : '           + position.coords.speed                 + '<br />' +
							'GEOLOC-Speed (mph)   : '           + geo_speed                             + '<br />' +
							//'GEOLOC-Altitude      : '           + position.coords.altitude              + '<br />' +
							//'GEOLOC-Accuracy      : '           + position.coords.accuracy              + '<br />' +
							//'GEOLOC-Altitude Accuracy: '        + position.coords.altitudeAccuracy      + '<br />' +
							//'GEOLOC-Heading       : '           + position.coords.heading               + '<br />' +
							//'GEOLOC-Timestamp     : '           + position.timestamp                    + '<br />' +
							'XML-Latitude         : '           + xml_lat                               + '<br />' +
							'XML-Longitude        : '           + xml_lng                               + '<br />' +
							'XML-Speedlimit (mps) : '           + xml_speedlimit                        + '<br />' +
							'Distance             : '           + dist                                  + '<br />';
*/	
						
	}
	
/*************************************************************************************************************************************/
// Function to display an alert if there is a problem getting the geolocation.
/*************************************************************************************************************************************/	
	function onError(error) 
	{
		alert('code: '    + error.code    + '\n' +
			  'message: ' + error.message + '\n');
	}	
	
/*************************************************************************************************************************************/
// Function to clear the watch that was started earlier.
/*************************************************************************************************************************************/		
	function clearWatch() 
	{
		if (watchID != null) 
		{
			navigator.geolocation.clearWatch(watchID);
			watchID = null;
		}
	}	