<?php

require('../utils/db_config.php');
require('../utils/request.php');

$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset("utf8");

// $data = post_data();
// $gap = $data["gap"];
// $gapCount = $data["gapCount"];
$result = $conn->query("select distinct property as result, 0 as type from event_data where value is not null
union
select distinct property as result, 1 as type from event_data where value is null");

$res = array();
while($row = $result->fetch_assoc()) {
array_push($res, $row);
}
send_data($res);
$conn->close();

?>