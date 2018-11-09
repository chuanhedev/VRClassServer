<?php

require('../utils/db_config.php');
require('../utils/request.php');

$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset("utf8");

$name = $_POST["name"];
$conn->query(sprintf("insert into location (name) values ('%s')", $name));
send_data("done");
$conn->close();

?>