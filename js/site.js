function generateMap(bordersGeom){
    var baselayer = L.tileLayer('https://data.hdx.rwlabs.org/mapbox-base-tiles/{z}/{x}/{y}.png', {});
    var baselayer2 = L.tileLayer('https://data.hdx.rwlabs.org/mapbox-layer-tiles/{z}/{x}/{y}.png', {});


    map = L.map('map', {
        center: [50.5, 6],  //center: [43,20],
        zoom: 4,            //zoom: 5,
        layers: [baselayer,baselayer2]
    });

    var style = function(feature) {
            return {
                        "color": "#cccccc",
                        "weight": 1,
                        "opacity": 0.65,
                        "className": feature.properties['adm0_1-2'].replace('-','')+' '+feature.properties['adm0_2-1'].replace('-','')
                    };
    }    

    var borders = L.geoJson(bordersGeom,{
                    style: style
                }).addTo(map);
                
    var mapLegend = L.control({position: 'bottomleft'});            
    
    mapLegend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'infolegend');    
        var iconImportance = [{
                iconText:'low',
                iconUrl:'images/yellow.png'
            },{
                iconText:'medium',
                iconUrl:'images/orange.png'
            },{
                iconText:'high',
                iconUrl:'images/red.png'
            }];
            
        var iconCategories = [{
                iconText:'Border',
                iconUrl:'images/border.png'
            },{
                iconText:'Camp',
                iconUrl:'images/camp.png'
            },{
                iconText:'Conflict',
                iconUrl:'images/conflict.png'
            },{
                iconText:'Policy',
                iconUrl:'images/policy.png'
            },{
                iconText:'Registration',
                iconUrl:'images/registration.png'
            },{
                iconText:'Transit',
                iconUrl:'images/transit.png'
        }];
            
        var iconArrivals = [{
            iconText:'Arrivals per country <i>(relative)</i>',
            iconUrl:'images/green.PNG'
        }];
        
        var iconBorderCrossings = [{
                iconText:'Physical Barrier',
                iconUrl:'images/red_line.png'
            },{
                iconText:'Barrier under Construction',
                iconUrl:'images/red_dash_line.png'
            },{
                iconText:'Barrier Planned',
                iconUrl:'images/purple_line.png'
            },{
                iconText:'Temporary Controls',
                iconUrl:'images/blue_line.png'
            }]

        div.innerHTML += iconArrivals[0] ? '<p class="legendcat"> <img class="icon" src="' + iconArrivals[0].iconUrl + '" alt=legend_icon width="24" height="24"> &nbsp' + iconArrivals[0].iconText + '</p>' : '+';
        
        div.innerHTML += '<br/>';
        
        div.innerHTML += '<p class="legendhead">News icon colour depicts level<br/>of importance:</p><br/>';
        
        for (var i = 0; i < iconImportance.length; i++) {   
            div.innerHTML += '<div class="impcat"><img class="icon" src="' + iconImportance[i].iconUrl + '" alt=legend_icon width="12" height="12"><br/>' + iconImportance[i].iconText + '</div>'
        };              
        div.innerHTML += '<br/>';
        for (var i = 0; i < iconCategories.length; i++) {           
            div.innerHTML += iconCategories[i] ? '<p class="legendcat"> <img class="icon" src="' + iconCategories[i].iconUrl + '" alt=legend_icon width="20" height="20"> &nbsp' + iconCategories[i].iconText + '</p>' : '+';
        }
        div.innerHTML += '<br/>';
        
        div.innerHTML += '<p class="legendhead borderhead">Border crossing controls:</p>';
        for (var i = 0; i < iconBorderCrossings.length; i++) {          
            div.innerHTML += iconBorderCrossings[i] ? '<p class="legendcat"> <img class="icon" src="' + iconBorderCrossings[i].iconUrl + '" alt=legend_icon width="20" height="20"> &nbsp' + iconBorderCrossings[i].iconText + '</p>' : '+';
        }
        
        
        return div;
    };
    mapLegend.addTo(map);
}

function filterDateRange(begin,end,data){
	var one_day = 24 * 60 * 60 * 1000;
	
	//console.log("UPDATE HERE: begin = ", begin, "     end = ", end);
	//console.log("  data = ", data);
	

    data.forEach(function(d){    //+begin.getDate()+'/'+(begin.getMonth()+1)+'/'+begin.getFullYear()+
        if(d['#date']>=begin&&d['#date']<=end){
            if(!d.visible){
                d.marker.addTo(map);
                d.visible = true;
            }
			//console.log("YES THIS ONE SHOULD DISPLAY: ", d);
        } else {
            if(d.visible){
                map.removeLayer(d.marker);
                d.visible = false;
           }
        }
    });   
    return data;
};

function updateArrivals(end,arrivals,arrivalMarkers){
	
    var arrival = findNearestArrival(end,arrivals);
    //console.log("in updateArrivals, end = ", end, "   arrivals = ", arrival);
	arrivalMarkers.forEach(function(m){
        m.circle.setRadius(Math.pow(arrival[m.tag],0.5)/2);
    });
}

function findNearestArrival(end,arrivals){
    var current=arrivals[0];
    arrivals.forEach(function(a){
        if(a['#date'].getTime()>end){
            return current;
        }
        current = a;
    });
    return current;
}


function createMarkers(data){

    data.forEach(function(d){
        var icon = L.icon({
            iconUrl: 'images/' + d['#meta+category'] + '_' + d['#meta+importance'] + '-01.png',
            iconSize:     [24, 24]});

        d.marker = L.marker([d['#geo+lat'],d['#geo+lon']], {icon: icon})
        .on('mouseover',function(e){
            $('#graphs').slideUp();
            $('#article').show();
			$('#graphs').removeClass('on');
            $('#article').addClass('on');
            $('#title').html(d['#meta+title'].toUpperCase());
            $('#content').html(d['#meta+description']);
            $('#date').html(d['#date'].getDate()+'/'+(d['#date'].getMonth()+1)+'/'+d['#date'].getFullYear());
            $('#url').html('<a href="' + d['#meta+url'] + '" target="_blank">Link</a>');
        });
        d.visible = false;
    });

    return data;
}

function createArrivalMarkers(){
    var data = [{
        area:'Greek Islands',
        lat:36.688902,
        lon:27.073489,
        tag:'#affected+arrivegreekislands'
    },
    {
        area:'Greek Mainland',
        lat:39.004464,
        lon:22.492114,
        tag:'#affected+arrivemainlandgreece'
    },
    {
        area:'Macedonia (FYROM)',
        lat:41.806336,
        lon:21.788989,
        tag:'#affected+arrivefyrom'
    },
    {
        area:'Serbia',
        lat:43.979184,
        lon:20.965015,
        tag:'#affected+arriveserbia'
    },
    {   area:'Croatia',
        lat:45.646912, 
        lon:16.697362,
        tag:'#affected+arrivecroatia'
    },
    {
        area:'Hungary',
        lat:47.034759,
        lon:18.701831,
        tag:'#affected+arrivehungary'
    },
    {
        area:'Slovenia',
        lat:46.160581,
        lon:14.836134,
        tag:'#affected+arriveslovenia'
    },
    {
        area:'Austria',
        lat:47.468727,
        lon:14.627394,
        tag:'#affected+arriveaustria'
    },
    {
        area:'Germany',
        lat:50.9430854,
        lon:9.6113336,
        tag:'#affected+arrivegermany'
    }];

    data.forEach(function(d){
        d.circle = L.circleMarker([d.lat, d.lon], {
            color: '#0A0',
            fillColor: '#0A0',
            fillOpacity: 0.5
        });
        d.circle.addTo(map);
    });

    return data;
}

function generateSparklines(data,arrivalMarkers){
    var max = 0;

    data.forEach(function(d){
        for(var key in d){
            if(key!='#date' && max<Number(d[key]) && isNaN(d[key])==false){
                max = d[key];
            }
        }
    });

     $('#graphs').append('<div><div class="graph" id="graphlegend"></div>');
     graphLegend('#graphlegend');
     $('#graphs').append('<div><div class="graphnote" id="graphnote"><span="graphnote">Arrivals</span></div>');
    
    arrivalMarkers.forEach(function(d,i){
        $('#graphs').append('<div><div class="graph" id="graph' + i + '"><span class="graphlabel">' + d.area + '</span></div><span class="graphval" id="graphval' + i + '"></span></div>'); 
        sparkline('#graph'+i,data,d.tag,max);
    });

    $('#graphs').append('<br/><p class="small">Access <a href="https://docs.google.com/spreadsheets/d/15OC8U1lodClWj0LQ3dUi3sR1emtZxQx5ZDOIPZFgwgM/edit?usp=sharing" target="_blanks">full data</a>.  Arrivals data from <a href="http://data.unhcr.org/mediterranean/regional.php">UNHCR data portal</a>.</p>');
    
}

function graphLegend(elemId) {
    var width = 350;
    var height = 40;
    var svg = d3.select(elemId).append('svg').attr('width', width).attr('height', height);
    
    svg.append('line')
        .attr("x1", 0)
        .attr("y1", 20)
        .attr("x2", 40)
        .attr("y2", 20)
        .attr("stroke-width", 1)
        .attr("stroke", "blue");
    
    svg.append('line')
        .attr("x1", 150)
        .attr("y1", 20)
        .attr("x2", 190)
        .attr("y2", 20)
        .attr("stroke-width", 2)
        .attr("stroke", "red");
        
    svg.append('text')
        .attr("x", 45)     
        .attr("y", 20)                                                      
        .attr("dy", "0.25em")   
        .attr("class","graphlegend")
        .text('Daily arrivals');
        
    svg.append('text')
        .attr("x", 195)     
        .attr("y", 20)  
        .attr("dy", "0.25em")                           
        .attr("class","graphlegend")
        .text('7-day moving average');
};

function sparkline(elemId, data, tag, max) {

    var width = 200;
    var height = 45;
    var x = d3.scale.linear().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);
    var line = d3.svg.line()
            .x(function(d) { if(d['#date']=='N/A'){
                    return x(0);
                } else {
                    return x(d['#date']);
                } 
            })
            .y(function(d) { if(d[tag]=='N/A'){
                    return y(0);
                } else {
                    return y(d[tag]);
                } 
            });

    function naiveShallowCopy (original) {  //clones original object
        var clone = {} ;
        var key ;
        for (key in original) {
            clone[key] = original[key];
        }
        return clone;
    };
    
    function movAvg(data) {    
        numDaysMovAvg = 7;
        numDaysMovAvgBuffer = Math.floor(numDaysMovAvg/2);

        tempDay = {};
        tempObj = {};
        var movAvgs = [];

        country = ['#affected+arrivegermany','#affected+arriveaustria','#affected+arrivecroatia','#affected+arrivefyrom','#affected+arrivegreekislands','#affected+arrivehungary','#affected+arrivemainlandgreece','#affected+arriveserbia','#affected+arriveslovenia'];
        
        for (i=0; i<=data.length-1; i++) {    //for each day in the array
            if ((i>=numDaysMovAvgBuffer) && (i<=data.length-1-numDaysMovAvgBuffer)) {    //remove buffer days
                tempDay['#date'] = data[i]['#date'];
                
                for (c=0; c<=country.length-1; c++) {       //for each country
                    sum = 0;                                
                    numDays = numDaysMovAvg;
                    for (j=0; j<=numDaysMovAvg-1; j++) {
                        if (data[i-numDaysMovAvgBuffer+j][country[c]]=='N/A') {
                            numDays = numDays - 1;
                        } else {
                            sum = sum + parseInt(data[i-numDaysMovAvgBuffer+j][country[c]]);
                        };
                    };                  
                    if (numDays == 0) {
                        avg = 'N/A';
                    } else {
                        avg = sum/numDays;  
                    };                  
                    tempDay[country[c]] = avg;          
                }
             
                tempObj = naiveShallowCopy(tempDay);
                movAvgs.push(tempObj);  
            };

        }   
        //console.log("movAvgs = ", movAvgs);   
        return movAvgs;
    };            

    x.domain(d3.extent(data, function(d) { return d['#date']; }));
    y.domain([0,max]);
    movAvgArray = movAvg(data);

    var svg = d3.select(elemId).append('svg').attr('width', width).attr('height', height);

    svg.append('path')
        .datum(data)
        .attr('class', 'sparkline')
        .attr('d', line)
        .attr("stroke", "blue")
        .attr("stroke-width", 1)
        .attr("fill", "none");

    svg.append('path')
        .datum(movAvgArray)
        //.attr('class', 'movAvgLine')
        .attr('d', line)
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("fill", "none");         

    svg.append('line')
        .attr("x1", 200)
        .attr("y1", 0)
        .attr("x2", 200)
        .attr("y2", 50)
        .attr("stroke-width", 1)
        .attr("stroke", "grey")
        .attr("class","datemarker");
}

function updateSparkline(arr_data,date,arrivalMarkers){
    var width = 200;
	dailyArrivals = {};
    arr_data.forEach(function(d){  
        if ((d['#date'].getDate() == date.getDate()) && (d['#date'].getMonth() == date.getMonth()) && (d['#date'].getFullYear() == date.getFullYear())){    
            dailyArrivals = d;
			console.log("dailyArrivals: ", d);
		};
	});  	
    
    var x = d3.scale.linear().range([0, width]);
    x.domain(d3.extent(arr_data, function(d) { return d['#date']; }));

    d3.selectAll('.datemarker').attr('x1',x(date)).attr('x2',x(date));
    
	$('#graphnote').html('Arrivals&nbsp<br/>' + formatDate(date));
		
    arrivalMarkers.forEach(function(d,i){
		if (!isNaN(dailyArrivals[d.tag])) {
            $('#graphval'+i).html(d3.format(",.0f")(dailyArrivals[d.tag]));
        } else {
            $('#graphval'+i).html("No data");
        }; 
    });
    
}



function updateBorders(end,borders){
    var dateFormat = d3.time.format("%d-%b-%Y");
    
    borders.sort(function(a, b) {
        return dateFormat.parse(a['#date']).getTime() - dateFormat.parse(b['#date']).getTime();
    }); 

    borders.forEach(function(b, i){         //color all borders grey as default starting point
        d3.selectAll('.'+b['#meta+id'].replace('-','')).attr('stroke','#cccccc').attr('stroke-width',1);
    });
    
    borders.forEach(function(b, i){
        if (dateFormat.parse(b['#date']).getTime() <= end) {
            //console.log("i:", i, "  date: ", b['#date'], ",   border: ", b);      
            switch(b['#status']) { 
                case 'Operational':  //Red thick solid line
                    //console.log("Operational i:", i, "  date: ", b['#date'], ",   border: ", b);
                    d3.selectAll('.'+b['#meta+id'].replace('-','')).attr('stroke','#ff0000').attr('stroke-width',3).style('stroke-dasharray', ('0,0'));
                    break;
                case 'Lifted':  //Grey default line
                    //console.log("Lifted i:", i, "  date: ", b['#date'], ",   border: ", b);  
                    d3.selectAll('.'+b['#meta+id'].replace('-','')).attr('stroke','#cccccc').attr('stroke-width',1).style('stroke-dasharray', ('0,0'));
                    break;
                case 'Constructing':   //Red thick dashed line
                    //console.log("Constructing i:", i, "  date: ", b['#date'], ",   border: ", b); 
                    d3.selectAll('.'+b['#meta+id'].replace('-','')).attr('stroke','#ff0000').attr('stroke-width',3).style('stroke-dasharray', ('8,8'));
                    break;
                case 'Standby':    //Yellow thick dashed line
                    //console.log("Standby i:", i, "  date: ", b['#date'], ",   border: ", b);  
                    d3.selectAll('.'+b['#meta+id'].replace('-','')).attr('stroke','#F38233').attr('stroke-width',3).style('stroke-dasharray', ('8,20'));
                    break;
                default:     //Blue thick solid line
                    //console.log("Default i:", i, "  date: ", b['#date'], ",   border: ", b);
                    d3.selectAll('.'+b['#meta+id'].replace('-','')).attr('stroke','#0000ff').attr('stroke-width',3).style('stroke-dasharray', ('0,0'));
            };
        }; 
    });
}

function hxlProxyToJSON(input,headers){
    var output = [];
    var keys=[]
    input.forEach(function(e,i){
        if(i==0){
            keys = e;
        } else if(headers==true && i>1) {
            var row = {};
            e.forEach(function(e2,i2){
                row[keys[i2]] = e2;
            });
            output.push(row);
        } else if(headers!=true){
            var row = {};
            e.forEach(function(e2,i2){
                row[keys[i2]] = e2;
            });
            output.push(row);

        }
    });
    return output;
}

$('#article').hide();
$('#article').removeClass('on');

$('#showgraphs').on('click',function(e){
    $('#graphs').slideDown();
    $('#graphs').addClass('on');
	$('#article').hide();
	$('#article').removeClass('on');
});

//load data

var dataCall = $.ajax({ 
    type: 'GET', 
    url: 'https://proxy.hxlstandard.org/data.json?strip-headers=on&url=https%3A//docs.google.com/spreadsheets/d/1sMsoSq5Xi5tn3quhs7yUFLnPOpWGsrsPADFOzWHr0wk/pub%3Fgid%3D1722427520%26single%3Dtrue%26output%3Dcsv', 
    dataType: 'json',
});

var arrivalsCall = $.ajax({ 
    type: 'GET', 
    url: 'https://proxy.hxlstandard.org/data.json?strip-headers=on&url=https%3A//docs.google.com/spreadsheets/d/15OC8U1lodClWj0LQ3dUi3sR1emtZxQx5ZDOIPZFgwgM/pub%3Fgid%3D0%26single%3Dtrue%26output%3Dcsv', 
    dataType: 'json',
});

var bordersCall = $.ajax({ 
    type: 'GET', 
    url: 'https://proxy.hxlstandard.org/data.json?strip-headers=on&url=https%3A//docs.google.com/spreadsheets/d/1aICxVKQCA1gzpBVZm1ExgzcSAjhnhAM-z4MhAtm1Oio/pub%3Fgid%3D621776132%26single%3Dtrue%26output%3Dcsv&force=on', 
    dataType: 'json',
});

var bordersGeomCall = $.ajax({ 
    type: 'GET', 
    url: 'data/geom.json', 
    dataType: 'json',
});

//when both ready construct dashboard

$.when(dataCall,arrivalsCall,bordersGeomCall,bordersCall).then(function(dataArgs,arrivalsArgs,bordersGeomArgs,bordersArgs){
    var bordersGeom = topojson.feature(bordersGeomArgs[0],bordersGeomArgs[0].objects.europe_borders);
    data = hxlProxyToJSON(dataArgs[0],false);
    arrivals = hxlProxyToJSON(arrivalsArgs[0],false);
    borders = hxlProxyToJSON(bordersArgs[0],false);

    var dateFormat = d3.time.format("%d/%m/%Y");

    data.forEach(function(d){
        d['#date'] = dateFormat.parse(d['#date']);
		//console.log(d['#date'], d['#meta+title']);
    });

    arrivals.forEach(function(d){
        d['#date'] = dateFormat.parse(d['#date']);
		//console.log(d['#date']);
    });

    generateMap(bordersGeom);

    var arrivalMarkers = createArrivalMarkers();
    generateSparklines(arrivals,arrivalMarkers);
    data = createMarkers(data);
	
	
	
	/////////////////////////////////
	// Timeslider with noUiSlider: //
	/////////////////////////////////
	
    var max = d3.max(data,function(d){return d['#date'].getTime();});  //most recent date in data as timestamp
	var min = d3.min(data,function(d){return d['#date'].getTime()});   //first date for display as timestamp
	var one_day = 24 * 60 * 60 * 1000;
	var one_week = 7 * 24 * 60 * 60 * 1000;
	
	var begin = new Date(max-one_week*5);   //date of start handle
	var end = new Date(max);				//date of end handle
	var endOfDay = new Date(max);
	
	var dateSlider = document.getElementById('dateinput');

	noUiSlider.create(dateSlider, {
		start: [begin, end], 		// handle start positions
		step: one_day, 				// move slider in increments of 'one_day'
		margin: 0, 					// handles may be 0 days apart 
		connect: true, 				// display colored bar between handles
		//direction: 'rtl', 		// put '0' at the bottom of the slider
		orientation: 'horizontal', 
		behaviour: 'tap-drag', 		// move handle on tap, bar is draggable
		range: { 				
			'min': min,
			'max': max
		}/* ,
		format: wNumb({decimals: 0}) */
		/* ,
		pips: { // Show a scale with the slider
			mode: 'range', 
			mode: 'count',
			values: 5,
			density: 3
			//format: wNumb({decimals: 0}) 
		}   */
	});
	

	dateSlider.noUiSlider.on('update', function(values, handle) {
			var begin = new Date(+values[0]);
			begin.setHours(0,0,0,0);
			var end = new Date(+values[1]);
			end.setHours(0,0,0,0);
			var endOfDay = new Date(+values[1]);
			endOfDay.setHours(23,59,59,999);
        
				
		data = filterDateRange(begin,endOfDay,data);				
		updateArrivals(end,arrivals,arrivalMarkers);
		updateBorders(end,borders);
		updateSparkline(arrivals,end,arrivalMarkers);
		
		if (formatDate(begin)==formatDate(end)) {
			$('#dateupdate').html('<p>Displaying news updates for: '+formatDate(begin)+'<br/>Displaying border updates for: '+formatDate(end)+'</p>');
		} else {
			$('#dateupdate').html('<p>Displaying news updates for: '+formatDate(begin)+' - '+formatDate(end)+'<br/>Displaying border updates for: '+formatDate(end)+'</p>');
		};
	});
	
    data = filterDateRange(begin,endOfDay,data);				
    updateArrivals(end,arrivals,arrivalMarkers);
    updateBorders(end,borders);
	updateSparkline(arrivals,end,arrivalMarkers);
	
	if (formatDate(begin)==formatDate(end)) {
		$('#dateupdate').html('<p>Displaying news updates for: '+formatDate(begin)+'<br/>Displaying border updates for: '+formatDate(end)+'</p>');
	} else {
		$('#dateupdate').html('<p>Displaying news updates for: '+formatDate(begin)+' - '+formatDate(end)+'<br/>Displaying border updates for: '+formatDate(end)+'</p>');
	};

});

var weekdays = ["Sun", "Mon", "Tue","Wed", "Thu", "Fri","Sat"]
var months = ["Jan", "Feb", "Mar","Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct","Nov", "Dec"];

// Create string representation of date
function formatDate ( date ) {
    return weekdays[date.getDay()] + " " +
        date.getDate() + " " +
        months[date.getMonth()] + " " +
        date.getFullYear();
}

// Tour / Intro.js
 $('#intro').click(function(){ 
	if ($('#article').hasClass('on')) {					//hide articles to start
		console.log("Articles being turned off");
		$('#article').hide();
		$('#article').removeClass('on');
	};
	if (!$('#graphs').hasClass('on')) {					//show graphs to start
		console.log("Graphs being turned on");
		$('#graphs').slideDown();				
		$('#graphs').addClass('on');
	};
	var options_before = {
        steps: [
          {
            element: '#map',
            intro:"<div style='width: 350px;'><p><b>Hover over an icon in the map to get more information.</b></p><p>The content of a news article or update will appear on the right. Click the link to learn more.</p></div>",
            position: 'right'
          },{
            element: '#text',
            intro: "<div style='width: 300px;'><p><b>These graphs show the daily arrival stats going back to September/October 2015.</b></p><p>The blue line represents the actual number of arrivals and the red line represents the 7 day average trend line.</p></div>",
            position: 'left'
          },{
            element: '#text',
			intro: "<div style='width: 300px;'><p><b>Hovering over an icon in the map reveals the associated news article here.</p></div>",
            position: 'left'
		  },
		  {
            element: '#showgraphs',
            intro:"<div style='width: 350px;'><p><b>Clicking this button will return the view to the summary arrival graphs.</p></div>",
            position: 'left'
          },        
          {
            element: '#timeslider',
            intro: "<div style='width: 300px;'><b>Move both handles on the time slider with your mouse to look at the desired range of past events.</b><p>All news events for the time range will be displayed. Border controls on the map and arrival statistics in the graphs will be displayed for the final date in the range.</p></div>",
            position: 'bottom'
          }          
        ]		
	};


	var intro = introJs();
	intro.setOptions(options_before);
	intro.start()
		.onchange(function () {
			if ((intro._currentStep == "1")) {     //||(intro._currentStep == "3")) {	//should show daily arrival graphs here
				console.log("This is step 1 onchange");
				if ($('#article').hasClass('on')) {
					console.log("Articles being turned off");
					$('#article').hide();
					$('#article').removeClass('on');
				};
				if (!$('#graphs').hasClass('on')) {
					console.log("Graphs being turned on");
					$('#graphs').slideDown();				
					$('#graphs').addClass('on');
				};
			};	
			if ((intro._currentStep == "2")||(intro._currentStep == "5"))  {	//should show daily arrival graphs here - in case user moves backwards
				console.log("This is step 2")
				if ($('#graphs').hasClass('on')) {
					console.log("Graphs being turned off");
					$('#graphs').slideUp();				
					$('#graphs').removeClass('on');
				};
				if (!$('#article').hasClass('on')) {
					example = data[data.length-1];
					console.log("Articles being turned on");
					$('#article').show();
					$('#article').addClass('on');
					$('#title').html(example['#meta+title'].toUpperCase());
					$('#content').html(example['#meta+description']);
					$('#date').html(example['#date'].getDate()+'/'+(example['#date'].getMonth()+1)+'/'+example['#date'].getFullYear());
					$('#url').html('<a href="' + example['#meta+url'] + '" target="_blank">Link</a>');
					
				};
				
			} 
		});
  
}); 
