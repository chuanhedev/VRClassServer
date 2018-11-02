<?php

require('../utils/db_config.php');
require('../utils/request.php');

$conn = new mysqli($servername, $username, $password, $dbname);

$result = $conn->query("select distinct property as result from event_data where value is null");

$res = array();
while($row = $result->fetch_assoc()) {
    array_push($res, $row["result"]);
}
send_data($res);
$conn->close();

?>