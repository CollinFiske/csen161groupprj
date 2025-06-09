/** 
 * This is enough to give you autocomplete in some editors if you have types for
 * peerjs installed (run `npm install` from the terminal).
 *
 * @import { Peer } from 'peerjs'
 */

import { getUserId } from './utils.js'

// Setting up global variable
const PEER_ID_SALT = 'a34w0pl8akw6vcv2n_' // by default, everyone using PeerJS uses the same ICE server, so this helps us avoid naming conflicts
let currentRoomId = null;
let currentUserId = null;
let peerConnections =  {}; // empty object for now of all peer connections at the moment. Gonna consist of key: peerId as well as value: DataConnection

//Parsing the parameters of the URL to get both the roomId
const urlParams = new URLSearchParams(window.location.search);
currentRoomId = urlParams.get("roomId");
currentUserId = getUserId();

const us = new Peer(PEER_ID_SALT + currentUserId, { debug: 1 });

us.on('error', (e) => {
	console.error(e)
})

if (currentRoomId) {
	joinRoom(currentRoomId);
}

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
let attachedFile = null;

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

getRooms()
async function getRooms() {
	const rooms = await fetch('/getRooms.php').then(r => r.json())
	const container = document.getElementById('conversations')
	container.innerHTML = ''
	for (const room of rooms) {
		const el = document.createElement('div')
		el.classList.add('conversation')
		el.addEventListener('click', () => joinRoom(room.id))
		el.innerHTML = `
			<div class="title">${room.name}</div>
			<details class="pmenu details">
				<summary class="button round">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="icon">
						<path d="M10 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM10 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM11.5 15.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" />
					</svg>
				</summary>
				<div class="context-menu">
					<div class="item">item 1</div>
					<div class="item">item 2</div>
					<div class="item danger">item 1</div>
				</div>
			</details>
			<div class="subtitle subtext">${room.description}</div>
		`
		container.appendChild(el)
	}
}

// Next we focus on sending a message for when it is written

async function sendMessage () {
	const content = messageBox.value.trim();
	if (!content || !currentRoomId) {
		return;
	}

	const messageData = {
		authorId: currentUserId,
		timestamp: Date.now(),
		content,
		roomId: currentRoomId,
		hasAttachment: !!attachedFile
	};

	// Gonna setup with form data as there is more to deal with here
	const formData = new FormData();
	for (const [k, v] of Object.entries(messageData)) {
		formData.append(k, v)
	}

	// if (attachmentFile) {
	// 	formData.append("attachment", attachmentFile);
	// }

	// Sends to all the peers using the following
	for (const conn of Object.values(peerConnections)) {
		conn.send({type: 'message', data: messageData });
	}

	// Sending to the backend for the storage into the database for later use
	await fetch("/storeMessage.php", { method: "POST", body: formData });

	document
		.getElementById("chat-container")
		.appendChild(
			createMessageElement(messageData.authorId, messageData.content, [])
		);

	// Sets the message input box back to nothing again starting up a new input
	// event to finish resetting
	messageBox.value = '';
	// attachmentFile = null;
  	// fileInput.value = "";
	messageBox.dispatchEvent(new Event('input'));
}

// The following functions are used to gather from the database via php files that deal with particular parts of the project

// This function is used for when we join the room and is used to get setup the proper connections
async function joinRoom(roomId) {
	currentRoomId = roomId;

	// For all existing messages already, we need to fetch them! This can be done by getting them from the database via results from getPeers.php
	const res = await fetch(`/getRoomData.php?roomId=${roomId}`).then(r => r.json());

	document.getElementById('room-name').innerText = `${res.room.name} (${res.room.id})`

	// Loop for all the existing peers and make sure that they match. If so, setup several connections per peer
	for (const member of res.members) {
		console.log(member.id, currentUserId, Object.keys(peerConnections))
		if (member.id === currentUserId) {
			continue;
		}
		const conn = us.connect(PEER_ID_SALT + member.id, {
			reliable: true
		});
		setupConnection(conn);
	}

	const chatContainer = document.getElementById('chat-container');
	chatContainer.innerHTML = ''
	for (const message of res.messages) {
		chatContainer.appendChild(createMessageElement(message.author, message.body, []))
	}
}

function createMessageElement(author, body, files) {
	const el = document.createElement('div')
	el.innerHTML = `
		<details class="pmenu above">
			<div class="author-details">
				<h3>${author}</h3>
				<!-- <p>email: <a href="mailto:bsmith@scu.edu">bsmith@scu.edu</a></p> -->
				<p><span class="link colored">Send direct message</span></p>
			</div>
			<summary>
				<span class="author subtext">${author}</span>
			</summary>
		</details>
		<div class="body"> ${body} </div>
		<div class="files"></div>
	`
	return el
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
			document
				.getElementById("chat-container")
				.appendChild(
					createMessageElement(msg.data.authorId, msg.data.content, [])
				);
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
