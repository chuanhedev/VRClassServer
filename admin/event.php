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
$group_property = '';
$need_join = false;
$where = "";
$aggregate = "count";
$table_query = "event";
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
  $where  = " and property = '{$group_property}'";
}else{
  $aggregate_query = " , {$group_property}, ";
  $group_query = ", {$group_property}";
}
$aggregate_query2 = "count(*) as count";
if(count($metric) > 0){
  $m = $metric[0];
  $metric_property = $m["property"];
  if(empty($metric_property)){
  }else{
    $aggregate = $m["value"];
    $need_join = true;
    $aggregate_query2 = "{$aggregate}({$metric_property}) as {$aggregate}";
  }
}
if($need_join)
  $table_query = "event_data LEFT JOIN event on event.id = event_data.event_id";
//order by {$group_property} desc, timekey desc

$sql = sprintf("SELECT (FLOOR((timestamp + 28800)/%s)*%s  - 28800) AS timekey {$aggregate_query} {$aggregate_query2}
FROM {$table_query}
where timestamp > UNIX_TIMESTAMP(now())- %s * %s {$where}
GROUP BY timekey {$group_query}", $gap, $gap, $gap, $gapCount);
// }else{
//   $sql = sprintf("SELECT (FLOOR((timestamp + 28800)/%s)*%s  - 28800) AS timekey {$aggregate_query} {$aggregate_query2}
//   FROM event 
//   where timestamp > UNIX_TIMESTAMP(now())- %s * %s {$where}
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