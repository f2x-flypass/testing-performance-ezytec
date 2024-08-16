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

    var data = {"OkPercent": 65.62021439509954, "KoPercent": 34.37978560490046};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5130168453292496, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.46458923512747874, 500, 1500, "registrarEntradaEglobalt"], "isController": false}, {"data": [0.5, 500, 1500, "loginEnAppAFlypass"], "isController": false}, {"data": [0.08653846153846154, 500, 1500, "registrarEntradaSinSalida"], "isController": false}, {"data": [0.7142857142857143, 500, 1500, "consultarServiciosEnCurso"], "isController": false}, {"data": [0.7598039215686274, 500, 1500, "getPlate"], "isController": false}, {"data": [0.5, 500, 1500, "loginAFlypass"], "isController": false}, {"data": [0.35714285714285715, 500, 1500, "consultarMovimientos"], "isController": false}, {"data": [0.25, 500, 1500, "setPayment"], "isController": false}, {"data": [0.125, 500, 1500, "registrarSalidaPagoAutomatico"], "isController": false}, {"data": [0.0, 500, 1500, "registrarSalidaPagoManual"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1306, 449, 34.37978560490046, 673.8637059724359, 88, 27337, 415.0, 1236.3, 1659.0499999999977, 3987.8100000000013, 2.1678831268643215, 1.6944205799087364, 2.6820466524382045], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["registrarEntradaEglobalt", 353, 136, 38.52691218130312, 616.3427762039657, 345, 5235, 441.0, 868.6, 1076.3000000000002, 4307.059999999994, 0.6547245890814938, 0.33109170630408896, 0.6700461500849473], "isController": false}, {"data": ["loginEnAppAFlypass", 7, 2, 28.571428571428573, 485.71428571428567, 389, 659, 439.0, 659.0, 659.0, 659.0, 0.07885458088790259, 0.13021786746234693, 0.040307363891360914], "isController": false}, {"data": ["registrarEntradaSinSalida", 104, 69, 66.34615384615384, 1116.221153846154, 347, 26268, 408.0, 1790.0, 2207.0, 25147.550000000065, 0.5220228384991844, 0.24596287175304304, 0.4937149030618647], "isController": false}, {"data": ["consultarServiciosEnCurso", 7, 2, 28.571428571428573, 300.7142857142857, 95, 420, 360.0, 420.0, 420.0, 420.0, 0.07877560207067297, 0.4429259333502138, 0.06329083319266261], "isController": false}, {"data": ["getPlate", 612, 99, 16.176470588235293, 518.3823529411768, 344, 4286, 404.0, 563.4000000000005, 741.6500000000004, 3934.2200000000003, 1.02121524614291, 0.4652199528897722, 0.8406911777098081], "isController": false}, {"data": ["loginAFlypass", 1, 0, 0.0, 1476.0, 1476, 1476, 1476.0, 1476.0, 1476.0, 1476.0, 0.6775067750677507, 1.3960344681571817, 0.2322313262195122], "isController": false}, {"data": ["consultarMovimientos", 7, 2, 28.571428571428573, 985.5714285714286, 255, 1420, 1163.0, 1420.0, 1420.0, 1420.0, 0.07650440446785722, 3.9339679043531004, 0.06239463567509672], "isController": false}, {"data": ["setPayment", 6, 3, 50.0, 532.8333333333334, 88, 1051, 578.0, 1051.0, 1051.0, 1051.0, 0.07897230704432978, 0.03794372565020533, 5.762356286853743], "isController": false}, {"data": ["registrarSalidaPagoAutomatico", 152, 79, 51.973684210526315, 1168.9934210526312, 353, 27337, 710.0, 2016.4, 2189.35, 15460.229999999974, 0.5084734422982999, 0.24480215532525573, 0.49837571274093945], "isController": false}, {"data": ["registrarSalidaPagoManual", 57, 57, 100.0, 603.4385964912284, 345, 3870, 388.0, 729.6000000000001, 3815.0, 3870.0, 0.7221771741333873, 0.32267095881689645, 0.6369902593186195], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400", 1, 0.22271714922049, 0.07656967840735068], "isController": false}, {"data": ["401", 258, 57.46102449888642, 19.754977029096477], "isController": false}, {"data": ["500", 2, 0.44543429844098, 0.15313935681470137], "isController": false}, {"data": ["403", 119, 26.50334075723831, 9.111791730474732], "isController": false}, {"data": ["409", 69, 15.367483296213809, 5.283307810107198], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1306, 449, "401", 258, "403", 119, "409", 69, "500", 2, "400", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["registrarEntradaEglobalt", 353, 136, "409", 69, "401", 46, "403", 21, "", "", "", ""], "isController": false}, {"data": ["loginEnAppAFlypass", 7, 2, "401", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["registrarEntradaSinSalida", 104, 69, "401", 48, "403", 21, "", "", "", "", "", ""], "isController": false}, {"data": ["consultarServiciosEnCurso", 7, 2, "500", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["getPlate", 612, 99, "401", 68, "403", 31, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["consultarMovimientos", 7, 2, "403", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["setPayment", 6, 3, "403", 2, "400", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["registrarSalidaPagoAutomatico", 152, 79, "401", 55, "403", 24, "", "", "", "", "", ""], "isController": false}, {"data": ["registrarSalidaPagoManual", 57, 57, "401", 39, "403", 18, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
