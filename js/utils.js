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
    let key = api + data ? JSON.stringify(data) : "";
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

function createElementByString(str) {
    var wrapper = document.createElement('div');
    wrapper.innerHTML = str;
    return wrapper.firstChild;
}