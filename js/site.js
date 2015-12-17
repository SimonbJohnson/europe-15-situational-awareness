function generateMap(){
    var baselayer = L.tileLayer('https://data.hdx.rwlabs.org/mapbox-base-tiles/{z}/{x}/{y}.png', {});
    var baselayer2 = L.tileLayer('https://data.hdx.rwlabs.org/mapbox-layer-tiles/{z}/{x}/{y}.png', {});
    map = L.map('map', {
        center: [43,20],
        zoom: 5,
        layers: [baselayer,baselayer2]
    });
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
        area:'Greece Islands',
        lat:36.688902,
        lon:27.073489,
        tag:'#affected+arrivegreekislands'
    },
    {
        area:'Greece Mainland',
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
        lon: 20.965015,
        tag:'#affected+arriveserbia'
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

    arrivalMarkers.forEach(function(d,i){
        $('#graphs').append('<div><div class="graph" id="graph' + i + '"><span class="graphlabel">' + d.area + '</span></div></div>');
        sparkline('#graph'+i,data,d.tag,max);
    });

    $('#graphs').append('<p>Access full data <a href="" target="_blanks">here.</a>.  Arrivals data from UNHCR data portal</p>');
    
}

function sparkline(elemId, data, tag, max) {

    var width = 200;
    var height = 50;
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
			
	
	function getAvg(i, data, country, numDaysMovAvg) {
		numDaysMovAvgBuffer = Math.floor(numDaysMovAvg/2);
		if (country == '#affected+arriveaustria') {
			sum = 0;       //for each country?
			for (j=0; j==numDaysMovAvg; j++) {
				sum += data[i-numDaysMovAvgBuffer+j];
			};
			avg = sum/numDaysMovAvg;
		}
		return avg;
	}
	
	var movAvg = function(data)   {   //needs to be an array of values, one for each date with values per 'tag'
		numDaysMovAvg = 7;
		numDaysMovAvgBuffer = Math.floor(numDaysMovAvg/2);
		//console.log("numDaysMovAvgBuffer = ", numDaysMovAvgBuffer);
		//console.log("DATA = ", data);
		
		var avgObj = {};
		var movAvgs = [];
   		for (i=numDaysMovAvgBuffer; i<=data.length-1-numDaysMovAvgBuffer; i++) {
			//avgObj = data[i];		*** DON'T DO THIS - IT LINKS THE 2 OBJECTS SO CHANGES TO ONE CHANGES THE OTHER ONE	
			//avgObj['#affected+arriveaustria'] = 999;
			//avgObj['#affected+arriveaustria'] = data[i]['#affected+arriveaustria'];
			//avgObj['#affected+arriveaustria'] = data[i-1]['#affected+arriveaustria'];
			
			date = data[i]['#date'];
			avgObj['#date'] = date;
			
			avgObj['#affected+arriveaustria'] = getAvg(i, data, '#affected+arriveaustria', numDaysMovAvg);			
			movAvgs.push(avgObj);
			//console.log("data[i]['#affected+arriveaustria'] = ", data[i]['#affected+arriveaustria']);
			console.log("movAvgs = ", movAvgs);  
			//console.log("movAvgs[0]['#date'] = ", movAvgs[0]['#date']); 
			
					
			
		/* 	sum = 0;       //for each country
			for (j=0; j==numDaysMovAvg; j++) {
				sum += data[i-numDaysMovAvgBuffer+j];
			};
			avg = sum/numDaysMovAvg;
			 */
			

		}  
		 
		return movAvgs;
	};

    x.domain(d3.extent(data, function(d) { return d['#date']; }));
    y.domain([0,max]);
    var svg = d3.select(elemId).append('svg').attr('width', width).attr('height', height);
	console.log("data = ", data);

     svg.append('path')
        .datum(data)
        .attr('class', 'sparkline')
        .attr('d', line)
        .attr("stroke", "blue")
        .attr("stroke-width", 2)
        .attr("fill", "none"); 
		
  	svg.append('path')
		.datum(movAvg(data))
		.attr('class', 'movAvgLine')
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
    console.log(date);
    var width = 200;
    var x = d3.scale.linear().range([0, width]);
    x.domain(d3.extent(data, function(d) { return d['#date']; }));

    d3.selectAll('.datemarker').attr('x1',x(date)).attr('x2',x(date));
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
    url: 'https://proxy.hxlstandard.org/data.json?strip-headers=on&url=https%3A//docs.google.com/spreadsheets/d/15OC8U1lodClWj0LQ3dUi3sR1emtZxQx5ZDOIPZFgwgM/pub%3Fgid%3D0%26single%3Dtrue%26output%3Dcsv&force=1', 
    dataType: 'json',
});

//when both ready construct dashboard

$.when(dataCall,arrivalsCall).then(function(dataArgs,arrivalsArgs){
    data = hxlProxyToJSON(dataArgs[0],false);
    arrivals = hxlProxyToJSON(arrivalsArgs[0],false);

    var dateFormat = d3.time.format("%d/%m/%Y");

    data.forEach(function(d){
        d['#date'] = dateFormat.parse(d['#date']);
    });

    arrivals.forEach(function(d){
        d['#date'] = dateFormat.parse(d['#date']);
    });

    generateMap();

    var arrivalMarkers = createArrivalMarkers();
    generateSparklines(arrivals,arrivalMarkers);
    data = createMarkers(data);

    var max = d3.max(data,function(d){return d['#date'].getTime();});
    var min = d3.min(data,function(d){return d['#date'].getTime()+7*86400000});

    $('#dateinput').attr('max',max)
        .attr('min',min)
        .attr('value',max)
        .on('input',function(e){
            var end = new Date($('#dateinput').val()*1);
            var begin = new Date($('#dateinput').val()*1);
            begin.setDate(begin.getDate()-7);
            $('#dateupdate').html('Showing updates for '+end.getDate()+'/'+(end.getMonth()+1)+'/'+end.getFullYear()+' and 7 days prior.');
            data = filterDateRange(begin,end,data);
            updateArrivals(end,arrivals,arrivalMarkers);
            updateSparkline(arrivals,end);
        });

    var begin = new Date($('#dateinput').val()*1);
    
    begin.setDate(begin.getDate()-7);
    data = filterDateRange(begin,max,data);
    updateArrivals(max,arrivals,arrivalMarkers);
    var end = new Date($('#dateinput').val()*1);
    $('#dateinput').width($('#text').width());
    $('#dateupdate').html('Showing updates for '+end.getDate()+'/'+(end.getMonth()+1)+'/'+end.getFullYear()+' and 7 days prior.');
});
