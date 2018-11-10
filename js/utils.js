let cache = {};

function hideElement(div) {
    $(div).hide();
}

function showElement(div) {
    $(div).show();
}

function isElementVisible(div) {
    return $(div).css('display') != 'none';
}

function selectionAddOption(div, value, text) {
    if (text == undefined) text = value;
    div.innerHTML += `<option class="dropdown-item" value='${value}'>${text}</option>`;
}

function selectionClear(div) {
    div.innerHTML = "";
}

function getDataIfCache(api, data, cb) {
    let key = api + (data ? JSON.stringify(data) : "");
    if (cache[key]) {
        console.log("get data from cache");
        if (cb)
            cb(cache[key]);
    } else {
        $.ajax({
            url: api + ".php",
            data: data,
            success: function (data2) {
                let d = JSON.parse(data2).data;
                cache[key] = d;
                if (cb)
                    cb(d);
            }
        })
    }
}

function getDataIfCachePromise(api, data) {
    let key = api + (data ? JSON.stringify(data) : "");
    console.log('getDataIfCachePromise', key);
    if (cache[key]) {
        return Promise.resolve(cache[key]);
    } else {
        return new Promise(resolve => {
            $.ajax({
                url: api + ".php",
                data: data,
                success: function (data2) {
                    let d = JSON.parse(data2).data;
                    cache[key] = d;
                    resolve(d);
                }
            })
        })
    }
}

function createElementByString(str) {
    var wrapper = document.createElement('div');
    wrapper.innerHTML = str;
    return wrapper.firstChild;
}

function readEntry(entry, files) {
    console.log('reading...', entry.fullPath);
    console.log(entry);
    if (entry.isDirectory) {
        return new Promise(resolve => {
            let p = Promise.resolve();
            entry.createReader().readEntries((entries) => {
                for (let i = 0; i < entries.length; i++) {
                    let entry2 = entries[i];
                    // if (!entry2.isDirectory) {
                    //     files.push({
                    //         name: entry2.name,
                    //         path: entry2.fullPath
                    //     });
                    // }
                    p = p.then(() => readEntry(entry2, files));
                }
                p.then(() => resolve(files));
            });
        })
    } else {
        //for mac
        return new Promise(resolve => {
            if (entry.name != ".DS_Store") {
                entry.file(file => {
                    files.push({
                        name: entry.name,
                        path: entry.fullPath,
                        file: file
                    });
                    resolve(files);
                })
            } else
                resolve(files);
        });
    }
}