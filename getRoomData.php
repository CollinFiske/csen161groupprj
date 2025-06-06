<?php

// This php script is responsible for actually sending a room to javascript from the database

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$roomId = $data['roomId'] ?? '';

if (!$roomId) {
	echo json_encode([]);
	exit;
}

// Rest of code below should be used to make a query to get the room and send a json encoded back to javascript

?>