<?php

session_start();

// Check if user is already in a room
if (isset($_SESSION['room_code']) && isset($_SESSION['display_name'])) {
    // User has joined a room, redirect to chat
    header('Location: index.html');
    exit();
}

// Check if user has a room code but hasn't entered display name
if (isset($_SESSION['room_code']) && !isset($_SESSION['display_name'])) {
    // Redirect to join room screen
    header('Location: joinRoom.html');
    exit();
}

// No room code set, redirect to welcome screen
header('Location: welcome.html');
exit();

?>