// ************************ Drag and drop ***************** //
let dropArea = document.getElementById("drop-area")

// Prevent default drag behaviors
;
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false)
    document.body.addEventListener(eventName, preventDefaults, false)
})

// Highlight drop area when item is dragged over it
;
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false)
})

;
['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false)
})

// Handle dropped files
dropArea.addEventListener('drop', handleDrop, false)

function preventDefaults(e) {
    e.preventDefault()
    e.stopPropagation()
}

function highlight(e) {
    dropArea.classList.add('highlight')
}

function unhighlight(e) {
    dropArea.classList.remove('active')
}

function handleDrop(e) {
    var dt = e.dataTransfer
    var files = dt.files

    handleFiles(files)
}

let uploadProgress = []
let progressBar = document.getElementById('progress-bar')

function initializeProgress(numFiles) {
    progressBar.value = 0
    uploadProgress = []

    for (let i = numFiles; i > 0; i--) {
        uploadProgress.push(0)
    }
}

function updateProgress(fileNumber, percent) {
    uploadProgress[fileNumber] = percent
    let total = uploadProgress.reduce((tot, curr) => tot + curr, 0) / uploadProgress.length
    console.debug('update', fileNumber, percent, total)
    progressBar.value = total
}

function handleFiles(files) {
    files = [...files]
    // initializeProgress(files.length)
    renderTable(files);
    // files.forEach(uploadFile)
    // files.forEach(previewFile)
}

function previewFile(file) {
    let reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = function () {
        let img = document.createElement('img')
        img.src = reader.result
        document.getElementById('gallery').appendChild(img)
    }
}

function renderTable(files) {
    console.log(files);
    let tableContent = document.querySelector("#filesUploaded tbody");
    tableContent.innerHTML = "";
    let rowIndex = 1;
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        let key = "|" + file.name;
        // console.log(typeof(file));
        // console.log(md5.file(files[i]));
        uploadFiles[key] = {
            file: file
        };
        let reader = new FileReader();
        reader.onload = function () {
            var arrayBuffer = this.result,
                array = new Uint8Array(arrayBuffer);
            // binaryString = String.fromCharCode.apply(null, array);
            let file_md5 = md5(array);
            if (serverFiles[key] && serverFiles[key].md5 == file_md5)
                delete uploadFiles[key]
            else
                uploadFiles[key].md5 = file_md5;
            let row = document.createElement("tr");
            row.innerHTML =
                `<th>${rowIndex++}</th><td>${file.name}</td><td>${(file.size/1000).toFixed(2)}kb</td><td>${file_md5}</td>`;
            tableContent.appendChild(row);
        }
        reader.readAsArrayBuffer(files[i]);
    }
}


// #	文件名	大小	MD5
// 0	2.jpg	48517.08kb	d0fc35af50238da5ef20b5b511328a60
// 1	3.jpg	47221.85kb	f523c41e133f83f5d3d082deb94bccad
// 2	1.jpg	49291.56kb	ee224e07441a6b6f27d951d9bbfb2745

function uploadFile(file, i) {
    var url = './upload.php'
    var xhr = new XMLHttpRequest()
    var formData = new FormData()
    xhr.open('POST', url, true)
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')

    // Update progress (can be used to show progress indicator)
    xhr.upload.addEventListener("progress", function (e) {
        updateProgress(i, (e.loaded * 100.0 / e.total) || 100)
    })

    xhr.addEventListener('readystatechange', function (e) {
        if (xhr.readyState == 4 && xhr.status == 200) {
            updateProgress(i, 100); // <- Add this
            console.log(xhr);
            console.log(this.responseText);
        } else if (xhr.readyState == 4 && xhr.status != 200) {
            // Error. Inform the user
        }
    })
    formData.append('fileToUpload', file)
    xhr.send(formData)
}

function onUploadFiles() {
    let version = document.getElementById("publishVersion").value;
    if (!version) {
        console.log('version is empty');
        return;
    }
    if (Object.keys(uploadFiles).length == 0) {
        console.log('nothing to upload');
        return;
    }
    console.log(uploadFiles);
    let upload_status = {};
    for (let key in uploadFiles) {
        let file = uploadFiles[key].file;
        console.log(file);
        var formData = new FormData();
        formData.append('fileToUpload', file)
        $.ajax({
            type: "POST",
            url: "./upload.php",
            processData: false,
            contentType: false,
            success: function (data) {
                console.log(data);
                if (data == "1") {
                    upload_status[key] = true;
                    //check if all uploaded
                    for (let key in uploadFiles) {
                        if (!upload_status[key]) {
                            return;
                        }
                    }
                    onUploadFilesDone();
                }
            },
            data: formData
        })
    }
}

function onUploadFilesDone() {
    let data = {
        version: document.getElementById("publishVersion").value,
        files: []
    };
    for (let key in uploadFiles) {
        let file = uploadFiles[key].file;
        data.files.push({
            name: file.name,
            size: (file.size / 1000).toFixed(2),
            md5: uploadFiles[key].md5,
        });
    }
    console.log(data);
    $.ajax({
        type: "POST",
        url: "./upload_done.php",
        success: function (data) {
            console.log(data);
        },
        data: {
            data: JSON.stringify(data)
        }
    })
}

// function graphStyleRadioClick(e) {
//     console.log('clicked', e);
// }
function renderGraph() {
    let timeGap = document.getElementById("ddEventTimeGap").value;
    let gapCount = document.getElementById("ddEventTotalGap").value;
    let gap;
    if (timeGap == '1h')
        gap = 3600;
    else if (timeGap == '1d')
        gap = 24 * 3600;
    $.ajax({
        type: "POST",
        url: "./event.php",
        success: function (data) {
            console.log('render ', data);
            renderGraph2(JSON.parse(data));
        },
        data: {
            data: JSON.stringify({
                gap: gap,
                gapCount: gapCount,
                group: []
            })
        }
    })
}

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
        dataByName[value][d.timekey] = d.count;
        dataByTime[d.timekey][value] = d.count;
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



let serverFiles = {};
let uploadFiles = {};

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

$(function () {
    $.ajax({
        url: "../version.php",
        success: function (data) {
            console.log(data);
            document.getElementById("currentVersion").innerText = "当前版本号：" + data.version;
            let table = document.querySelector("#filesServer tbody");
            console.log(table);
            let rowIndex = 0;
            for (let i = 0; i < data.files.length; i++) {
                let file = data.files[i];
                let row = document.createElement("tr");
                row.innerHTML =
                    `<th>${rowIndex++}</th><td>${file.name}</td><td>${file.size}</td><td>${file.md5}</td>`;
                table.appendChild(row);
                serverFiles[file.path + "|" + file.name] = file;
            }
        },
        dataType: "json"
    });
    initFilterComponent(queryData);
    // updateChart();
    renderGraph();
})

