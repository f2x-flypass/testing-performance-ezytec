/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 70.2372393961179, "KoPercent": 29.7627606038821};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5352264557872034, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.5, 500, 1500, "registrarEntradaEglobalt"], "isController": false}, {"data": [0.5, 500, 1500, "loginEnAppAFlypass"], "isController": false}, {"data": [0.03153153153153153, 500, 1500, "registrarEntradaSinSalida"], "isController": false}, {"data": [0.5714285714285714, 500, 1500, "consultarServiciosEnCurso"], "isController": false}, {"data": [0.7766423357664234, 500, 1500, "getPlate"], "isController": false}, {"data": [0.0, 500, 1500, "loginAFlypass"], "isController": false}, {"data": [0.35714285714285715, 500, 1500, "consultarMovimientos"], "isController": false}, {"data": [0.16666666666666666, 500, 1500, "setPayment"], "isController": false}, {"data": [0.15100671140939598, 500, 1500, "registrarSalidaPagoAutomatico"], "isController": false}, {"data": [0.0, 500, 1500, "registrarSalidaPagoManual"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1391, 414, 29.7627606038821, 616.0891445003596, 85, 25634, 412.0, 1073.6, 1491.999999999998, 2778.8799999999974, 2.298394758800737, 1.8100417033277978, 2.7966553559331135], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["registrarEntradaEglobalt", 351, 74, 21.08262108262108, 654.5042735042739, 334, 4015, 557.0, 1069.4, 1287.8, 1894.2400000000011, 0.651748859439496, 0.32075725534814714, 0.6710080759528809], "isController": false}, {"data": ["loginEnAppAFlypass", 7, 2, 28.571428571428573, 720.8571428571428, 367, 2386, 407.0, 2386.0, 2386.0, 2386.0, 0.0799725808294299, 0.1326442541128756, 0.040901155318176625], "isController": false}, {"data": ["registrarEntradaSinSalida", 111, 75, 67.56756756756756, 981.2342342342343, 331, 4296, 389.0, 2344.2, 3423.9999999999973, 4282.44, 0.5562432035599565, 0.2615758329240853, 0.5257208846146136], "isController": false}, {"data": ["consultarServiciosEnCurso", 7, 2, 28.571428571428573, 455.7142857142857, 88, 1162, 274.0, 1162.0, 1162.0, 1162.0, 0.08220111088929859, 0.9407944663973602, 0.06621501315217775], "isController": false}, {"data": ["getPlate", 685, 112, 16.35036496350365, 424.96496350364987, 337, 1002, 403.0, 519.4, 579.0, 759.28, 1.1427789715322914, 0.5206907249097454, 0.9455671619334485], "isController": false}, {"data": ["loginAFlypass", 1, 0, 0.0, 3908.0, 3908, 3908, 3908.0, 3908.0, 3908.0, 3908.0, 0.25588536335721596, 0.5305123304759468, 0.08771070560388947], "isController": false}, {"data": ["consultarMovimientos", 7, 2, 28.571428571428573, 926.0, 247, 1240, 1178.0, 1240.0, 1240.0, 1240.0, 0.08217602103706138, 4.22551897459, 0.06719219577263068], "isController": false}, {"data": ["setPayment", 6, 4, 66.66666666666667, 468.1666666666667, 85, 1048, 350.0, 1048.0, 1048.0, 1048.0, 0.08602150537634408, 0.04116263440860215, 6.276881720430108], "isController": false}, {"data": ["registrarSalidaPagoAutomatico", 149, 76, 51.006711409395976, 1212.8926174496646, 335, 25634, 489.0, 1742.0, 2115.0, 25207.0, 0.4985361773316604, 0.24046881534922626, 0.49374281158511085], "isController": false}, {"data": ["registrarSalidaPagoManual", 67, 67, 100.0, 374.25373134328345, 337, 449, 373.0, 398.2, 404.2, 449.0, 0.8494668644529815, 0.37923158511150834, 0.7456978901208271], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400", 2, 0.4830917874396135, 0.14378145219266714], "isController": false}, {"data": ["401", 286, 69.08212560386474, 20.560747663551403], "isController": false}, {"data": ["500", 2, 0.4830917874396135, 0.14378145219266714], "isController": false}, {"data": ["403", 124, 29.95169082125604, 8.914450035945363], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1391, 414, "401", 286, "403", 124, "400", 2, "500", 2, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["registrarEntradaEglobalt", 351, 74, "401", 54, "403", 20, "", "", "", "", "", ""], "isController": false}, {"data": ["loginEnAppAFlypass", 7, 2, "401", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["registrarEntradaSinSalida", 111, 75, "401", 52, "403", 23, "", "", "", "", "", ""], "isController": false}, {"data": ["consultarServiciosEnCurso", 7, 2, "500", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["getPlate", 685, 112, "401", 79, "403", 33, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["consultarMovimientos", 7, 2, "403", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["setPayment", 6, 4, "400", 2, "403", 2, "", "", "", "", "", ""], "isController": false}, {"data": ["registrarSalidaPagoAutomatico", 149, 76, "401", 54, "403", 22, "", "", "", "", "", ""], "isController": false}, {"data": ["registrarSalidaPagoManual", 67, 67, "401", 45, "403", 22, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
