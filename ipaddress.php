<?php

require('utils/db_config.php');
require('utils/request.php');

$conn = new mysqli($servername, $username, $password, $dbname);
$data = post_data();
date_default_timezone_set('PRC');
$date = date("Y-m-d H:i:s");
$device_id = $data["id"];
$sql = sprintf("select location_id from device where id = '%s'", $device_id);
$result = $conn->query($sql);
if($result->num_rows == 0){
  $conn->query(sprintf("insert into device (id, login_time) values ('%s','%s')", $device_id, $date));
}else{
  $conn->query(sprintf("update device set login_time='%s' where id = %s", $date, $device_id));
  $location_id = $result->fetch_assoc()["location_id"];
  if(empty($location_id)){
    if(empty($data["ip"])){
      $result = $conn->query("select last_ip from settings");
      echo($result->fetch_assoc()["last_ip"]);
    }else{
      $conn->query(sprintf("update settings set last_ip='%s'", $data["ip"]));
    }
  }else{
    if(empty($data["ip"])){
      $result = $conn->query(sprintf("select ip from location where id = %s", $location_id));
      echo($result->fetch_assoc()["ip"]);
    }else{
      $conn->query(sprintf("update location set ip='%s' where id = %s", $data["ip"], $location_id));
    }
  }
}

$conn->close();

?>