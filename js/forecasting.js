
/* 
 * Purpose: Javascript for building arrival forecasting graphs
 *  Author: Simon B Johnson
 */

// Global variables
var arrivals;

// Load model and append headers to html doc
function loadModel(url) {
    // Pull model from a json url
    $.ajax({
        dataType: "json",
        url: url,
        success: function(data) {
            // Clear out any input from given html ids
            $("#results").html("");
            $("#previous1").html("");
            $("#previous2").html("");
            $("#previous3").html("");

            // Pull in description from the given model json file
            $("#description").html("Description of Model: " + data.description);
        
            // Set arrays for models and their proper names
            models = ["austria","slovenia","croatia","serbia","fyrom"];
            names = ["Austria","Slovenia","Croatia","Serbia","The former Yugoslav Republic of Macedonia"];

            // For each object in the model json file...
            for(a=0;a<models.length;a++) {
                // Append the proper name as a header to the cooresponding html id
                $("#results").append("<h2>" + names[a] + "</h2>");
                // Append the correct graph as well, only show last 40 days
                graph("#results",arrivals.slice(arrivals.length-40,arrivals.length),models[a],data.models);
                // Run through numbers 1-3
                for(b=1;b<3;b++) {
                    if(b=1) {
                        // Append the proper title as a header to the cooresponding html id
                        $('#previous1').append("<h2>" + names[a] + ": " + b + " Day Forecast Performance</h2>");
                        // Append the correct graph as well, only show last 40 days
                        forecastGraph('#previous1',arrivals.slice(arrivals.length-40,arrivals.length),models[a],data.models,b);
                    } 
                    if(b=2) {
                        // Append the proper title as a header to the cooresponding html id
                        $('#previous2').append("<h2>" + names[a] + ": " + b + " Day Forecast Performance</h2>");
                        // Append the correct graph as well, only show last 40 days
                        forecastGraph('#previous2',arrivals.slice(arrivals.length-40,arrivals.length),models[a],data.models,b);
                    }
                    if(b=3) {
                        // Append the proper title as a header to the cooresponding html id
                        $('#previous3').append("<h2>" + names[a] + ": " + b + " Day Forecast Performance</h2>");
                        // Append the correct graph as well, only show last 40 days
                        forecastGraph('#previous3',arrivals.slice(arrivals.length-40,arrivals.length),models[a],data.models,b);
                    }
                }    
            }
        }
    });
}

// Build the previous performance graphs within an html element id with data for countries with a given model
function forecastGraph(elemId, data, country, models, lag) {

    // Set tags for pulling arrivals number from data source
    var tag = "#affected+arrive"+country

    // Set dimensions for each forecast graph
    var margin = {top: 20, right: 20, bottom: 25, left: 55},
         width = 500 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    // Set x and y scales based on data type and chart dimensions
    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);

    // Build x axis
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(5);

    // Build y axis
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    // Build line for graph from data
    var line = d3.svg.line()
        // Line is defined if arrivals data is not N/A
        .defined(function(d){
            return d[tag]!="N/A"
        })
        // Non-dates returned as 0
        .x(function(d) {
            if(d["#date"]=="N/A"){
                return x(0);
            } else {
                return x(d["#date"]);
            } 
        })
        // Non-numbers returned as 0
        .y(function(d) { 
            if(d[tag]=="N/A"){
                return y(0);
            } else {
                return y(d[tag]);
            } 
        });

    // Locate max and min dates from data source
    var max = d3.max(data, function(d) { return d["#date"]});
    var min = d3.min(data, function(d) { return d["#date"]});                   

    // Set the domain of x to min/max dates
    x.domain([min,max]);

    // Set y axis max equal to the largest arrivals number
    var ymax = d3.max(data, function(d) {
        // If arrivals is N/A, return as 0
        if(d[tag]=="N/A") {
            return 0
        // Otherwise transform to number
        } else {
            return Number(d[tag]);
        }
    });

    // Set the domain of y to y axis max
    y.domain([0,ymax]);

    // Build svg element within an html element id with margin, height and width as defined previously
    var svg = d3.select(elemId).append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Create new date object as start date for showing previous forecasting performance
    var prevDate = new Date(data[7]["#date"].getTime());

    // Create variable to append to the svg chart
    var forecastg = svg.append("g");

    // Obtain average errors
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

    // Draw sparkline path for line graphs and style accordingly
    svg.append('path')
        .datum(data)
        .attr('class', 'sparkline')
        .attr('d', line)
        .attr("stroke", "#4F47D3")
        .attr("stroke-width", 1)
        .attr("fill", "none");

    // Build x axis
    svg.append("g")
        .attr("class", "xaxis axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Build y axis
    svg.append("g")
        .attr("class", "yaxis axis")
        .call(yAxis);                   
}

// Build the forecasting graphs within an html element id with data for countries with a given model
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

    var ymax = d3.max(data, function(d) {
        if(d[tag]=="N/A") {
           return 0;
        } else {
            return Number(d[tag]);
        }
    });
    y.domain([0,ymax]);

    // Build svg element within an html element id with margin, height and width as defined previously
    var svg = d3.select(elemId).append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Draw sparkline path for line graphs and style accordingly
    svg.append("path")
        .datum(data)
        .attr("class", "sparkline")
        .attr("d", line)
        .attr("stroke", "#B71C1C")
        .attr("stroke-width", 2)
        .attr("fill", "none");

    // Build x axis
    svg.append("g")
        .attr("class", "xaxis axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Build y axis
    svg.append("g")
        .attr("class", "yaxis axis")
        .call(yAxis);

    var prevDate = new Date(data[data.length-1]['#date'].getTime());

    var forecastg = svg.append("g");

    for (i = 1; i <= 3; i++){
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
                .attr("stroke", "#B71C1C");
  
        }
        prevDate = new Date(forecastDate.getTime());
    }                  
}

$('#intro').click(function(){
    var intro = introJs();
    intro.setOptions({
        steps: [
          {
            intro: "<div style='width: 300px;'><p>This page displays forecasts for arrival numbers into countries along the Western Balkans route. It offers a 1, 2 and 3 day forecast for arrivals based upon past data.</p></div>",
          },
          {
            element: '#results',
            intro:"<div style='width: 350px;'><img id='expimage' alt='Forecasting Explanation' title='Forecasting Explanation' src='forecasting/forecastexplanation.png' /><p>When reading the graph, you will note the error bars. In our experience, it is highly unlikely that the real arrivals number will ever exceed the upper bounds of the average error.</p></div>",
            position: 'right'
          },
          {
            element: '#buttons',
            intro:"<div style='width: 350px;'><p>The page is split into two parts:</p><ul><li><b>Current Forecast</b> shows estimates for the next 1-3 days</li><li><b>Previous Performance</b> allows you to check how closely the model predicted previous arrival numbers</li></ul></div>",
            position: 'bottom'
          },
          {
            element: '#results',
            intro: "<div style='width: 300px;'><p>At this time, predictions are most accurate for the 1 day forecasts, and for the countries further along the route. The closer the country geographically to the border of Europe, the more outside variables affect migrant movement. You can explore a situational overview by selecting the tab in the navigation bar above.</p></div>",
            position: 'right'
          },
          {
            intro: "<div style='width: 300px;'><p>If you are wondering where the graph for Greece is&mdash;or your own country which is not included&mdash;please note that arrivals predictions is dependent upon a variety of factors and we are currently working to improve this model. Feedback is welcome.</p></div>",
          },
          {
            intro: "<div style='width: 300px;'><p class='highlight'>NOTE: The results of this model are not guaranteed. Migrant movement is based upon many variables and this model only takes into account past arrivals numbers. For best results, use these predictions as a guide alongside weather conditions, border policies, public opinion, political events, migrant demographics, etc.</p></div>",
          }
        ]
    });
    intro.start();
});

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

// Calculates average error of each arrivals prediction based on model
function getAverageError(data,model,tag){
    var errorabsum = 0;
             count = 0;

    data.slice(7,data.length).forEach(function(d) {
        var est = estimate(d["#date"],model,data);
        console.log(est);
        // If 
        if(!isNaN(est) && d[tag]!="N/A"){
            errorabsum += Math.abs(est-d[tag]);
            count++;
        
        }
    });
    var avgerr = errorabsum/count;
    return avgerr;
}

// 
function findDate(date,data){
    var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
    var lastDate = data[data.length-1]["#date"];
    var diffDays = Math.round((lastDate.getTime() - date.getTime())/(oneDay));
    return data.length-1-diffDays;
}

// 
function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

// Connect Google spreadsheet data to JSON through HXL Proxy
function hxlProxyToJSON(input,headers){
    // Assign empty arrays
    var output = [];
    var keys=[]
    // 
    input.forEach(function(e,i) {
        if(i==0){
            keys = e;
        } else if(headers==true && i>1) {
            var row = {};
            e.forEach(function(e2,i2) {
                row[keys[i2]] = e2;
            });
            output.push(row);
        } else if(headers!=true) {
            var row = {};
            e.forEach(function(e2,i2) {
                row[keys[i2]] = e2;
            });
            output.push(row);
        }
    });
    return output;
}

// Model Selector Option
/*var modelList = ['05nov05_15dec15_lasso','05dec05_15jan16_lasso','05Jan16_15Feb16_lasso'];

var html ='';
modelList.forEach(function(m){
    html +='<option values="'+m+'">'+m+'</option>';
});
$('#modeldropdown').html(html);
$('#load').on('click',function(e){
    $('#results').show();
    $('#previous').hide();
    loadModel('forecasting/'+$('#modeldropdown').val()+'.json');
});*/
$("#previous1").hide();
$("#previous2").hide();
$("#previous3").hide();

// Load arrivals data from HXL proxy
$.ajax({
    dataType: "json",
    url: "https://proxy.hxlstandard.org/data.json?strip-headers=on&url=https%3A//docs.google.com/spreadsheets/d/15OC8U1lodClWj0LQ3dUi3sR1emtZxQx5ZDOIPZFgwgM/pub%3Fgid%3D0%26single%3Dtrue%26output%3Dcsv",
    success: function(data) {
        arrivals = hxlProxyToJSON(data,false);
        // Sets date format for parsing
        var dateFormat = d3.time.format("%d/%m/%Y");
        // Parse date for each
        arrivals.forEach(function(d){
            d["#date"] = dateFormat.parse(d["#date"]);
        });

        // Default model url for onload
        loadModel("forecasting/15Feb16_07Mar16_lasso.json");
    }
});

// On click event for "Run Forecast" button
$("#forecastbutton").on("click",function(e){
    $("#results").show();
    $("#previous1").hide();
    $("#previous2").hide();
    $("#previous3").hide();
});

// On click event for "Past Performance" buttons
$("#previousbutton1").on("click",function(e) {
    $("#results").hide();
    $("#previous1").show();
    $("#previous2").hide();
    $("#previous3").hide();
});
$("#previousbutton2").on("click",function(e) {
    $("#results").hide();
    $("#previous1").hide();
    $("#previous2").show();
    $("#previous3").hide();
});
$("#previousbutton3").on("click",function(e) {
    $("#results").hide();
    $("#previous1").hide();
    $("#previous2").hide();
    $("#previous3").show();
});
