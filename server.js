const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {    // allows connections from different domains
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const port = 3000;

// Store messages in memory (replace with a database in a real application)
const messages = [];

io.on('connection', (socket) => {
  console.log('A user connected');

  // Send existing messages to the new client
  socket.emit('loadMessages', messages);

  socket.on('sendMessage', (message) => {
    console.log('Received message:', message);
    messages.push(message);
    io.emit('receiveMessage', message); // Broadcast to all clients
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});