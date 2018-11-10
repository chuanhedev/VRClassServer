function onSelectAllDevices(e) {
  $("input.select-item").each(function (index, item) {
    item.checked = e.checked;
  });
}

function updateLocations() {
  $.ajax({
    // type: "POST",
    url: "./location.php",
    success: res => {
      data = JSON.parse(res).data;
      let dropdown = document.getElementById('location');
      dropdown.innerHTML = "";
      for (let i = 0; i < data.length; i++) {
        selectionAddOption(dropdown, data[i].id, data[i].name);
      }
    }
  });
}

// getDataIfCachePromise('location').then((data) => {
//   let dropdown = document.getElementById('location');
//   for (let i = 0; i < data.length; i++) {
//     selectionAddOption(dropdown, data[i].id, data[i].name);
//   }
// });

let tbody = document.querySelector("#all-device");
updateDeviceTable();
updateLocations();

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
            <td >${data[i].location_name || ""}</td>
            <td ><input value="${data[i].device_name}"></td>
            <td >${data[i].login_time}</td>
        </tr>`;
      }
    },
    data: {
      showall: document.getElementById("checkbox-show-all-device").checked
    }
  });
}

function OnAddSchool() {
  let name = document.getElementById("text-new-school").value.trim();
  $.ajax({
    type: "POST",
    url: "./school_add.php",
    success: data => {
      updateLocations();
    },
    data: {
      name: name
    }
  });
}

function OnShowDevices(e) {
  updateDeviceTable();
}

function onDeleteDevices() {
  if (confirm('确定要删除这些设备么?')) {
    $.ajax({
      type: "POST",
      url: "./device_delete.php",
      success: data => {
        updateDeviceTable();
      },
      data: {
        data: JSON.stringify({
          data: getDeviceData()
        })
      }
    })
  } else {
    // Do nothing!
  }

}

function getDeviceData() {
  let data = []
  for (let i = 0; i < tbody.children.length; i++) {
    let child = tbody.children[i];
    let select = child.children[0].children[0].checked;
    let id = child.children[1].innerText.trim();
    let name = child.children[3].children[0].value;
    if (select) {
      data.push({
        id: id,
        name: name
      });
    }
  }
  return data;
}

function onUpdateDevices() {

  $.ajax({
    type: "POST",
    url: "./device_update.php",
    success: data => {
      updateDeviceTable();
    },
    data: {
      data: JSON.stringify({
        data: getDeviceData(),
        id: document.getElementById('location').value
      })
    }
  })
}