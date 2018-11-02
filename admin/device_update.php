<?php

require('../utils/db_config.php');
require('../utils/request.php');

$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset("utf8");

$data = post_data();
$id = $data["id"];
$devices = $data["data"];
for($i = 0;$i<count($devices); $i ++){
  $sql = "update device set location_id = {$id}, name = '{$devices[$i]['name']}' where id = '{$devices[$i]['id']}'";
  $conn->query($sql);
}
send_data("done");
$conn->close();

?>