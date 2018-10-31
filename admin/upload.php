<?php
$target_dir = $_SERVER["DOCUMENT_ROOT"] ."/chuanhe/resources/";
$target_file = $target_dir . basename($_FILES["fileToUpload"]["name"]);
if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {
  echo "1";
} else {
  echo "Sorry, there was an error uploading your file.";
}

?>