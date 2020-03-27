const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

// Variables Initialization
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const PORT = process.env.PORT || 3000;

//Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

const chatBotName = 'Simple Chat Bot';

//socket.io Events
//Listening for client connection
/**
 * If you would like to emit a message to the single user that connects to the server use socket.emit()
 * If you would like to emit a message to everybody excepts the user who just connected to the server use socket.broadcast.emit()
 * If you would like to broadcast to everybody use io.emit()
 */
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    //Join room
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    //Welcome connect user
    socket.emit(
      'message',
      formatMessage(chatBotName, 'Welcome to Simple Chat App!!!')
    );

    //Broadcat when a user connects
    //To broadcast to a specific room, you need to use socket.broadcast.to('roomName').emit()
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(chatBotName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  //Listen for incoming chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  //Handling User disconnect Events
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(chatBotName, `${user.username} has disconnected`)
      );

      // Send users and room info
      socket.broadcast.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

server.listen(PORT, () =>
  console.log(`Server is up and running on port ${PORT}`)
);
