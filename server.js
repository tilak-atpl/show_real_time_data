const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const net = require('net');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle incoming data from Socket.io
  socket.on('sendData', (data) => {
    console.log('Received data via WebSocket:', data);
    io.emit('data', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Create a TCP server
const tcpServer = net.createServer((socket) => {
  console.log('TCP client connected');

  socket.on('data', (data) => {
    const receivedData = data.toString().trim();
    console.log('Received data via TCP:', receivedData);

    // Optionally, parse the data if it's in a specific format
    // For now, we'll just emit it as-is
    io.emit('data', { message: receivedData });
  });

  socket.on('end', () => {
    console.log('TCP client disconnected');
  });

  socket.on('error', (err) => {
    console.error('TCP client error:', err);
    io.emit('data', { message: err });
  });
});

tcpServer.listen(3001, () => {
  console.log('TCP server listening on port 3001');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`HTTP server running on port ${PORT}`);
});
