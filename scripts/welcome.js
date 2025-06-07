// The following javascript ensures that we can only press the join button once a matching code from the database is met

// Event listener for the join button takes care of all logic in this script
document.getElementById('joinBtn').addEventListener('click', async () => {
	const roomCode = document.getElementById('roomCode').value.trim();

    // Occurs if the room code is left as default empty and a user attempts to submit
	if (!roomCode) {
		alert("Please enter a room code.");
		return;
	}

	try {
		// A javascript query for backend to check if room exists via its room code
		const response = await fetch('/checkRoomExists.php', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ roomCode })
		});

		if (!response.ok) throw new Error("Server error");

        // We wait here for the data back from checkRoom.php
		const data = await response.json();

		if (data.exists) {
			// Redirect with roomId as a URL param going into joinRoom.html
			window.location.href = `joinRoom.html?roomId=${encodeURIComponent(data.roomId)}`;
			console.log("helllo");
		} else {
			alert("Invalid room code. Please check and try again.");
		}
	} catch (err) {
		console.error(err);
		alert("Could not validate room code. Please try again.");
	}
});
