<?php

require('utils/db_config.php');

$conn = new mysqli($servername, $username, $password, $dbname);
$from_version = "";
if(isset($_GET['version']))
  $from_version = $_GET['version'];
// echo $from_version;


$result = $conn->query("select * from application order by id desc limit 1");
$result_row = $result->fetch_assoc();
$to_version_id = $result_row["id"];
$to_version = $result_row["version"];
// echo $to_version_id;

// $from_version = '1.0.0';
// $to_version_id = 2;

//table1 minus table2
$sql = sprintf("select t1.* from app_file as t1
left join
(select * from app_file where version_id in
(select id from application where version = '%s')) as t2
on t1.path = t2.path and t1.name = t2.name and t1.md5 = t2.md5
where t1.version_id = %s and t2.name is null",
  $from_version, $to_version_id
);
$result = $conn->query($sql);
// $to_version = $result->fetch_assoc()["version"];
$arr = array();
while($row = $result->fetch_assoc()) {
  array_push($arr, $row);
}

$conn->close();
$result_row["files"] = $arr;
echo json_encode($result_row);

?>