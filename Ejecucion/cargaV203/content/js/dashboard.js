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

    var data = {"OkPercent": 70.32890132960112, "KoPercent": 29.67109867039888};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5682295311406578, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.5168067226890757, 500, 1500, "registrarEntradaEglobalt"], "isController": false}, {"data": [0.5714285714285714, 500, 1500, "loginEnAppAFlypass"], "isController": false}, {"data": [0.013761467889908258, 500, 1500, "registrarEntradaSinSalida"], "isController": false}, {"data": [0.4166666666666667, 500, 1500, "consultarServiciosEnCurso"], "isController": false}, {"data": [0.8231534090909091, 500, 1500, "getPlate"], "isController": false}, {"data": [0.0, 500, 1500, "loginAFlypass"], "isController": false}, {"data": [0.16666666666666666, 500, 1500, "consultarMovimientos"], "isController": false}, {"data": [0.16666666666666666, 500, 1500, "setPayment"], "isController": false}, {"data": [0.23030303030303031, 500, 1500, "registrarSalidaPagoAutomatico"], "isController": false}, {"data": [0.0, 500, 1500, "registrarSalidaPagoManual"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1429, 424, 29.67109867039888, 565.244926522043, 82, 26255, 399.0, 871.0, 1327.5, 2087.2000000000016, 2.371831472162101, 1.717558845570368, 2.8450385111404706], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["registrarEntradaEglobalt", 357, 74, 20.72829131652661, 591.0308123249298, 334, 4148, 551.0, 813.2, 888.3, 1493.0200000000004, 0.6619262610436927, 0.3256252491494155, 0.6759246195546367], "isController": false}, {"data": ["loginEnAppAFlypass", 7, 2, 28.571428571428573, 537.8571428571428, 377, 1046, 492.0, 1046.0, 1046.0, 1046.0, 0.07231927928672528, 0.11988978735549058, 0.036986952827167255], "isController": false}, {"data": ["registrarEntradaSinSalida", 109, 80, 73.39449541284404, 1015.3669724770645, 330, 25130, 392.0, 2124.0, 2304.0, 22885.000000000127, 0.5474663358429726, 0.2546579763710516, 0.5025177487079292], "isController": false}, {"data": ["consultarServiciosEnCurso", 6, 2, 33.333333333333336, 493.00000000000006, 82, 933, 492.0, 933.0, 933.0, 933.0, 0.07409511342726947, 0.9030824339009842, 0.05766973183743532], "isController": false}, {"data": ["getPlate", 704, 114, 16.193181818181817, 396.5127840909088, 328, 799, 388.0, 442.0, 476.0, 583.1000000000008, 1.1747195023461017, 0.5349932712267141, 0.9671422043636491], "isController": false}, {"data": ["loginAFlypass", 1, 0, 0.0, 1548.0, 1548, 1548, 1548.0, 1548.0, 1548.0, 1548.0, 0.6459948320413437, 1.3361494670542635, 0.2214298691860465], "isController": false}, {"data": ["consultarMovimientos", 6, 2, 33.333333333333336, 1097.8333333333333, 277, 1797, 1303.0, 1797.0, 1797.0, 1797.0, 0.07242178447276941, 3.477801591468714, 0.05728676310834299], "isController": false}, {"data": ["setPayment", 6, 4, 66.66666666666667, 493.8333333333333, 83, 1193, 328.0, 1193.0, 1193.0, 1193.0, 0.07353842382644932, 0.033896617232503985, 5.3660068635862235], "isController": false}, {"data": ["registrarSalidaPagoAutomatico", 165, 78, 47.27272727272727, 990.6909090909097, 335, 26255, 874.0, 1487.8, 1609.3999999999999, 10106.120000000083, 0.5529101504250706, 0.2680122000462434, 0.5438487855663643], "isController": false}, {"data": ["registrarSalidaPagoManual", 68, 68, 100.0, 376.94117647058835, 334, 619, 369.0, 407.20000000000005, 451.55, 619.0, 0.8554319931565441, 0.37980433565641825, 0.710173665274493], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Value in json path 'message' expected to match regexp 'Transacci&oacute;n procesada con exito', but it did not match: 'Transacci&oacute;n ya procesada'", 1, 0.2358490566037736, 0.06997900629811056], "isController": false}, {"data": ["400", 2, 0.4716981132075472, 0.13995801259622112], "isController": false}, {"data": ["401", 269, 63.443396226415096, 18.82435269419174], "isController": false}, {"data": ["500", 2, 0.4716981132075472, 0.13995801259622112], "isController": false}, {"data": ["403", 150, 35.37735849056604, 10.496850944716584], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1429, 424, "401", 269, "403", 150, "400", 2, "500", 2, "Value in json path 'message' expected to match regexp 'Transacci&oacute;n procesada con exito', but it did not match: 'Transacci&oacute;n ya procesada'", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["registrarEntradaEglobalt", 357, 74, "401", 49, "403", 25, "", "", "", "", "", ""], "isController": false}, {"data": ["loginEnAppAFlypass", 7, 2, "401", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["registrarEntradaSinSalida", 109, 80, "401", 52, "403", 28, "", "", "", "", "", ""], "isController": false}, {"data": ["consultarServiciosEnCurso", 6, 2, "500", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["getPlate", 704, 114, "401", 75, "403", 39, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["consultarMovimientos", 6, 2, "403", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["setPayment", 6, 4, "400", 2, "403", 2, "", "", "", "", "", ""], "isController": false}, {"data": ["registrarSalidaPagoAutomatico", 165, 78, "401", 51, "403", 26, "Value in json path 'message' expected to match regexp 'Transacci&oacute;n procesada con exito', but it did not match: 'Transacci&oacute;n ya procesada'", 1, "", "", "", ""], "isController": false}, {"data": ["registrarSalidaPagoManual", 68, 68, "401", 40, "403", 28, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
