<?php

require('../utils/db_config.php');
require('../utils/request.php');

$conn = new mysqli($servername, $username, $password, $dbname);

$data = post_data();
$gap = $data["gap"];
$gapCount = $data["gapCount"];

$sql = sprintf("SELECT (FLOOR((timestamp + 28800)/%s)*%s  - 28800) AS timekey, name, count(name) as count
  FROM    event where timestamp > UNIX_TIMESTAMP(now())- %s * %s
GROUP BY timekey, name order by name desc, timekey desc", $gap, $gap, $gap, $gapCount);
$result = $conn->query($sql);
$res = array();
  while($row = $result->fetch_assoc()) {
    array_push($res, $row);
  }
  sendData($res);
// date_default_timezone_set('PRC');
// $version = $data["version"];
// $files = $data["files"];

// $result = $conn->query("select count(*) as count from application where version = '". $version ."'");
// $count = $result->fetch_assoc()["count"];
// date_default_timezone_set('PRC');
// $date = date("Y-m-d H:i:s");
// if($count == 1){
//   error("version existed");
// }else{
//   $result = $conn->query("select max(id) as id from application");
//   $last_version_id = $result->fetch_assoc()["id"];

//   $sql = sprintf("insert into application (version, date) values ('%s','%s')", $version, $date);
//   $conn->query($sql);
//   $insert_id = $conn->insert_id;
  
//   $result = $conn->query("select * from app_file where version_id =" .$last_version_id);
//   while($row = $result->fetch_assoc()) {
//     $sql = sprintf("insert into app_file (name, md5, size, version_id) values ('%s','%s',%s,%s)"
//     , $row["name"], $row["md5"], $row["size"], $insert_id);
//     echo $sql;
//     $conn->query($sql);
//   }
//   for($i = 0; $i<count($files); $i++){
//     $file_data = $files[$i];
//     $sql = sprintf("insert into app_file (name, md5, version_id, size) values ('%s','%s',%s,%s)"
//     , $file_data["name"], $file_data["md5"], $insert_id, $file_data["size"]);
//     echo $sql;
//     $conn->query($sql);
//   }
// }

$conn->close();

?>