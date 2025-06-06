<?php

// This php script that welcome.js is looking for to receive any sign that a room exists. 

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['roomCode'])) {
	http_response_code(400);
	echo json_encode(['exists' => false]);
	exit;
}

// Here is the roomCode value that was sent from javascript, use this to compare with all other room codes in database
$roomCode = trim($data['roomCode']);

// The rest of the code below this comment should focus on searching all rooms in the database and verifying that the given Room Code does or doesn't exist
// If it doesn't exist, send nothing back to javascript and it should handle it fine

?>