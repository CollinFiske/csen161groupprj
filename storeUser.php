<?php

// This php script is used to store the user data into the database similarly to how the rooms were done

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['userId'], $data['displayName'], $data['roomId'])) {
	http_response_code(400);
	echo "User data was not receieved";
	exit;
}

// Variables to use that were taken directly from joinRoom.js (do note that roomId was included too maybe to hold list of roomIds per user so we can know which rooms they are part of)
$userId = $data['userId'];
$displayName = $data['displayName'];
$email = $data['email'] ?? '';
$roomId = $data['roomId'];
$joinedAt = $data['joinedAt'] ?? time();

// Rest of code should be for setting up the database for the users or however way is best

?>