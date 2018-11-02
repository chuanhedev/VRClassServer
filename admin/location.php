<?php

require('../utils/db_config.php');
require('../utils/request.php');

$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset("utf8");

$result = $conn->query("select id, name from location");

$res = array();
while($row = $result->fetch_assoc()) {
    array_push($res, $row);
}
send_data($res);
$conn->close();

?>