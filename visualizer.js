var cloud_url = 'https://data.sparkfun.com/output/';
var public_key = 'RM7ZbRb8zGidnAQKNZly'; //from https://data.sparkfun.com
var prevResults = null;
var selectedPeriod = 7; //in days
var nowInMills = 0;
var endInMills = 0;
var gauge = null;
var chart = null;

// check if any sample data is given
function isSampleDataGiven() {
    return typeof sampleData !== 'undefined' && sampleData != null;
}

// build and return data table to use to draw chart
function buildChartData(results, periodInDays) {
    var dataTable;
    var endValueExist = false;

    //nowInMills = new Date().getTime();
    nowInMills = new Date(results[0].timestamp).getTime();
    endInMills = nowInMills - (periodInDays * 24 * 60 * 60 * 1000);
    console.log('now=' + new Date(nowInMills) + ' / end=' + new Date(endInMills));

    dataTable = new google.visualization.DataTable();
    dataTable.addColumn('datetime', 'Time');
    dataTable.addColumn('number', 'Temp');
    dataTable.addColumn('number', 'Humidity');

    $.each(results, function(i, row) {
        var _date = new Date(row.timestamp);

        if(_date.getTime() < endInMills) {
            endValueExist = true;
            return false;
        }

        dataTable.addRow([
            _date,
            parseFloat(row.temp),
            parseFloat(row.humidity)
        ]);
    });

    if(!endValueExist) {
        dataTable.addRow([
            (new Date(endInMills)),
            0.0,
            0.0
        ]);
    }

    return dataTable;
}

// call when the chart is ready
function onChartReady() {
    console.log('chart is ready');

    // show selected period
    $("#period").show();
    $("#periodtext").text(
        new Date(endInMills).toLocaleString()
        + " ~ " + new Date(nowInMills).toLocaleString());

    // hide loading
    $('#loading').hide();
}

// call when the chart is requested
function onChartRequest() {
    console.log('chart is requested');
}

// display gauge with the given data
function displayGauge(results) {
    var latest = results[0];
    if(!gauge) gauge = new google.visualization.Gauge($('#gauge').get(0));
    var gaugeData = google.visualization.arrayToDataTable([
        ['Label', 'Value'],
        ['온도', 0],
        ['습도', 0]
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

    // For animation purpose only
    gauge.draw(gaugeData, options);
    // Show real data
    gaugeData.setValue(0, 1, parseFloat(latest.temp));
    gaugeData.setValue(1, 1, parseFloat(latest.humidity));

    gauge.draw(gaugeData, options);
}

// display linechart with the given dasta
function displayLinechart(results) {
    // Draw chart
    if(!chart) chart = new google.visualization.LineChart($('#temperature').get(0));
    chart.draw(buildChartData(results, selectedPeriod), {
        title: '백신냉장고 온도'
    });
}

// call when the results are arrived
function onResultsArrived(results) {
    if(typeof results === 'undefined' || results == null || results.length == 0) {
        console.log('results is empty');
        return;
    }

    // for debugging
    if(isSampleDataGiven()) {
        console.log('The sample data is ...');
        console.log(results);
    }

    prevResults = results;

    displayGauge(results);
    displayLinechart(results);

    onChartReady();
}

// onload callback
function drawChart() {
    onChartRequest();

    if(isSampleDataGiven()) { // for debugging
        console.warn('+++ Run with the given sample data !!! +++');
        //var jsonData = $.getJSON(sampleData).done(onResultsArrived);
        onResultsArrived(sampleData);
    } else {
        // JSONP request
        var jsonData = $.ajax({
            url: cloud_url + public_key + '.json',
            data: {
                page: 0
            },
            dataType: 'jsonp',
        }).done(onResultsArrived);
    }
}

// select period of chart
function selectPeriod(val) {
    selectedPeriod = val; //in days
    console.log('select period : ' + selectedPeriod);

    onResultsArrived(prevResults);
}

// call when DOM tree is created
function init() {
    console.log('page init');

    // Add handler for period selection
    $("#dayperiod").click(function() {
        selectPeriod(1);
    });
    $("#weekperiod").click(function() {
        selectPeriod(7);
    });
    $("#monthperiod").click(function() {
        selectPeriod(30);
    });

    // init period selection
    $("#dayperiod").click();

    // call drawChart once google charts is loaded
    google.setOnLoadCallback(drawChart);
}

// load chart lib
google.load('visualization', '1', {
    packages: ['corechart', 'gauge']
});

$(document).ready(init);
