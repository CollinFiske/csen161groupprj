/** 
 * This is enough to give you autocomplete in some editors if you have types for
 * peerjs installed (run `npm install` from the terminal).
 *
 * @import { Peer } from 'peerjs'
 */

// Setting up global variable
const us = new Peer();
let currentRoomId = null;
let currentUserId = null;
let peerConnections =  {}; // empty object for now of all peer connections at the moment. Gonna consist of key: peerId as well as value: DataConnection

//Parsing the parameters of the URL to get both the roomId and userId
const urlParams = new URLSearchParams(window.location.search);
currentRoomId = urlParams.get("roomId");
currentUserId = urlParams.get("userId");

// https://stackoverflow.com/a/25621277
const messageBox = document.getElementById('message-box')
messageBox.style.height = messageBox.scrollHeight + 'px'
messageBox.style.overflowY = 'hidden'
messageBox.addEventListener('input', () => {
	messageBox.style.height = 'auto'
	messageBox.style.height = messageBox.scrollHeight + 'px'
});

// Setup object to take the place of format of the buttons needed and setting the file attached to null for now
const sendButton = document.getElementById('send-btn');
const attachButton = document.getElementById('attachment-btn');
let attachmentFile = null;

messageBox.addEventListener('input', () => {
	sendButton.disabled = !messageBox.value.trim();
});

// Send Button event listener
sendButton.addEventListener('click', sendMessage);
messageBox.addEventListener('keydown', (e) => {
	if (e.key === 'Enter' && e.shiftKey) {
		e.preventDefault();
		sendMessage();
	}
});

// The attachment button event listener
attachButton.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "*/*";
  input.onchange = () => {
    attachedFile = input.files[0];
    sendButton.disabled = !messageBox.value.trim() && !attachedFile;
  };
  input.click();
});

// Next we focus on sending a message for when it is written

function sendMessage () {
	const content = messageBox.value.trim();
	if (!content) {
		return;
	}

	// Gonna setup with form data as there is more to deal with here
	const formData = FormData();
	formData.append("senderId", currentUserId);
	formData.append("timestamp", Date.now());
	formData.append("content", content);
	formData.append("roomId", currentRoomId);

	if (attachmentFile) {
		formData.append("attachment", attachmentFile);
	}

	const messageData = {
		senderId: us.id,
		timestamp: Date.now(),
		content,
		roomId: currentRoomId,
		hasAttachment: !!attachedFile
	};

	// Sends to all the peers using the following
	for (const conn of Object.values(peerConnections)) {
		conn.send({type: 'message', data: messageData });
	}

	// Sending to the backend for the storage into the database for later use
	fetch("/storeMessage.php", {
	  method: "POST",
	  body: formData
	});

	// Sets the message input box back to nothing again starting up a new input event to finish resetting
	messageBox.value = '';
	attachedFile = null;
  	fileInput.value = "";
	messageBox.dispatchEvent(new Event('input'));
}

// The following functions are used to gather from the database via php files that deal with particular parts of the project

// This function is used for when we join the room and is used to get setup the proper connections
async function joinRoom(roomId) {
	currentRoomId = roomId;

	// For all existing messages already, we need to fetch them! This can be done by getting them from the database via results from getPeers.php
	const res = await fetch(`/getPeers.php?roomId=${roomId}`);
	const peerIds = await res.json();

	// Loop for all the existing peers and make sure that they match. If so, setup several connections per peer
	for (const peerId of peerIds) {
		if (peerId === us.id) {
			continue;
		}
		const conn = us.connect(peerId);
		setupConnection(conn);
	}
}

// Wrote a small if statment here to run whenever a room is loaded to automatically join the room if the proper ids exist:
if (currentRoomId && currentUserId) {
	joinRoom(currentRoomId);
}

// The following is used to setup the listeners for the incoming connections and to handle it when it occurs

// A listener is created for preparation of receiving a message
us.on('connection', (conn) => {
	setupConnection(conn);
});

// Function is used to setup connections via the connection object that is defined by the peerId at a given point
function setupConnection(conn) {
	conn.on('open', () => {
		peerConnections[conn.peer] = conn;
	});

	conn.on('data', (msg) => {
		if (msg.type === 'message') {
			location.reload(); 
		}
	});
}

// This function serves to refresh the messages without having to hard reload every single time. It requests messages from the database from a particular room
async function refreshMessages() {
  const response = await fetch(`/getRoomMessagesHTML.php?roomId=${currentRoomId}`);
  const html = await response.text();
  document.getElementById('chat-container').innerHTML = html;
}

// Periodically update member and online counts when nessecary
async function updateRoomStats() {
  try {
    const res = await fetch(`/getPeers.php?roomId=${currentRoomId}`);
    const peerIds = await res.json();

	const allMembers = peerIds.length; // Just counting the number of peer ids that was returned by getPeers again
    const onlineCount = Object.keys(peerConnections).length + 1; // include self of course

	const onlineTag = document.getElementById("online-now");
	onlineTag.innerHTML = allMembers.length + " Members (" + onlineCount + " here now)"; 

  } catch (err) {
    console.error("Failed to update room stats", err);
  }
}

setInterval(updateRoomStats, 10000);
updateRoomStats();