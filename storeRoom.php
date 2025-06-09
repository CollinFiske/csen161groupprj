<?php
include 'db.php';

// This php page can be used in conjunction with createRoom.js to get decode the file contents from. The purpose of this file should be to store room data in db

// Added a small chunk of code to receive the data from createRoom.js hopefully.

if (!isset($_COOKIE['userId'])) {
	http_response_code(400);
	exit('No userId is set');
}
$userId = $_COOKIE['userId'];

if (!isset($_POST['name'])) {
	http_response_code(400);
	exit('Missing name in POST');
}
$name = $_POST['name'];

$description = $_POST['description'] ?? '';

// The following should setup the variables from the javascript
/* $allowAnonymous = $data['allowAnonymous'] ? 1 : 0; */
/* $createdAt = $data['createdAt'] ?? time(); */

$roomId = createRoom($name, $description);
/* var_dump($roomId); */
joinRoom($userId, $roomId, true);

header('Location: index.html');

// Note each room does not have a list of users as this was focused on setting up basic room metadata first. The users database per user stores each room they are part of

// Rest of code should be for setting up db from here on out

?>
