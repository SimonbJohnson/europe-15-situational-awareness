function loadModel(url){
	$.ajax({
      dataType: 'json',
      url: url,
      success: function(data) {
        $('#results').html('');
        $('#previous').html('');
      	$('#description').html("Description of model: "+data.description);
      	models = ['austria','slovenia','croatia','serbia','fyrom'];
      	names = ['Austria','Slovenia','Croatia','Serbia','former Yugoslav Republic of Macedonia'];
      	for(ind=0;ind<models.length;ind++){
	      	$('#results').append('<h2>'+names[ind]+'</h2>');
	        graph('#results',arrivals.slice(arrivals.length-40,arrivals.length),models[ind],data.models);
	        for(ind2=1;ind2<6;ind2++){
	        	$('#previous').append('<h2>' + names[ind] + ' ' + ind2 + ' day forcast performance</h2>');
        		forecastGraph('#previous',arrivals.slice(arrivals.length-40,arrivals.length),models[ind],data.models,ind2);  
	        }
    	}
              
      }
    });
}

function forecastGraph(elemId, data, country, models,lag){

	var tag='#affected+arrive'+country
    var margin = {top: 20, right: 20, bottom: 25, left: 55},
        width = 500 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;
    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(5);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");


    var line = d3.svg.line()
        .defined(function(d){return d[tag]!='N/A'})
        .x(function(d) {if(d['#date']=='N/A'){
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

    var max = d3.max(data, function(d) { return d['#date']});
    var min = d3.min(data, function(d) { return d['#date']});                    

    x.domain([min,max]);

    var ymax = d3.max(data, function(d) {if(d[tag]=='N/A'){
	    	return 0
	    } else {
	    	return Number(d[tag]);
	    }
    });
    y.domain([0,ymax]);

    var svg = d3.select(elemId).append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var prevDate = new Date(data[7]['#date'].getTime());

    var forecastg = svg.append("g");

	var avgerr = getAverageError(data,models[country][lag],tag);
	data.slice(7,data.length).forEach(function(d){
		var forecastDate = new Date(d['#date']);

		var est = estimate(forecastDate,models[country][lag],data);
		if(!isNaN(est)){
			forecastg.append("rect")
	               .attr("x", x(prevDate)+(x(forecastDate)-x(prevDate))*0.5)
	               .attr("y", y(est+avgerr))
	               .attr("width", x(forecastDate)-x(prevDate))
	               .attr("height", y(est-avgerr)-y(est+avgerr))
	               .attr("fill","#FFD392");
			forecastg.append("line")
					.attr("x1", x(prevDate)+(x(forecastDate)-x(prevDate))*0.5)
	                .attr("y1", y(est))
	                .attr("x2", x(forecastDate)+(x(forecastDate)-x(prevDate))*0.5)
	                .attr("y2", y(est))
	                .attr("stroke-width", 2)
	                .attr("stroke", "#4F47D3");
		}
		prevDate = new Date(forecastDate.getTime());
	});        

    svg.append('path')
        .datum(data)
        .attr('class', 'sparkline')
        .attr('d', line)
        .attr("stroke", "#4F47D3")
        .attr("stroke-width", 1)
        .attr("fill", "none");

	svg.append("g")
        .attr("class", "xaxis axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "yaxis axis")
        .call(yAxis);                	
}

function graph(elemId, data, country, models) {
	var tag='#affected+arrive'+country
    var margin = {top: 20, right: 20, bottom: 25, left: 55},
        width = 500 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;
    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(5);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var line = d3.svg.line()
        .defined(function(d){return d[tag]!='N/A'})
        .x(function(d) {if(d['#date']=='N/A'){
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

/*
    var line = d3.svg.line()
            .x(function(d) {if(d['#date']=='N/A'){
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
*/
    var max = addDays(d3.max(data, function(d) { return d['#date']}),5);
    var min = d3.min(data, function(d) { return d['#date']});                    

    x.domain([min,max]);

    var ymax = d3.max(data, function(d) {if(d[tag]=='N/A'){
	    	return 0
	    } else {
	    	return Number(d[tag]);
	    }
    });
    y.domain([0,ymax]);

    var svg = d3.select(elemId).append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append('path')
        .datum(data)
        .attr('class', 'sparkline')
        .attr('d', line)
        .attr("stroke", "#5C52FF")
        .attr("stroke-width", 2)
        .attr("fill", "none");

	svg.append("g")
        .attr("class", "xaxis axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "yaxis axis")
        .call(yAxis);

    var prevDate = new Date(data[data.length-1]['#date'].getTime());

    var forecastg = svg.append("g");

	for (i = 1; i <= 5; i++){
		var avgerr = getAverageError(data,models[country][i],tag);
		var forecastDate = new Date(data[data.length-1]['#date'].getTime());
		forecastDate.setDate(forecastDate.getDate() + i);
		var est = estimate(forecastDate,models[country][i],data);

		if(!isNaN(est)){
			forecastg.append("rect")
                .attr("class","err"+i)
                .attr("x", x(prevDate))
                .attr("y", y(est+avgerr))
                .attr("width", x(forecastDate)-x(prevDate))
                .attr("height", y(est-avgerr)-y(est+avgerr))
                .attr("fill","#FFD392")
                .attr('title',forecastDate);

			forecastg.append("line")
				.attr("x1", x(prevDate))
                .attr("y1", y(est))
                .attr("x2", x(forecastDate))
                .attr("y2", y(est))
                .attr("stroke-width", 2)
                .attr("stroke", "#4F47D3");
  
		}
		prevDate = new Date(forecastDate.getTime());
	}                  
}

function estimate(forecastfromdate,model,data){
	element = findDate(forecastfromdate,data)
	est = 0
	model.forEach(function(d){			
			if(d['var']=='intercept'){
				est+=d['coef']*1;
			} else {
				var part = d['var'].split('.');
				var tag = '#affected+'+part[2];
				var lag = Number(part[3]);
				var indval = data[element-lag][tag];
				est+=indval*d['coef']*1;
			}
		});
	return est;
}

function getAverageError(data,model,tag){
	errorabsum = 0;
	count = 0;
	data.slice(7,data.length).forEach(function(d){
		var est = estimate(d['#date'],model,data);
		if(!isNaN(est) && d[tag]!='N/A'){
			errorabsum += Math.abs(est-d[tag]);
			count++;
		
		}
	});
	avgerr = errorabsum/count;
	return avgerr;
}

function findDate(date,data){
	var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
	var lastDate = data[data.length-1]['#date'];
	var diffDays = Math.round((lastDate.getTime() - date.getTime())/(oneDay));
	return data.length-1-diffDays;
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
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

var arrivals
var modelList = ['05nov05_15dec15_lasso','05dec05_15jan16_lasso'];

var html ='';
modelList.forEach(function(m){
	html +='<option values="'+m+'">'+m+'</option>';
});
$('#modeldropdown').html(html);
$('#load').on('click',function(e){
	$('#results').show();
	$('#previous').hide();
	loadModel('forecasting/'+$('#modeldropdown').val()+'.json');
});
$('#previous').hide();

$.ajax({
    dataType: 'json',
    url: 'https://proxy.hxlstandard.org/data.json?strip-headers=on&url=https%3A//docs.google.com/spreadsheets/d/15OC8U1lodClWj0LQ3dUi3sR1emtZxQx5ZDOIPZFgwgM/pub%3Fgid%3D0%26single%3Dtrue%26output%3Dcsv',
    success: function(data) {
    	arrivals = hxlProxyToJSON(data,false);

		var dateFormat = d3.time.format("%d/%m/%Y");

	    arrivals.forEach(function(d){
	        d['#date'] = dateFormat.parse(d['#date']);
	    });

        loadModel('forecasting/05nov05_15dec15_lasso.json');
    }
});

$('#forecastbutton').on('click',function(e){
	$('#results').show();
	$('#previous').hide();
});

$('#previousbutton').on('click',function(e){
	$('#results').hide();
	$('#previous').show();
});

