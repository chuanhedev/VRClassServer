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
    e.preventDefault();
    e.stopPropagation();

    var items = e.dataTransfer.items;
    var files = e.dataTransfer.files;
    console.log(items, files);
    let p = Promise.resolve();
    let fileInfos = [];
    for (var i = 0; i < items.length; ++i) {
        let item = items[i];
        // Skip this one if we didn't get a file.
        if (item.kind != 'file') {
            continue;
        }
        let entry = item.webkitGetAsEntry();
        p = p.then(() => readEntry(entry, fileInfos));

        // console.log(item, entry);
        // if (entry.isDirectory) {
        //     console.log('start');
        //     // entry.createReader().readEntries((entries) => {
        //     //     console.log(entries);
        //     // });
        //     readEntry(entry, []).then(fileInfos => {
        //         console.log('ssss')
        //         console.log(fileInfos);
        //         renderTable(fileInfos);
        //     });
        //     console.log('end');
        // } else {
        //     p = p.then()
        // }
    }
    p.then(f => {
        console.log('ssss')
        console.log(fileInfos);
        renderTable(fileInfos);
    });
}

// function handleDrop(e) {
//     var dt = e.dataTransfer
//     var files = dt.files
//     console.log(dt);
//     handleFiles(files)
// }

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
    // tableContent.innerHTML = "";
    let rowIndex = tableContent.children.length + 1;
    // uploadFiles = {};
    for (let i = 0; i < files.length; i++) {
        let file = files[i].file;
        let filename = file.name;
        let fullpath = files[i].path;
        let path = fullpath.substr(1, fullpath.indexOf(filename) - 1);
        let key = fullpath.substr(1);
        uploadFiles[key] = {
            file: file,
            name: filename,
            path: path
        };
        console.log(JSON.stringify(uploadFiles));
        let reader = new FileReader();
        reader.onload = function () {
            var arrayBuffer = this.result,
                array = new Uint8Array(arrayBuffer);
            // binaryString = String.fromCharCode.apply(null, array);
            let file_md5 = md5(array);
            // console.log(key, JSON.stringify(serverFiles[key]), file_md5);
            if (serverFiles[key] && serverFiles[key].md5 == file_md5) {
                delete uploadFiles[key];
            } else {
                uploadFiles[key].md5 = file_md5;
                let row = document.createElement("tr");
                row.innerHTML =
                    `<th>${rowIndex++}</th><td>${filename}</td><td>${path}</td><td>${(file.size/1000).toFixed(2)}kb</td><td>${file_md5}</td>`;
                tableContent.appendChild(row);
            }
        }
        reader.readAsArrayBuffer(file);
    }
}


// #	文件名	大小	MD5
// 0	2.jpg	48517.08kb	d0fc35af50238da5ef20b5b511328a60
// 1	3.jpg	47221.85kb	f523c41e133f83f5d3d082deb94bccad
// 2	1.jpg	49291.56kb	ee224e07441a6b6f27d951d9bbfb2745

// function uploadFile(file, i) {
//     var url = './upload.php'
//     var xhr = new XMLHttpRequest()
//     var formData = new FormData()
//     xhr.open('POST', url, true)
//     xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')

//     // Update progress (can be used to show progress indicator)
//     xhr.upload.addEventListener("progress", function (e) {
//         updateProgress(i, (e.loaded * 100.0 / e.total) || 100)
//     })

//     xhr.addEventListener('readystatechange', function (e) {
//         if (xhr.readyState == 4 && xhr.status == 200) {
//             updateProgress(i, 100); // <- Add this
//             console.log(xhr);
//             console.log(this.responseText);
//         } else if (xhr.readyState == 4 && xhr.status != 200) {
//             // Error. Inform the user
//         }
//     })
//     formData.append('fileToUpload', file)
//     xhr.send(formData)
// }

function onClearFiles(){
    let tableContent = document.querySelector("#filesUploaded tbody");
    tableContent.innerHTML = "";
    uploadFiles = {};

}

function onUploadFiles() {
    let version = document.getElementById("publishVersion").value;
    if (!version) {
        console.log('version is empty');
        return;
    }
    if (Object.keys(uploadFiles).length == 0) {
        handlerError('nothing to upload');
        return;
    }
    $('#exampleModal').modal('show');
    let promise = Promise.resolve();
    $('#btn-progress-done').prop('disabled', true);
    console.log(uploadFiles);
    let numFiles = Object.keys(uploadFiles).length;
    let fileIdx = 1;
    for (let key in uploadFiles) {
        promise = promise.then(() => new Promise((resolve, reject) => {
            let file = uploadFiles[key].file;
            let path = uploadFiles[key].path;
            $("#upload-file-info").text(file.name + ` (${fileIdx++}/${numFiles})`);
            console.log(file);
            var formData = new FormData();
            formData.append('fileToUpload', file);
            formData.append('path', path);
            $.ajax({
                xhr: function () {
                    var xhr = new window.XMLHttpRequest();
                    //Upload progress
                    xhr.upload.addEventListener("progress", function (evt) {
                        // console.log(evt);
                        if (evt.lengthComputable) {
                            var percentComplete = evt.loaded / evt.total;
                            //Do something with upload progress
                            $('#progressbar').css("width", (percentComplete * 100) + "%");
                            console.log(percentComplete);
                        }
                    }, false);
                    return xhr;
                },
                type: "POST",
                url: "./upload.php",
                processData: false,
                contentType: false,
                success: function (data) {
                    console.log(data);
                    if (data.err) {
                        reject(data.err);
                    } else {
                        resolve();
                    }
                },
                data: formData,
                dataType: "json"
            })
        }));
    }
    promise.then(() => {
        console.log('uploads, done');
        $('#btn-progress-done').prop('disabled', false);
        onUploadFilesDone();
    }).catch(err => {
        handlerError(err);
    });
}

function onUploadFilesDone() {
    let data = {
        version: document.getElementById("publishVersion").value,
        update_teacher: document.getElementById("checkbox-update-teacher").checked,
        update_student: document.getElementById("checkbox-update-student").checked,
        update_server: document.getElementById("checkbox-update-server").checked,
        files: []
    };
    for (let key in uploadFiles) {
        let file = uploadFiles[key].file;
        data.files.push({
            name: file.name,
            path: uploadFiles[key].path,
            size: (file.size / 1000).toFixed(2),
            md5: uploadFiles[key].md5,
        });
    }
    console.log(data);
    $.ajax({
        type: "POST",
        url: "./upload_done.php",
        success: function (data) {
            initVersionPanel();
            handlerError(data.err);
        },
        data: {
            data: JSON.stringify(data)
        },
        dataType: "json"
    })
}

// function graphStyleRadioClick(e) {
//     console.log('clicked', e);
// }

let serverFiles;
let uploadFiles;

function initVersionPanel() {
    serverFiles = {};
    $.ajax({
        url: "../version_last.php",
        success: function (data) {
            console.log(data);
            if (!data.version) {
                document.getElementById("publishVersion").value = "1.0.0";
                document.getElementById("checkbox-update-teacher").checked = true;
                document.getElementById("checkbox-update-student").checked = true;
                document.getElementById("checkbox-update-server").checked = true;
                return;
            }
            let update = '';
            if (data.update_server == "1")
                update += ",更新服务器";
            if (data.update_teacher == "1")
                update += ",更新教师端";
            if (data.update_student == "1")
                update += ",更新学生端";
            if (update.length > 0) {
                update = ' <h6>(' + update.substr(1) + ')</h6>';
            }
            document.getElementById("currentVersion").innerHTML = "当前版本号：" + data.version + update;

            let vArr = data.version.split(".");
            vArr[vArr.length - 1] = parseInt(vArr[vArr.length - 1]) + 1;
            document.getElementById("publishVersion").value = vArr.join(".");
            let table = document.querySelector("#filesServer tbody");
            table.innerHTML = "";
            let rowIndex = 0;
            for (let i = 0; i < data.files.length; i++) {
                let file = data.files[i];
                let row = document.createElement("tr");
                row.innerHTML =
                    `<th>${rowIndex++}</th><td>${file.name}</td><td>${file.path}</td><td>${file.size}</td><td>${file.md5}</td>`;
                table.appendChild(row);
                serverFiles[file.path + file.name] = file;
            }
        },
        dataType: "json"
    });
    onClearFiles();
}

function handlerError(str) {
    if (str)
        alert(str);
}

$(function () {
    initVersionPanel();
    initFilterComponent(queryData);
    // updateChart();
    // renderGraph();
})