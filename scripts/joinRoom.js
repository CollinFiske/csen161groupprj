// This javascript takes care of all the functionality for when joining a room. We need to make sure that we setup the user variables and send them to db or php

// Since in welcome.js it is expected that the URL uses a query parameter of ?roomId=... we parse it now for use here
const params = new URLSearchParams(window.location.search);
const roomId = params.get('roomId');

// If roomId doesn't exist we send an alert and take the user back to welcome.html. This shouldn't happen anyways but just in case
if (!roomId) {
	alert("Missing room ID!");
	window.location.href = "welcome.html";
}

// Displays the room name where it needs to go dynamically of course. Assigns the results, and checks the data before setting the updated text content
fetch(`/getRoomData.php`, {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({ roomId })
})
.then(res => res.json())
.then(data => {
	if (!data || !data.name) {
		alert("Room not found.");
		window.location.href = "welcome.html";
		return;
	}
	document.getElementById('roomCode').textContent = data.name;
})
.catch(err => {
	console.error(err);
	alert("Failed to fetch room.");
	window.location.href = "welcome.html";
});

// Now we get around to the functionality of the join button for setting data for displayName and email
document.getElementById('joinBtn').addEventListener('click', async () => {
	const displayName = document.getElementById('displayName').value.trim();
	const email = document.getElementById('email').value.trim();

	if (!displayName) {
		alert("Display name is required.");
		return;
	}

	// Generate a unique user ID similarly to how we did the room creation
	const userId = generateUserId();

	// Create user object to send to the database
	const userData = {
		userId,
		displayName,
		email,
		roomId,
		joinedAt: Date.now()
	};

    // Now we begin to finally send the user data from the setup to the php for preparations into database
	try {
		const res = await fetch('/storeUser.php', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(userData)
		});

		if (!res.ok) throw new Error();

		// Redirect to actual chat room which should automatically open up the index.html at the appropriate chat
		window.location.href = `index.html?roomId=${roomId}&userId=${userId}`;
	} catch (err) {
		console.error(err);
		alert("Could not join room.");
	}
});


function generateUserId() {
	// Basic unique ID (8-character alphanumeric)
	return 'user_' + Math.random().toString(36).substring(2, 10);
}
