<?php

// This php page can be used in conjunction with createRoom.js to get decode the file contents from. The purpose of this file should be to store room data in db

// Added a small chunk of code to receive the data from createRoom.js hopefully.

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['roomId'])) {
    http_response_code(400);
    echo "Either no data was found or there was NO room ID";
    exit;
}

// The following should setup the variables from the javascript
$roomId = $data['roomId'];
$roomCode = $data['roomCode'];
$name = $data['name'];
$description = $data['description'] ?? ''; // Just in case there isn't any description? (This may change if description becomes required)
$allowAnonymous = $data['allowAnonymous'] ? 1 : 0; // A quick boolean check pretty much where 1 means yeah and 0 referring to not checked
$createdAt = $data['createdAt'] ?? time();

// Note each room does not have a list of users as this was focused on setting up basic room metadata first. The users database per user stores each room they are part of

// Rest of code should be for setting up db from here on out

?>