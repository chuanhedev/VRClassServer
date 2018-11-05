<?php

require('utils/db_config.php');
require('utils/request.php');

$conn = new mysqli($servername, $username, $password, $dbname);
$data = post_data();
date_default_timezone_set('PRC');
$event_name = $data["event"];
$device_id = $data["device"];
  // $date = new DateTime();
$date = date("Y-m-d H:i:s");
$sql = sprintf("insert into event (name, time, timestamp, device_id) values ('%s', '%s', %s, '%s')", $event_name, $date, time($date), $device_id);
$conn->query($sql);
$event_id = $conn->insert_id;
echo $event_id;
if(isset($data["measurements"])){
  echo "measurements";
  $measurements = $data["measurements"];
  foreach ($measurements as $k => $v) {
    $sql = sprintf("insert into event_data (event_id, property, metric) values (%s, '%s', %s)"
    , $event_id, $k, $v);
    $conn->query($sql);
  }
}
if(isset($data["properties"])){
  echo "properties";
  $properties = $data["properties"];
  foreach ($properties as $k => $v) {
    $sql = sprintf("insert into event_data (event_id, property, value) values (%s, '%s', '%s')"
    , $event_id, $k, $v);
    $conn->query($sql);
  }
}
// // $from_version = '1.0.0';
// // $to_version_id = 2;

// //table1 minus table2
// $sql = sprintf("select t1.* from app_file as t1
// left join
// (select * from app_file where version in
// (select id from application where version = '%s')) as t2
// on t1.path = t2.path and t1.name = t2.name and t1.md5 = t2.md5
// where t1.version = %s and t2.name is null",
//   $from_version, $to_version_id
// );
// $result = $conn->query($sql);
// // $to_version = $result->fetch_assoc()["version"];
// $arr = array();
// while($row = $result->fetch_assoc()) {
//   array_push($arr, $row);
// }
echo $event_name;
$conn->close();

?>