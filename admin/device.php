<?php

require('../utils/db_config.php');
require('../utils/request.php');

$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset("utf8");
$showall = $_POST["showall"];
if($showall == "true")
    $where = "";
else
    $where = "where location_id is null";
$result = $conn->query("select device.id as id, device.name as device_name, location.name as location_name, login_time from device
    left join location on location.id = device.location_id
". $where. " order by login_time desc");

$res = array();
while($row = $result->fetch_assoc()) {
    array_push($res, $row);
}
send_data($res);
$conn->close();

?>