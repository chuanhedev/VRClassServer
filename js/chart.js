
let divFilters = document.getElementById("divFilters");
let filterList = [];
let queryData = {
    gap: '1d',
    gapCount: '50',
    metric: [{
        property: 'NAME0',
        value: 'count'
    }],
    where: [],
    group: ['NAME'],
};
let defaultProperties = [{
        colName: 'USER',
        name: '学校'
    },
    {
        colName: 'NAME',
        name: '事件名'
    },
]

function initFilterComponent(data) {
    for (let i = 0; i < data.metric.length; i++) {
        let metric = new MetricComponent(data.metric[i]);
        divFilters.appendChild(metric.div);
    }
    for (let i = 0; i < data.group.length; i++) {
        let group = new GroupComponent(data.group[i]);
        divFilters.appendChild(group.div);
    }
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
    constructor(d) {
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
            updateChart();
        });
        $(this.delete).click(() => {
            filterList.splice(filterList.indexOf(this), 1);
            updateFilterList();
            $(this.div).remove();
        });
        addPropertiesToList(this.property, () => {
            if (d) this.property.value = d;
        });
        filterList.push(this);
        updateFilterList();
    }

    getData() {
        return this.property.value;
    }
}

class WhereComponent {
    constructor() {
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
        $(this.property).change(() => {
            console.log(this.property.value);
            let value = this.property.value;
            if (value) {
                showElement(this.value);
                getDataIfCache('event_property', {
                    value: value
                }, (data) => {
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
        });
        addPropertiesToList(this.property);
        filterList.push(this);
        updateFilterList();
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
        $(this.delete).click(() => $(this.div).remove());
        $(this.property).change(() => this.onPropertyChange());
        addAllPropertiesToList(this.property, () => {
            if (data) {
                if (data.property) {
                    console.log(data);
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
            let type = this.property.value.substr(-1);
            selectionAddOption(this.value, 'count');
            if (type == '1') {
                selectionAddOption(this.value, 'avg');
                selectionAddOption(this.value, 'sum');
            }
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

function addAllPropertiesToList(div, cb) {
    getDataIfCache('event_all_property', undefined, (data) => {
        selectionAddOption(div, '');
        for (let i = 0; i < defaultProperties.length; i++) {
            selectionAddOption(div, defaultProperties[i].colName + '0', defaultProperties[i].name);
        }
        for (let i = 0; i < data.length; i++) {
            div.innerHTML += `<option class="dropdown-item" value='${data[i].result+data[i].type}'>${data[i].result}</option>`;
        }
        if (cb) cb(data);
    });
}

function addPropertiesToList(div, cb) {
    getDataIfCache('event_property', undefined, (data) => {
        selectionAddOption(div, '');
        for (let i = 0; i < defaultProperties.length; i++) {
            selectionAddOption(div, defaultProperties[i].colName, defaultProperties[i].name);
        }
        for (let i = 0; i < data.length; i++) {
            selectionAddOption(div, data[i]);
        }
        if (cb) cb(data);
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