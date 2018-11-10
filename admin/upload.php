<?php
// echo getcwd() . '<br/>';
// echo $_SERVER["DOCUMENT_ROOT"]. '<br/>';
// echo $_SERVER['SCRIPT_FILENAME']. '<br/>';
$filePath = $_POST['path'];
$target_dir = getcwd()."/../resources/".$filePath;
if (!file_exists($target_dir)) {
  mkdir($target_dir, 0777, true);
}
$target_file = $target_dir . basename($_FILES["fileToUpload"]["name"]);
// echo $filePath;
if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {
  echo "{}";
} else {
  echo '{err:"Sorry, there was an error uploading your file."}';
}

?>