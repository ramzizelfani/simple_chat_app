const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const usersList = document.getElementById('users');
const socket = io();

//Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

//Join a Room
socket.emit('joinRoom', { username, room });

//Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});
// Get Messsage from server
socket.on('message', message => {
  console.log(message);
  outputMessage(message);
  //Scroll down automatically
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//Submit a message
chatForm.addEventListener('submit', e => {
  //prevent default behavior
  e.preventDefault();
  //Get message value
  const msg = e.target.elements.msg.value;

  //emit message to the server
  socket.emit('chatMessage', msg);
  //Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

//Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `
    <p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
         ${message.text}
    </p>`;
  //Append the div element to the DOM
  chatMessages.appendChild(div);
}

//Output Room Name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Output users List to DOM
function outputUsers(users) {
  usersList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}`;
}
