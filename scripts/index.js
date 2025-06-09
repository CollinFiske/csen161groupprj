/** 
 * This is enough to give you autocomplete in some editors if you have types for
 * peerjs installed (run `npm install` from the terminal).
 *
 * @import { Peer } from 'peerjs'
 */

import { getUserId } from './utils.js'

// Setting up global variable
const PEER_ID_SALT = 'kfljdfjkj34w0pl8akw6vcv2n_' // by default, everyone using PeerJS uses the same ICE server, so this helps us avoid naming conflicts
let currentRoomId = null;
let currentUserId = null;
let peerConnections =  {}; // empty object for now of all peer connections at the moment. Gonna consist of key: peerId as well as value: DataConnection
let currentRoomMembers = [] // { id, name } all of the members in a room

const getName = () => {
    return document.getElementById('currentName').value ?? ''
}

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
	if (e.key === 'Enter' && !e.shiftKey) {
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
		el.setAttribute('data-room-id', room.id)
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
					<div class="item danger">
                        <a href="/leaveRoom.php?roomId=${room.id}" style="color: inherit; text-decoration: inherit;">Leave</a>
                    </div>
				</div>
			</details>
			<div class="subtitle subtext">${room.description || 'No description given.'}</div>
		`
		container.appendChild(el)
	}
}

async function leaveRoom(roomId) {
    window.location.href = `/leaveRoom.php?id=${roomId}`
}

// Next we focus on sending a message for when it is written

async function sendMessage () {
	const content = messageBox.value.trim();
	if (!content) {
		return;
	}

	const messageData = {
		authorId: currentUserId,
        authorName: getName(),
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
			createMessageElement(messageData.authorName, messageData.content, messageData.timestamp, [])
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

    document.querySelectorAll('*[data-room-id]').forEach(e => e.classList.remove('active'))
    document.querySelector(`*[data-room-id="${roomId}"]`)?.classList.add('active')

	// For all existing messages already, we need to fetch them! This can be done by getting them from the database via results from getPeers.php
	const res = await fetch(`/getRoomData.php?roomId=${roomId}`).then(r => r.json());

    currentRoomMembers = res.members

	document.getElementById('room-name').innerHTML = `${res.room.name} (Room ID: ${res.room.id})`

	// Loop for all the existing peers and make sure that they match. If so, setup several connections per peer
	for (const member of res.members) {
		console.log(member.id, currentUserId, Object.keys(peerConnections))
		if (member.id === currentUserId) {
			continue;
		}
        const pid = PEER_ID_SALT + member.id
        console.log({ pid }, peerConnections)
        if (!(pid in peerConnections)) {
            console.log('connect to', pid)
            const conn = us.connect(pid);
            setupConnection(conn);
        }
	}

	const chatContainer = document.getElementById('chat-container');
	chatContainer.innerHTML = ''
	for (const message of res.messages) {
		chatContainer.appendChild(createMessageElement(message.authorName, message.body, message.timestamp, []))
	}

        updateRoomStats()
}

function createMessageElement(author, body, timestamp, files) {
	const el = document.createElement('div')
    el.classList.add('message')
    const time = new Date(parseInt(`${timestamp}`))
	el.innerHTML = `
		<details class="pmenu above author">
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
		<div class="timestamp"> ${time.getHours() % 11 + 1}:${time.getMinutes().toString().padStart(2, '0')} </div>
		<!-- <div class="files"></div> -->
	`
	return el
}

// The following is used to setup the listeners for the incoming connections and to handle it when it occurs

// A listener is created for preparation of receiving a message
us.on('connection', (conn) => {
    console.log(conn.peer, 'has connected to us')
    conn.on('open', () => {
        conn.send('oh hi')
    })
	// setupConnection(conn);
});

us.on('data', dat => {
    console.log('we got', dat)
})

us.on('open', () => {
    console.log(us.id)
    const id = new URL(window.location.href).searchParams.get('id')
    if (id) {
        const conn = us.connect(id)
        console.log('truing to connect to', id)
        conn.on('open', () => {
            console.log('sending', 'hi there', id)
            conn.send('hi there');
        })
        conn.on('data', dat => {
            console.log('....they sent', dat)
        })
    }
})

// Function is used to setup connections via the connection object that is defined by the peerId at a given point
function setupConnection(conn) {
    return;
	conn.on('open', () => {
		peerConnections[conn.peer] = conn;
        console.log('good morning', conn.peer)
        updateRoomStats()
	});

    conn.on('close', () => {
        delete peerConnections[conn.peer]
        updateRoomStats()
    })

	conn.on('data', (msg) => {
        console.log('message from', conn.peer)
		if (msg.type === 'message') {
			document
				.getElementById("chat-container")
				.appendChild(
					createMessageElement(msg.data.author, msg.data.content, msg.data.timestamp, [])
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
        const onlineCount = Object.values(peerConnections).filter(c => c.open).length + 1; // include self of course

        const onlineTag = document.getElementById("online-now");
        onlineTag.innerHTML = currentRoomMembers.length + ` Member${currentRoomMembers.length == 1 ? '' : 's'} (` + onlineCount + " here now)"; 

        document.getElementById('member-list').innerHTML = currentRoomMembers
                .map(m => `
                        <div
                                class="
                                        member
                                        ${(peerConnections[PEER_ID_SALT + m.id]?.open || m.id == currentUserId) ? 'active' : ''}
                                        ${m.id == currentUserId ? 'self' : ''}
                                "
                        >
                                <div class="dot "></div>
                                <span class="name">${m.name}</span>
                                ${m.admin ? `<span class="badge">Host</span>` : ''}
                        </div>
                `)
                .join('')
}

