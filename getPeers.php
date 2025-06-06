<?php

// This particular script is responsible for returning a list of peer ids for all the users in a specific room

header('Content-Type: application/json');

if (!isset($_GET['roomId'])) {
    http_response_code(400);
    echo "Failed to receieve roomId";
    exit;
}

// I think this page really only needs the roomId from the index.js end of things as this Id will be useful to 
$roomId = $_GET['roomId'];


?>