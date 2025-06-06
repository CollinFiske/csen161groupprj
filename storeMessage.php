<?php

// This php script is similar again to the other storing ones where we gather the information from index.js and store messages into the database

$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($data['senderId']) || !isset($data['timestamp']) || !isset($data['content']) || !isset($data['roomId'])) {
    http_response_code(400); 
    echo 'Missing required message fields';
    exit;
}

// Info given from the javascript to use
$senderId = $data['senderId'];
$timestamp = $data['timestamp'];
$content = $data['content'];
$roomId = $data['roomId'];

// Again rest of php should focus on storing the messages into database

?>