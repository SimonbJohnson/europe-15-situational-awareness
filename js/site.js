function generateMap(bordersGeom){
    var baselayer = L.tileLayer('https://data.hdx.rwlabs.org/mapbox-base-tiles/{z}/{x}/{y}.png', {});
    var baselayer2 = L.tileLayer('https://data.hdx.rwlabs.org/mapbox-layer-tiles/{z}/{x}/{y}.png', {});


    map = L.map('map', {
        center: [43,20],
        zoom: 5,
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
				iconUrl:'images/border_medium-01.png'
			},{
				iconText:'Transit',
				iconUrl:'images/transit_medium-01.png'
			},{
				iconText:'Camp',
				iconUrl:'images/camp_medium-01.png'
			},{
				iconText:'Conflict',
				iconUrl:'images/conflict_medium-01.png'
			},{
				iconText:'Policy',
				iconUrl:'images/policy_medium-01.png'
			},{
				iconText:'Registration',
				iconUrl:'images/registration_medium-01.png'
		}];
			
		var iconArrivals = [{
			iconText:'Arrivals per country <i>(relative)</i>',
			iconUrl:'images/green.PNG'
		}];
		
		var iconBorderCrossings = [{
				iconText:'Operational',
				iconUrl:'images/red_line.png'
			},{
				iconText:'Under construction',
				iconUrl:'images/red_dash_line.png'
			},{
				iconText:'On standby',
				iconUrl:'images/purple_line.png'
			},{
				iconText:'Other issues',
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

    data.forEach(function(d){
        if(d['#date']>=begin&&d['#date']<=end){
            if(!d.visible){
                d.marker.addTo(map);
                d.visible = true;
            }
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
            $('#title').html(d['#meta+title']);
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
	{	area:'Croatia',
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
	 $('#graphs').append('<p class="graphnote"><i>* Note: arrival numbers for each country below are relative (i.e. drawn to same scale).</i><p>');
	
    arrivalMarkers.forEach(function(d,i){
        $('#graphs').append('<div><div class="graph" id="graph' + i + '"><span class="graphlabel">' + d.area + '</span></div></div>');
        sparkline('#graph'+i,data,d.tag,max);
    });

    $('#graphs').append('<br/><p>Access <a href="https://docs.google.com/spreadsheets/d/15OC8U1lodClWj0LQ3dUi3sR1emtZxQx5ZDOIPZFgwgM/edit?usp=sharing" target="_blanks">full data</a>.  Arrivals data from <a href="http://data.unhcr.org/mediterranean/regional.php">UNHCR data portal</a>.</p>');
    
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

        country = ['#affected+arriveaustria','#affected+arrivecroatia','#affected+arrivefyrom','#affected+arrivegreekislands','#affected+arrivehungary','#affected+arrivemainlandgreece','#affected+arriveserbia','#affected+arriveslovenia'];
        
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

function updateSparkline(data,date){
    var width = 200;
    var x = d3.scale.linear().range([0, width]);
    x.domain(d3.extent(data, function(d) { return d['#date']; }));

    d3.selectAll('.datemarker').attr('x1',x(date)).attr('x2',x(date));
}



function updateBorders(end,borders){
	var dateFormat = d3.time.format("%d-%b-%Y");
	//var dateFormat = d3.time.format("%d/%m/%Y");
	
 	borders.sort(function(a, b) {
		//return a['#date'].getTime() - b['#date'].getTime();
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
					d3.selectAll('.'+b['#meta+id'].replace('-','')).attr('stroke','#b135b8').attr('stroke-width',3).style('stroke-dasharray', ('8,20'));
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

$('#showgraphs').on('click',function(e){
    $('#graphs').slideDown();
    $('#article').hide();
});

//load data

var dataCall = $.ajax({ 
    type: 'GET', 
    url: 'https://proxy.hxlstandard.org/data.json?strip-headers=on&url=https%3A//docs.google.com/spreadsheets/d/1HnLZh1hUuR6JKw0xwVtC4_a4o0ixREQf9EqN1LSy2D8/pub%3Fgid%3D137269997%26single%3Dtrue%26output%3Dcsv', 
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

    //var dateFormat = d3.time.format("%d-%b-%Y");
	var dateFormat = d3.time.format("%d/%m/%Y");

    data.forEach(function(d){
        d['#date'] = dateFormat.parse(d['#date']);
    });

    arrivals.forEach(function(d){
        d['#date'] = dateFormat.parse(d['#date']);
    });

    generateMap(bordersGeom);

    var arrivalMarkers = createArrivalMarkers();
    generateSparklines(arrivals,arrivalMarkers);
    data = createMarkers(data);

    var max = d3.max(data,function(d){return d['#date'].getTime();});
    var min = d3.min(data,function(d){return d['#date'].getTime()+7*86400000});

    $('#dateinput').attr('max',max)
        .attr('min',min)
        .attr('value',max)
        .css('margin-left', 105+'px')
        .on('input',function(e){
            var end = new Date($('#dateinput').val()*1);
            var begin = new Date($('#dateinput').val()*1);
            begin.setDate(begin.getDate()-7);
            $('#dateupdate').html('<p>Displaying news updates for: '+begin.getDate()+'/'+(begin.getMonth()+1)+'/'+begin.getFullYear()+' - '+end.getDate()+'/'+(end.getMonth()+1)+'/'+end.getFullYear()+'</p><p>Displaying border updates for: '+end.getDate()+'/'+(end.getMonth()+1)+'/'+end.getFullYear()+'</p>');
            data = filterDateRange(begin,end,data);
            updateArrivals(end,arrivals,arrivalMarkers);
			updateBorders(end,borders);
            updateSparkline(arrivals,end);
        });

    var begin = new Date($('#dateinput').val()*1);
    
    begin.setDate(begin.getDate()-7);
    data = filterDateRange(begin,max,data);
    updateArrivals(max,arrivals,arrivalMarkers);
    updateBorders(max,borders);
    var end = new Date($('#dateinput').val()*1);
    $('#dateinput').width(200);
    $('#dateupdate').html('<p>Displaying news updates for: '+begin.getDate()+'/'+(begin.getMonth()+1)+'/'+begin.getFullYear()+' - '+end.getDate()+'/'+(end.getMonth()+1)+'/'+end.getFullYear()+'</p><p>Displaying border updates for: '+end.getDate()+'/'+(end.getMonth()+1)+'/'+end.getFullYear()+'</p>');
});
