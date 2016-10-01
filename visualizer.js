var cloud_url = 'https://data.sparkfun.com/output/';
// Public Key from https://data.sparkfun.com
var public_key = 'RM7ZbRb8zGidnAQKNZly';

// check if any sample data is given
function isSampleDataGiven() {
    return typeof sampleData !== 'undefined' && sampleData != null;
}

// call when the results are arrived
function onResultsArrived(results) {
    //console.log(results);
    var latest = results[0];
    var gauge = new google.visualization.Gauge($('#gauge').get(0));
    var gaugeData = google.visualization.arrayToDataTable([
        ['Label', 'Value'],
        ['온도', 0],
        ['습도', 0],

    ]);
    var options = {
        width: 600,
        redFrom: 90,
        redTo: 100,
        yellowFrom: 80,
        yellowTo: 90,
        greenFrom: 70,
        greenTo: 80,
        minorTicks: 5
    };

    // for debugging
    if(isSampleDataGiven()) {
        console.log('The sample data is ...');
        console.log(results);
    }

    // For animation purpose only
    gauge.draw(gaugeData, options);
    // Show real data
    gaugeData.setValue(0, 1, parseFloat(latest.temp));
    gaugeData.setValue(1, 1, parseFloat(latest.hum));

    gauge.draw(gaugeData, options);
    var data = new google.visualization.DataTable();
    data.addColumn('datetime', 'Time');
    data.addColumn('number', 'Temp');
    data.addColumn('number', 'Humidity');

    $.each(results, function(i, row) {
        data.addRow([
            (new Date(row.timestamp)),
            parseFloat(row.temp),
            parseFloat(row.humidity),

        ]);
    });
    var chart = new google.visualization.LineChart($('#temperature').get(0));
    chart.draw(data, {
        title: '백신냉장고 온도'
    });
}

// onload callback
function drawChart() {
    if(isSampleDataGiven()) { // for debugging
        console.warn('+++ Run with the given sample data !!! +++');
        var jsonData = $.getJSON(sampleData).done(onResultsArrived);
    } else {
        // JSONP request
        var jsonData = $.ajax({
            url: cloud_url + public_key + '.json',
            data: {
                page: 1
            },
            dataType: 'jsonp',
        }).done(onResultsArrived);
    }
}

// load chart lib
google.load('visualization', '1', {
    packages: ['corechart', 'gauge']
});
// call drawChart once google charts is loaded
google.setOnLoadCallback(drawChart);

// handle period selection
$(function() {
    $("#dayperiod").click(function() {
        alert("view day");
    });

    $("#weekperiod").click(function() {
        alert("view week");
    });

    $("#monthperiod").click(function() {
        alert("view month");
    });
});
