<?php

require('../utils/db_config.php');
require('../utils/request.php');

$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset("utf8");

$data = post_data();
$gap = $data["gap"];
$gapCount = $data["gapCount"];
$group = $data["group"];
$metric = $data["metric"];
$where = $data["where"];
$group_property = '';
$need_join = false;
$where_query = "";
$aggregate = "count";

//handle groups
if(count($group) > 0){
  $group_property = $group[0];
}
if(empty($group_property)){
  $aggregate_query = ", ";
  $group_query = "";
}else if(is_join_need($group_property)){
  $need_join = true;
  $aggregate_query = " , value as {$group_property}, ";
  $group_query = ", value";
  $where_query  = " and property = '{$group_property}'";
}else{
  $aggregate_query = " , {$group_property} as `{$group_property}`, ";
  $group_query = ", {$group_property}";
}

//handle metric
$aggregate_query2 = "count(*) as count";
if(count($metric) > 0){
  $m = $metric[0];
  $metric_property = $m["property"];
  if(empty($metric_property)){
  }else{
    $aggregate = $m["value"];
    $need_join = true;
    $aggregate_query2 = "{$aggregate}(metric) as {$aggregate}";
    $where_query  = $where_query." and property = '{$metric_property}'";
  }
}

//handle wheres
for ($i=0; $i<count($where); $i++){
  $w = $where[$i];
  $where_property = $w["property"];
  $where_value = $w["value"];
  if(!empty($where_property) && !empty($where_value)){
    if(is_join_need($where_property)){
      $need_join = true;
      $where_query  = $where_query . " and property = '{$where_property}' and value='{$where_value}'";
    }else{
      $where_query  = $where_query . " and {$where_property}='{$where_value}'";
    }
  }
}

if($need_join)
  $table_query = "event_data LEFT JOIN event on event.id = event_data.event_id
  LEFT JOIN device on event.device_id = device.id 
  LEFT JOIN location on location.id = device.location_id";
else
  $table_query = "event LEFT JOIN device on event.device_id = device.id 
  LEFT JOIN location on location.id = device.location_id  ";
$sql = sprintf("SELECT (FLOOR((timestamp + 28800)/%s)*%s  - 28800) AS timekey,
location.name as school, device.name as devicename
 {$aggregate_query} {$aggregate_query2}
FROM {$table_query}
where timestamp > UNIX_TIMESTAMP(now())- %s * %s {$where_query}
GROUP BY timekey {$group_query}", $gap, $gap, $gap, $gapCount);
// }else{
//   $sql = sprintf("SELECT (FLOOR((timestamp + 28800)/%s)*%s  - 28800) AS timekey {$aggregate_query} {$aggregate_query2}
//   FROM event 
//   where timestamp > UNIX_TIMESTAMP(now())- %s * %s {$where_query}
//   GROUP BY timekey {$group_query}", $gap, $gap, $gap, $gapCount);
// }

// echo $sql;

$result = $conn->query($sql);
$res = array();
  while($row = $result->fetch_assoc()) {
    array_push($res, $row);
  }
  echo json_encode(array(
    "data"=>$res,
    "group"=>$group_property,
    "join"=>$need_join,
    "sql" =>$sql,
    'ag' => $aggregate 
  ));

$conn->close();

function is_join_need($col_name){
  return $col_name != strtoupper($col_name);
}

?>