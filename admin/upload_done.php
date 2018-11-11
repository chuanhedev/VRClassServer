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

$update_teacher = $data["update_teacher"]?1:0;
$update_student = $data["update_student"]?1:0;
$update_server = $data["update_server"]?1:0;

$result = $conn->query("select count(*) as count from application where version = '". $version ."'");
$count = $result->fetch_assoc()["count"];
date_default_timezone_set('PRC');
$date = date("Y-m-d H:i:s");
if($count == 1){
  error("version existed");
}else{
  $last_version_id = "";
  if($result = $conn->query("select max(id) as id from application")){
    $last_version_id = $result->fetch_assoc()["id"];
  }
  $sql = sprintf("insert into application (version, date, update_teacher,update_student ,update_server ) values ('%s','%s', %s, %s, %s)"
  , $version, $date, $update_teacher, $update_student, $update_server);
  $conn->query($sql);
  $insert_id = $conn->insert_id;
  
  if($result = $conn->query("select * from app_file where version_id =" .$last_version_id)){
    while($row = $result->fetch_assoc()) {
      $sql = sprintf("insert into app_file (name, md5, size, version_id, path) values ('%s','%s',%s,%s,'%s')"
      , $row["name"], $row["md5"], $row["size"], $insert_id, $row["path"]);
      // echo $sql;
      $conn->query($sql);
    }
  }
  
  for($i = 0; $i<count($files); $i++){
    $file_data = $files[$i];
    if(!in_array( array("server.zip", "teacher.zip", "student.apk"), $file_data["name"])){
      $sql = sprintf("insert into app_file (name, md5, version_id, size, path) values ('%s','%s',%s,%s,'%s')"
      , $file_data["name"], $file_data["md5"], $insert_id, $file_data["size"], $file_data["path"]);
      if(!$conn->query($sql)){
        $error = $conn->error;
        $conn->rollback();
        error($error);
      } 
    }
  }
}
$conn->commit();
success();
$conn->close();

?>