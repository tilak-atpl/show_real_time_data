const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle custom WebSocket messages
  socket.on('message', (message) => {
     console.log('socket.on', message);
    try {
      const { event, data } = JSON.parse(message);
      if (event === 'sendData') {
        console.log('Received data:', data);
        // Emit data to all connected clients
        io.emit('data', data);
      }
    } catch (err) {
      console.error('Invalid message format:', message);
      io.emit('data', message);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
