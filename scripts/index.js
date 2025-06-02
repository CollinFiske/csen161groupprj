/** 
 * This is enough to give you autocomplete in some editors if you have types for
 * peerjs instealled (run `npm install` from the terminal).
 *
 * @import { Peer } from 'peerjs'
 */

const us = new Peer()


// https://stackoverflow.com/a/25621277
const messageBox = document.getElementById('message-box')
messageBox.style.height = messageBox.scrollHeight + 'px'
messageBox.style.overflowY = 'hidden'
messageBox.addEventListener('input', () => {
	messageBox.style.height = 'auto'
	messageBox.style.height = messageBox.scrollHeight + 'px'
})
