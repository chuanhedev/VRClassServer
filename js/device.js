function onSelectAllDevices(e) {
  $("input.select-item").each(function (index, item) {
    item.checked = e.checked;
  });
}


getDataIfCachePromise('location').then((data) => {
  let dropdown = document.getElementById('location');
  for (let i = 0; i < data.length; i++) {
    selectionAddOption(dropdown, data[i].id, data[i].name);
  }
});
let tbody = document.querySelector("#all-device");
updateDeviceTable();

function updateDeviceTable() {

  $.ajax({
    type: "POST",
    url: "./device.php",
    success: data => {
      data = JSON.parse(data).data;
      tbody.innerHTML = "";
      for (let i = 0; i < data.length; i++) {
        tbody.innerHTML += `<tr>
            <td class="active">
                <input type="checkbox" class="select-item checkbox" name="select-item" value="1000" />
            </td>
            <td >${data[i].id}</td>
            <td ><input value="${data[i].name}"></td>
            <td >${data[i].login_time}</td>
        </tr>`;
      }
    }
  });
}

function onUpdateDevices() {
  let data = []

  for (let i = 0; i < tbody.children.length; i++) {
    let child = tbody.children[i];
    let select = child.children[0].children[0].checked;
    let id = child.children[1].innerText;
    let name = child.children[2].children[0].value;
    if (select) {
      data.push({
        id: id,
        name: name
      });
    }
  }
  $.ajax({
    type: "POST",
    url: "./device_update.php",
    success: data => {
      updateDeviceTable();
    },
    data: {
      data: JSON.stringify({
        data: data,
        id: document.getElementById('location').value
      })
    }
  })
}