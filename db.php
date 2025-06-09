<?php
// This file contains database functions that are useful throughout the whole
// backend.

if (!file_exists('db.sqlite')) {
	$file = fopen('db.sqlite', 'w');
	fclose($file);
}

$pdo = new \PDO('sqlite:db.sqlite');

$pdo->exec("
	CREATE TABLE IF NOT EXISTS Rooms(
		id INTEGER PRIMARY KEY,
		name VARCHAR(24) NOT NULL,
		description VARCHAR(256)
	);

	CREATE TABLE IF NOT EXISTS Users(
		id INTEGER PRIMARY KEY,
		name VARCHAR(24) NOT NULL,
		email VARCHAR(36)
	);

	CREATE TABLE IF NOT EXISTS Messages(
		id INTEGER PRIMARY KEY,
		body VARCHAR(2048) NOT NULL,
		room INTEGER NOT NULL,
        author INTEGER NOT NULL,
        authorName VARCHAR(32) NOT NULL,
        timestamp INTEGER NOT NULL
	);

	CREATE TABLE IF NOT EXISTS Memberships(
		id INTEGER PRIMARY KEY,
		user INTEGER NOT NULL,
		room INTEGER NOT NULL,
		admin BOOLEAN NOT NULL DEFAULT FALSE
	);
");


// returns the id of the new room
function createRoom($name, $description) {
	global $pdo;
	$create = $pdo->prepare("
		INSERT INTO Rooms(name, description) VALUES
			(:name, :description)
			RETURNING id;
	");
	$create->bindParam(':name', $name, PDO::PARAM_STR);
	$create->bindParam(':description', $description, PDO::PARAM_STR);
	if (!$create->execute()) {
		die("Could not create room $name");
	}
	return $create->fetch(PDO::FETCH_ASSOC)['id'];
}

// Saves the message in the database. No checks are made for if this is a
// duplicate.
function saveMessage($roomId, $authorId, $authorName, $timestamp, $body) {
	global $pdo;
	$insert = $pdo->prepare("
		INSERT INTO Messages(room, author, authorName, timestamp, body) VALUES
			(:roomId, :authorId, :authorName, :timestamp, :body)
			RETURNING id;
	");
	$insert->bindParam(':roomId', $roomId, PDO::PARAM_INT);
	$insert->bindParam(':authorId', $authorId, PDO::PARAM_INT);
	$insert->bindParam(':timestamp', $timestamp, PDO::PARAM_INT);
	$insert->bindParam(':body', $body, PDO::PARAM_STR);
	$insert->bindParam(':authorName', $authorName, PDO::PARAM_STR);
	if (!$insert->execute()) {
		die("Could not insert message");
	}
	return $insert->fetch(PDO::FETCH_ASSOC)['id'];
}

// Add a user to a room, and optionally make them an admin.
function joinRoom($userId, $roomId, $admin) {
	global $pdo;
	$insert = $pdo->prepare("
		INSERT INTO Memberships(user, room, admin) VALUES
			(:userId, :roomId, :admin);
	");
	$insert->bindParam(':userId', $userId, PDO::PARAM_INT);
	$insert->bindParam(':roomId', $roomId, PDO::PARAM_INT);
	$insert->bindParam(':admin', $admin, PDO::PARAM_BOOL);
	if (!$insert->execute()) {
		die("Could not join room $roomId");
	}
}

function leaveRoom($userId, $roomId) {
    global $pdo;
    $delete = $pdo->prepare("
        DELETE FROM Memberships
            WHERE user IS :userId
            AND room IS :roomId;
    ");
    $delete->bindParam(':userId', $userId, PDO::PARAM_INT);
    $delete->bindParam(':roomId', $roomId, PDO::PARAM_INT);
    if (!$delete->execute()) {
        die("Could not leave room $roomId");
    }
}

// Get the name, id, and description for a room.
function getRoom($roomId) {
	global $pdo;
	$select = $pdo->prepare("
		SELECT * FROM Rooms
			WHERE id is :id LIMIT 1;
	");
	$select->bindParam(':id', $roomId, PDO::PARAM_INT);
	if (!$select->execute()) {
		die("Could not select room $roomId");
	}
	return $select->fetch(PDO::FETCH_ASSOC);
}

// Get the names, ids, and descriptions for all the rooms that a user is a part
// of.
function getRooms($userId) {
	global $pdo;
	$select = $pdo->prepare("
		SELECT r.name, r.id, r.description FROM Memberships m
			LEFT JOIN Rooms r ON m.room = r.id
			WHERE m.user IS :userId;
	");
	$select->bindParam(':userId', $userId, PDO::PARAM_INT);
	if (!$select->execute()) {
		die("Could not select rooms for user $userId");
	}
	return $select->fetchAll();
}

// Get all the messages in a room.
function getMessages($roomId) {
	global $pdo;
	$select = $pdo->prepare("
		SELECT m.timestamp, u.id as authorId, m.authorName, u.name as author, m.body FROM Messages m
            LEFT JOIN Users u ON u.id = m.author
			WHERE m.room is :roomId;
	");
	$select->bindParam(':roomId', $roomId, PDO::PARAM_INT);
	if (!$select->execute()) {
		die("Could not get messages of room $roomId");
	}
	return $select->fetchAll(PDO::FETCH_ASSOC);
}

// Get the ids, names, and admin status of all the members of a room.
function getMembers($roomId) {
	global $pdo;
	$select = $pdo->prepare("
		SELECT m.user as id, u.name, m.admin FROM Memberships m
			LEFT JOIN Users u ON u.id = m.id
			WHERE m.room is :roomId;
	");
	$select->bindParam(':roomId', $roomId, PDO::PARAM_INT);
	if (!$select->execute()) {
		die("Could not get members of room $roomId");
	}
	return $select->fetchAll(PDO::FETCH_ASSOC);
}

// Creates an empty user. The goal of this function is just to give someone an
// ID. We can expect them to come back later and request that a name be
// associated with that ID.
function createUser() {
	global $pdo;
	$create = $pdo->query("
		INSERT INTO Users(name, email) VALUES
			('Unnamed User', NULL)
			RETURNING id;
	");
	return $create->fetchColumn();
}
?>
