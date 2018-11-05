let divFilters = document.getElementById("divFilters");
let filterList = [];
let queryData = {
    gap: '1d',
    gapCount: '50',
    metric: [],
    // where: [{
    //     property: 'Level',
    //     value: '1'
    // }],
    where: [],
    group: ['EVENT.NAME'],
};
let defaultProperties = [{
        colName: 'LOCATION.NAME',
        name: '学校'
    },
    {
        colName: 'DEVICE.NAME',
        name: '设备名'
    },
    {
        colName: 'EVENT.NAME',
        name: '事件名'
    },
]

// function renderGraph() {
//     let timeGap = document.getElementById("ddEventTimeGap").value;
//     let gapCount = document.getElementById("ddEventTotalGap").value;
//     let gap;
//     if (timeGap == '1h')
//         gap = 3600;
//     else if (timeGap == '1d')
//         gap = 24 * 3600;
//     $.ajax({
//         type: "POST",
//         url: "./event.php",
//         success: function (data) {
//             console.log('render ', data);
//             renderGraph2(JSON.parse(data));
//         },
//         data: {
//             data: JSON.stringify({
//                 gap: gap,
//                 gapCount: gapCount,
//                 group: []
//             })
//         }
//     })
// }

function getTimeGap(str) {
    let gap;
    if (str == '1h')
        gap = 3600;
    else if (str == '1d')
        gap = 24 * 3600;
    return gap;
}

function renderGraph2(data) {
    let group = data.group;
    let aggregate = data.ag;
    data = data.data;
    let timeGap = document.getElementById("ddEventTimeGap").value;
    let totalGap = parseInt(document.getElementById("ddEventTotalGap").value);
    let graphStyleLine = document.getElementById("graphStyleLine").checked;
    let graphStyleBar = document.getElementById("graphStyleBar").checked;
    let type = graphStyleLine ? 'line' : 'bar';
    let stacked = graphStyleLine ? false : true;
    var chartContainer = document.getElementById("myChartContainer");
    chartContainer.innerHTML = "&nbsp;";
    chartContainer.innerHTML = `<canvas id="myChart" width="400" height="200"></canvas>`;
    var ctx = document.getElementById("myChart").getContext('2d');
    let now = new Date();
    now.setMilliseconds(0);
    now.setSeconds(0);
    now.setMinutes(0);
    let xLabels = [];
    if (timeGap.substr(-1) == 'd') {
        now.setHours(0);
    }
    let gap = getTimeGap(timeGap) * 1000;
    let numLabels = 10;
    let dataByName = {};
    let dataByTime = {};
    for (let i = 0; i < data.length; i++) {
        let d = data[i];
        let value = d[group];
        if (!dataByName[value])
            dataByName[value] = {
                data: []
            };
        if (!dataByTime[d.timekey])
            dataByTime[d.timekey] = {};
        dataByName[value][d.timekey] = d[aggregate];
        dataByTime[d.timekey][value] = d[aggregate];
    }
    for (let i = 0; i < totalGap; i++) {
        let t = new Date(now.getTime() - i * gap);
        let timeKey = (t.getTime() / 1000).toString();
        if (i % (Math.round(totalGap / numLabels)) == 0) {
            let tStr = (t.getMonth() + 1) + '-' + t.getDate();
            if (timeGap.substr(-1) == 'h')
                tStr += ' ' + t.getHours() + 'h';
            xLabels.unshift(tStr);
        } else {
            xLabels.unshift("");
        }
        for (let k in dataByName) {
            if (dataByTime[timeKey] && dataByTime[timeKey][k])
                dataByName[k].data.unshift(dataByTime[timeKey][k]);
            else
                dataByName[k].data.unshift(0);
        }
    }
    let datasets = [];
    let idx = 0;
    for (let k in dataByName) {
        datasets.push({
            data: dataByName[k].data,
            fill: false,
            label: k,
            backgroundColor: Chart.helpers.color(getChartColor(idx)).alpha(0.5).rgbString(),
            borderColor: getChartColor(idx)
        });
        idx++;
    }

    //dropdown 
    // let ddEventName = document.getElementById("ddEventName");
    // ddEventName.innerHTML = `<option class="dropdown-item" value=''></option>`;
    // for (let k in dataByName) {
    //     ddEventName.innerHTML += `<option class="dropdown-item" value='${k}'>${k}</option>`;
    // }

    var myChart = new Chart(ctx, {
        type: type,
        data: {
            datasets: datasets,
            // datasets: [{
            //     data: [0, 45, 25, 20, 10, 2],
            //     fill: false,
            //     label: "data1",
            //     backgroundColor: Chart.helpers.color(getChartColor()).alpha(0.5).rgbString(),
            //     borderColor: getChartColor()
            // }, {
            //     data: [20, 35, 15, 40, 15, -5],
            //     fill: false,
            //     label: "data2",
            //     backgroundColor: Chart.helpers.color(getChartColor(1)).alpha(0.5).rgbString(),
            //     borderColor: getChartColor(1)
            // }],
            labels: xLabels
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    },
                    stacked: stacked
                }],
                xAxes: [{
                    stacked: stacked
                }]
            },
            elements: {
                line: {
                    tension: 0, // disables bezier curves
                }
            },
            animation: {
                duration: 0, // general animation time
            },
            hover: {
                animationDuration: 0, // duration of animations when hovering an item
            },
            responsiveAnimationDuration: 0, // animation duration after a resize
        }
    });
}



function getChartColor(idx = 0) {
    // console.log(window.chartColors);
    var colorNames = Object.keys(window.chartColors);
    var colorName = colorNames[idx % colorNames.length];
    var dsColor = window.chartColors[colorName];
    // console.log(colorNames, colorName, dsColor);
    return dsColor;
}

window.chartColors = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
};

function initFilterComponent(data) {
    let promises = [];
    for (let i = 0; i < data.metric.length; i++) {
        let metric = new MetricComponent(data.metric[i]);
        divFilters.appendChild(metric.div);
        promises.push(metric.init());
    }
    for (let i = 0; i < data.where.length; i++) {
        let where = new WhereComponent(data.where[i]);
        divFilters.appendChild(where.div);
        promises.push(where.init());
    }
    for (let i = 0; i < data.group.length; i++) {
        let group = new GroupComponent(data.group[i]);
        divFilters.appendChild(group.div);
        promises.push(group.init());
    }
    Promise.all(promises).then(() => {
        console.log("haaa");
        updateChart();
    })
}

function updateFilterList() {
    let timeGap = document.getElementById("ddEventTimeGap").value;
    let gapCount = document.getElementById("ddEventTotalGap").value;
    let gap;
    if (timeGap == '1h')
        gap = 3600;
    else if (timeGap == '1d')
        gap = 24 * 3600;
    queryData = {
        gap: gap,
        gapCount: gapCount,
        metric: [],
        where: [],
        group: [],
    };
    for (let i = 0; i < filterList.length; i++) {
        let filter = filterList[i];
        queryData[filter.type].push(filter.getData());
    }
    console.log(queryData);
}

function updateChart() {
    updateFilterList();
    $.ajax({
        type: "POST",
        url: "./event.php",
        success: function (data) {
            console.log('render ', data);
            renderGraph2(JSON.parse(data));
        },
        data: {
            data: JSON.stringify(queryData)
        }
    })
}

class GroupComponent {
    constructor(data) {
        this.type = 'group'
        this.div = createElementByString(`<div class="border border-primary rounded p-1 m-1">
            GROUP BY
            <select class='dropdown'">
            </select>
            <button type="button" class="close" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>`);
        this.property = this.div.children[0];
        this.delete = this.div.children[1];
        $(this.property).change(() => {
            // updateChart();
        });
        $(this.delete).click(() => {
            filterList.splice(filterList.indexOf(this), 1);
            updateFilterList();
            $(this.div).remove();
        });
        filterList.push(this);
        this.data = data;
        if (!data) this.init();
        // updateFilterList();
    }

    init() {
        return addPropertiesToList(this.property).then(() => {
            console.log("GroupComponent inited");
            if (this.data) this.property.value = this.data;
        });
    }

    getData() {
        return this.property.value;
    }
}

class WhereComponent {
    constructor(data) {
        this.type = 'where';
        this.div = createElementByString(`<div class="border border-primary rounded p-1 m-1">
            WHERE
            <select class='dropdown'">
            </select>
            <select class='dropdown'">
            </select>
            <button type="button" class="close" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>`);
        this.property = this.div.children[0];
        this.value = this.div.children[1];
        this.delete = this.div.children[2];
        hideElement(this.value);
        $(this.delete).click(() => {
            filterList.splice(filterList.indexOf(this), 1);
            updateFilterList();
            $(this.div).remove();
        });
        $(this.property).change(() => this.onPropertyChange());
        $(this.value).change(() => {
            // updateChart();
        });
        // addPropertiesToList(this.property);
        filterList.push(this);
        this.data = data;
        if (!data) this.init();
        // updateFilterList();
    }

    init() {
        return addPropertiesToList(this.property).then(() => {
            console.log("WhereComponent inited");
            if (this.data) this.property.value = this.data;
            this.onPropertyChange();
            this.value.value = data.value;
        });
    }

    onPropertyChange() {
        let value = this.property.value;
        if (value) {
            showElement(this.value);
            return getDataIfCachePromise('event_property', {
                value: value
            }).then(data => {
                console.log(data);
                selectionClear(this.value);
                selectionAddOption(this.value, '');
                for (let i = 0; i < data.length; i++) {
                    selectionAddOption(this.value, data[i]);
                }
            });
        } else {
            hideElement(this.value);
        }
        return Promise.resolve();
    }

    init() {
        return addPropertiesToList(this.property).then(() => {
            let data = this.data;
            if (data) {
                if (data.property) {
                    this.property.value = data.property;
                    return this.onPropertyChange().then(()=>{
                        this.value.value = data.value;
                    });
                }
            }
        });
    }

    getData() {
        let p = this.property.value;
        let v = "";
        if (p) {
            v = this.value.value;
        }
        return {
            property: p,
            value: v
        }
    }
}

class MetricComponent {
    constructor(data) {
        this.type = 'metric';
        this.div = createElementByString(`<div class="border border-primary rounded p-1 m-1">
            <select class='dropdown'">
            </select>
            <select class='dropdown'">
            </select>
            <button type="button" class="close" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>`);
        this.property = this.div.children[0];
        this.value = this.div.children[1];
        this.delete = this.div.children[2];
        hideElement(this.value);
        $(this.delete).click(() => {
            filterList.splice(filterList.indexOf(this), 1);
            updateFilterList();
            $(this.div).remove();
        });
        $(this.property).change(() => this.onPropertyChange());
        filterList.push(this);
        this.data = data;
        if (!data) this.init();
    }

    init() {
        return addMetricsToList(this.property).then(() => {
            let data = this.data;
            if (data) {
                if (data.property) {
                    this.property.value = data.property;
                    this.onPropertyChange();
                    this.value.value = data.value;
                }
            }
        });
    }

    onPropertyChange() {
        let value = this.property.value;
        if (value) {
            showElement(this.value);
            selectionClear(this.value);
            // let type = this.property.value.substr(-1);
            // selectionAddOption(this.value, 'count');
            // if (type == '1') {
            selectionAddOption(this.value, 'avg');
            selectionAddOption(this.value, 'sum');
            // }
        } else {
            hideElement(this.value);
        }
    }

    getData() {
        let p = this.property.value;
        let v = p ? this.value.value : "";
        return {
            property: p,
            value: v
        }
    }
}

function addMetricsToList(div) {
    return getDataIfCachePromise('event_metric').then(data => {
        selectionAddOption(div, '');
        for (let i = 0; i < data.length; i++) {
            selectionAddOption(div, data[i]);
        }
    });
}

function addPropertiesToList(div) {
    return getDataIfCachePromise('event_property').then((data) => {
        selectionAddOption(div, '');
        for (let i = 0; i < defaultProperties.length; i++) {
            selectionAddOption(div, defaultProperties[i].colName, defaultProperties[i].name);
        }
        for (let i = 0; i < data.length; i++) {
            selectionAddOption(div, data[i]);
        }
    });
}
//
function addMetric() {
    if (filterList.metric === undefined || filterList.metric.length == 0) {
        let metric = new MetricComponent();
        divFilters.appendChild(metric.div);
    }
}

function addWhere() {
    let where = new WhereComponent();
    divFilters.appendChild(where.div);
}

function addGroup() {
    if (filterList.group === undefined || filterList.group.length == 0) {
        let group = new GroupComponent();
        divFilters.appendChild(group.div);
    }
}