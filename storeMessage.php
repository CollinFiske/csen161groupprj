<?php
include 'db.php';

// This php script is similar again to the other storing ones where we gather the information from index.js and store messages into the database

// Create uploads directory if it doesn't exist so we can store any uploads in this folder as I think database might be hard
$uploadDir = __DIR__ . '/uploads/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Validate required fields if none of these fields were set
if (!isset($_COOKIE['userId'])) {
    http_response_code(400); 
    exit('Missing userId cookie');
}
$authorId = $_COOKIE['userId'];

if (!isset($_POST['timestamp'])) {
    http_response_code(400); 
    echo 'Missing timestamp';
    exit;
}
$timestamp = $_POST['timestamp'];

if (!isset($_POST['content'])) {
    http_response_code(400); 
    echo 'Missing content';
    exit;
}
$content = $_POST['content'];

if (!isset($_POST['roomId'])) {
    http_response_code(400); 
    echo 'Missing roomId';
    exit;
}
$roomId = $_POST['roomId'];

if (!isset($_POST['authorName'])) {
    http_response_code(400); 
    echo 'Missing authorName';
    exit;
}
$authorName = $_POST['authorName'];

saveMessage($roomId, $authorId, $authorName, $timestamp, $content);

exit; // TODO

// Info given from the javascript to use
$attachmentPath = null;

// Attempted here to handle what would happen if the file was uploaded:
if (isset($_FILES['attachment']) && $_FILES['attachment']['error'] === UPLOAD_ERR_OK) {
    // Retrieves the original name of the file uploaded:
    $originalName = basename($_FILES['attachment']['name']);

    // Uses the original name and the uniqid function to create a new unique file name instead so files don't overlap if too many upload the same one
    $uniqueName = uniqid('file_', true) . "_" . $originalName;
    $targetPath = $uploadDir . $uniqueName;

    // The uploaded file function will in itself actually shift over the new file attachment and store it into the directory mentioned at the beginning.
    if (move_uploaded_file($_FILES['attachment']['tmp_name'], $targetPath)) {
        // This is the attachment path that we can use and should be stored in database for use!
        $attachmentPath = 'uploads/' . $uniqueName;
    }
}

// Again rest of php should focus on adding the message to the database.
// For the attachment, make sure to store the attachmentPath so that can be pulled if needed

?>
