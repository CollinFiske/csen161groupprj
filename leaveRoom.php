<?php
include 'db.php';

if (!isset($_GET['roomId'])) {
	http_response_code(400);
	exit("Missing roomId in GET");
}
$roomId = $_GET['roomId'];

if (!isset($_COOKIE['userId'])) {
	http_response_code(400);
	exit('Missing userId cookie');
}
$userId = $_COOKIE['userId'];

leaveRoom($userId, $roomId);

header('Location: index.html');
?>
