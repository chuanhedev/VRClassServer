<?php

require('../utils/db_config.php');
require('../utils/request.php');

$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset("utf8");
$conn->autocommit(false);

$data = post_data();
date_default_timezone_set('PRC');
$version = $data["version"];
$files = $data["files"];

$result = $conn->query("select count(*) as count from application where version = '". $version ."'");
$count = $result->fetch_assoc()["count"];
date_default_timezone_set('PRC');
$date = date("Y-m-d H:i:s");
if($count == 1){
  error("version existed");
}else{
  $result = $conn->query("select max(id) as id from application");
  $last_version_id = $result->fetch_assoc()["id"];

  $sql = sprintf("insert into application (version, date) values ('%s','%s')", $version, $date);
  $conn->query($sql);
  $insert_id = $conn->insert_id;
  
  $result = $conn->query("select * from app_file where version_id =" .$last_version_id);
  while($row = $result->fetch_assoc()) {
    $sql = sprintf("insert into app_file (name, md5, size, version_id, path) values ('%s','%s',%s,%s,'%s')"
    , $row["name"], $row["md5"], $row["size"], $insert_id, $row["path"]);
    // echo $sql;
    $conn->query($sql);
  }
  for($i = 0; $i<count($files); $i++){
    $file_data = $files[$i];
    $sql = sprintf("insert into app_file (name, md5, version_id, size, path) values ('%s','%s',%s,%s,'%s')"
    , $file_data["name"], $file_data["md5"], $insert_id, $file_data["size"], $file_data["path"]);
    if(!$conn->query($sql)){
      $error = $conn->error;
      $conn->rollback();
      error($error);
    } 
  }
}
$conn->commit();
success();
$conn->close();

?>