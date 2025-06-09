<?php
include 'db.php';

if (!isset($_COOKIE['userId'])) {
	http_response_code(400);
	exit('Missing userId cookie');
}
$userId = $_COOKIE['userId'];

header('Content-Type: application/json');
echo json_encode(getRooms((int)$userId));
?>
