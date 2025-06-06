// This javascript ensures that we save all the values from the html and prepare it for the database in php

// For php I suggest using the file storeRoom.php


// Gets the part of the document in which the create button is used and assigns a function for when clicked
document.getElementById('createBtn').addEventListener('click', async () => {
    // Once create room is pressed we gather ALL of the info from each respective part of the html
    const name = document.getElementById('roomName').value.trim();
	const description = document.getElementById('roomDescription').value.trim();
	const allowAnonymous = document.getElementById('allowAnonymous').checked;

    // Sends a message indicating that the room name is required! (I don't know if description should be required too?)
	if (!name) {
		alert("Room name is required.");
		return;
	}

	// Creating a random roomId which will be helpful to differentiate rooms!
	const roomId = generateRoomId();

    // We also need to randomly generate a room code too!
    const roomCode = generateRoomCode();

	// After roomId is made we have all the values we now need so next we make a room object which will be used for the Json. Threw in timestamp cus why not
	const roomData = {
		roomId,
        roomCode,
		name,
		description,
		allowAnonymous,
		createdAt: Date.now()
	};

	// The rest of the process involves throwing the data into the backend to the php file corresponding to it. Sending a json directly to store-room.php for it to use
	try {
		const response = await fetch('/storeRoom.php', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(roomData)
		});

		if (response.ok) {
			alert("Room created!");
			window.location.href = "index.html";
		} else {
			alert("Failed to create room.");
		}
	} catch (err) {
		console.error(err);
		alert("Server error occurred.");
	}
});

// This function uses a recommended random generator for room assingment so we never get overlapping ids
function generateRoomId() {
	// Random 8-character alphanumeric ID (case-insensitive)
	return 'room_' + Math.random().toString(36).substr(2, 8);
}

// Function just generates the room code which is just some 4-digit number from 1000 to 9999
function generateRoomCode() {
    return Math.floor(Math.random() * (9999-1000 + 1)) + 1000;
}