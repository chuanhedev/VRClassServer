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

let serverFiles = {};
let uploadFiles = {};

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
    console.log('dddddddd');
    // updateChart();
    // renderGraph();
})

