<?php
  function post_data(){
    if(isset($_POST['data'])){
        // global $key;
        // global $iv;
        $data = $_POST['data'];
        // $data2 = openssl_decrypt($data,"AES-256-CBC",$this->key,NULL,$this->iv);
        // $obj = json_decode(substr($data2,1), true);
        
        $obj = json_decode($data, true);
        return $obj;
    }else
        error('null');
}


function get_data(){
    if(isset($_GET['data'])){
        $data = $_GET['data'];
        return json_decode($data, true);
    }else
        error('null');
}

function error($str){
    echo json_encode(array("err"=>$str));
    die();
}

function send_data($d){
    echo json_encode(array("data"=>$d));
}
?>