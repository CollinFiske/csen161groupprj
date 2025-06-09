<?php
include 'db.php';

// This php script is responsible for actually sending a room to javascript from the database

header('Content-Type: application/json');

if (!isset($_GET['roomId'])) {
	http_response_code(400);
	exit("Missing room id");
}
$roomId = $_GET['roomId'];

$result = [];
$result['room'] = getRoom($roomId);
$result['messages'] = getMessages($roomId);
$result['members'] = getMembers($roomId);

header('Content-Type: application/json');
echo json_encode($result);
?>
