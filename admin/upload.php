<?php
// echo getcwd() . '<br/>';
// echo $_SERVER["DOCUMENT_ROOT"]. '<br/>';
// echo $_SERVER['SCRIPT_FILENAME']. '<br/>';
$target_dir = getcwd()."/../resources/";
$target_file = $target_dir . basename($_FILES["fileToUpload"]["name"]);
if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {
  echo "1";
} else {
  echo "Sorry, there was an error uploading your file.";
}

?>