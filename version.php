<?php

require('utils/db_config.php');

$conn = new mysqli($servername, $username, $password, $dbname);
$from_version = "";
if(isset($_GET['version']))
  $from_version = $_GET['version'];
$from_version_id = getAppIdByVersion($from_version);

$result = $conn->query("select * from application order by id desc limit 1");
$result_row = $result->fetch_assoc();
$result_row["update"] = "1";
$to_version_id = $result_row["id"];
$to_version = $result_row["version"];
if($from_version == $to_version){
  $result_row["update"] = "0";
  echo json_encode($result_row, JSON_UNESCAPED_SLASHES);
  $conn->close();
  exit();
}

//table1 minus table2
$sql = sprintf("select t1.* from app_file as t1
left join
(select * from app_file where version_id = %s) as t2
on t1.path = t2.path and t1.name = t2.name and t1.md5 = t2.md5
where t1.version_id = %s and t2.name is null",
  $from_version_id, $to_version_id
);
// echo $sql;
$result = $conn->query($sql);
// $to_version = $result->fetch_assoc()["version"];
$arr = array();
while($row = $result->fetch_assoc()) {
  array_push($arr, $row);
}

$result2 = $conn->query(sprintf("select sum(update_server) as update_server, sum(update_teacher) as update_teacher, sum(update_student) as update_student
  from application where id > %s" , $from_version_id));
$result_row2 = $result2->fetch_assoc();

$result_row["files"] = $arr;
$result_row["update_server"] = $result_row2["update_server"];
$result_row["update_teacher"] = $result_row2["update_teacher"];
$result_row["update_student"] = $result_row2["update_student"];

if(isset($_GET['app_version']) && strval($result_row2["update_student"])>0){
  $app_version = $_GET['app_version'];
  $app_version_id = getAppIdByVersion($app_version);
  //最后一次apk更新时间
  $result5 = $conn->query("select * from application where update_student = 1 order by id desc limit 1");
  $result5_row = $result5->fetch_assoc();
  $last_app_version = $result5_row["version"];
  $last_app_version_id = $result5_row["id"];
  if(strval($last_app_version_id) > strval($app_version_id))
    $result_row["update_student_client"] = $last_app_version;
}

echo json_encode($result_row, JSON_UNESCAPED_SLASHES);
$conn->close();


function getAppIdByVersion($v){
  global $conn;
  if(empty($v))
    return "0";
  $sql = sprintf("select * from application where version = '%s'", $v);
  
  if($r = $conn->query($sql)){
    return $r->fetch_assoc()["id"];
  }else
    return "0";
}

?>