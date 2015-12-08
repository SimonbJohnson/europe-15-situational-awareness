function generateMap(){
    var baselayer = L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {});

    map = L.map('map', {
        center: [50,15],
        zoom: 4,
        layers: [baselayer]
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

function createMarkers(data){
    data.forEach(function(d){
        d.marker = L.marker([d['#geo+lat'],d['#geo+lon']])
        .on('mouseover',function(e){
            $('#title').html(d['#meta+title']);
            $('#content').html(d['#meta+description']);
            $('#date').html(d['#date'].getDate()+'/'+(d['#date'].getMonth()+1)+'/'+d['#date'].getFullYear());
            $('#url').html('<a href="' + d['#meta+url'] + '" target="_blank">Link</a>');
        });
        d.visible = false;
    });

    return data;
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

//load data

var dataCall = $.ajax({ 
    type: 'GET', 
    url: 'https://proxy.hxlstandard.org/data.json?strip-headers=on&url=https%3A//docs.google.com/spreadsheets/d/1HnLZh1hUuR6JKw0xwVtC4_a4o0ixREQf9EqN1LSy2D8/pub%3Fgid%3D137269997%26single%3Dtrue%26output%3Dcsv', 
    dataType: 'json',
});

//load geometry

//when both ready construct dashboard

$.when(dataCall).then(function(dataArgs){
    data = hxlProxyToJSON(dataArgs,false);

    var dateFormat = d3.time.format("%d/%m/%Y");

    data.forEach(function(d){
        d['#date'] = dateFormat.parse(d['#date']);
    });

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
    });

    generateMap(data);

    var begin = new Date($('#dateinput').val()*1);
    begin.setDate(begin.getDate()-7);
    data = createMarkers(data);
    data = filterDateRange(begin,max,data);

    var end = new Date($('#dateinput').val()*1);
    $('#dateinput').width($('#text').width());
    $('#dateupdate').html('Showing updates for '+end.getDate()+'/'+(end.getMonth()+1)+'/'+end.getFullYear()+' and 7 days prior.');
});
