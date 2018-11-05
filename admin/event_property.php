<?php

require('../utils/db_config.php');
require('../utils/request.php');

$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset("utf8");

// $data = post_data();
// $gap = $data["gap"];
// $gapCount = $data["gapCount"];
if(isset($_GET['value']))
    $property_name = $_GET['value'];
if(empty($property_name)){
    $result = $conn->query("select distinct property as result from event_data where value is not null");
// }else if($property_name == "NAME"){
//     $result = $conn->query("select distinct name as result from event");
// }else if($property_name == "SCHOOL"){
//     $result = $conn->query("select distinct name as result from location");
}else if(strpos($property_name, '.')){
    $sql = "select distinct {$property_name} as result from ".substr($property_name,0, strpos($property_name, '.'));
    $result = $conn->query($sql);
}else{
    $result = $conn->query("select distinct value as result from event_data where value is not null and property = '". $property_name . "'");
}
$res = array();
while($row = $result->fetch_assoc()) {
array_push($res, $row["result"]);
}
send_data($res);

$conn->close();

?>