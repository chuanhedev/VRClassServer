<?php

require('utils/db_config.php');

$conn = new mysqli($servername, $username, $password, $dbname);

$result = $conn->query("select * from application order by id desc limit 1");
$result_row = $result->fetch_assoc();
if(empty($result_row)){
  //初始化
  exit("{}");
}
$to_version_id = $result_row["id"];
$to_version = $result_row["version"];

$sql = sprintf("select  * from app_file where version_id = %s", $to_version_id);
$result = $conn->query($sql);
$arr = array();
while($row = $result->fetch_assoc()) {
  array_push($arr, $row);
}

$result_row["files"] = $arr;
echo json_encode($result_row, JSON_UNESCAPED_SLASHES);
$conn->close();

?>