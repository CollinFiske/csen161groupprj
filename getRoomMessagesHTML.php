<?php

header('Content-Type: application/json');

if (!isset($_GET['roomId'])) {
    http_response_code(400);
    echo "Failed to receieve roomId";
    exit;
}

$roomId = $_GET['roomId'];

// The rest of the script should focus on getting all the html of the messages and sending that html to the javascript so it can refreash dynamically.
// This'll also ensure that the php here is rendering the messages exclusively not the javascript. Would make sense to do a select query from sqlite and do a foreach loop for each message per room