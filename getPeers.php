<?php

// This particular script is responsible for returning an array of peer ids in json format for all the users in a specific room.

// In short, make sure something like this gets sent back to javascript: ["user123", "user456", "user789"] etc.

header('Content-Type: application/json');

if (!isset($_GET['roomId'])) {
    http_response_code(400);
    echo "Failed to receieve roomId";
    exit;
}

// I think this page really only needs the roomId from the index.js end of things as this Id will be useful to 
$roomId = $_GET['roomId'];


?>