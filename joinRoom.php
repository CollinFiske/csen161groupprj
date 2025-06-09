<?php
include 'db.php';

if (!$_POST['roomId']) {
	http_response_code(400);
	exit("Missing room id");
}
$roomId = $_POST['roomId'];

if (!isset($_COOKIE['userId'])) {
	http_response_code(400);
	exit('Missing userId cookie');
}
$userId = $_COOKIE['userId'];

joinRoom($userId, $roomId, false);

header('Location: index.html');
?>
