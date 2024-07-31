const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const net = require('net');
const bodyParser = require('body-parser');



const app = express();
const server = http.createServer(app);
const io = socketIo(server);
// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static('public'));

// API endpoint to receive data via HTTP POST
app.post('/api/data', (req, res) => {
     const data = req.body;
     console.log('Received data via API:', data);
   
     // Emit data to all connected clients
     io.emit('data', data);
   
     res.status(200).send('Data received');
   });

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
   })

// Create a TCP server
const tcpServer = net.createServer((socket) => {
  console.log('A TCP client connected');

  socket.on('data', (data) => {
    const receivedData = data.toString().trim();
    console.log('Received data via TCP:', receivedData);

    // Emit received data to all connected WebSocket clients
    io.emit('data', { message: receivedData });
  });

  socket.on('end', () => {
    console.log('TCP client disconnected');
  });

  socket.on('error', (err) => {
    console.error('TCP client error:', err);
  });
});

tcpServer.listen(3001, () => {
  console.log('TCP server listening on port 3001');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`HTTP server running on port ${PORT}`);
});
