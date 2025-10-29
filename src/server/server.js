import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

io.on('connection', socket => {
  console.log('New client connected:', socket.id);
  socket.emit('me', socket.id);

  socket.on('disconnect', () => {
    const roomId = socket.roomId;
    if (roomId) {
      console.log(`${socket.name} (${socket.id}) disconnected from ${roomId}`);
      socket.to(roomId).emit('userLeft', socket.id);
    }
    // Clean up sharing state
    socket.isSharing = false;
  });
  socket.on('chatMessage', ({ roomId, sender, message }) => {
    // Phát cho tất cả client trong room (cả người gửi)
    io.to(roomId).emit('chatMessage', {
      sender,
      message,
      timestamp: Date.now(),
    });
  });

  // ---- GROUP CALL CODE ----
  socket.on('joinRoom', ({ roomId, name }) => {
    socket.join(roomId);
    socket.roomId = roomId;
    socket.name = name || 'Anonymous';

    console.log(`${name} (${socket.id}) joined ${roomId}`);

    // Get all users in room (including the new user)
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

    // Send list of OTHER users to the new user
    const otherUsers = clients
      .filter(id => id !== socket.id)
      .map(id => {
        const clientSocket = io.sockets.sockets.get(id);
        return {
          userId: id,
          isSharing: clientSocket ? clientSocket.isSharing : false,
        };
      });

    socket.emit('allUsers', otherUsers); // Gửi kèm trạng thái sharing cho từng user

    // Check if any existing user is sharing screen
    // Send screen share status of all users to the new user
    clients.forEach(clientId => {
      if (clientId !== socket.id) {
        const clientSocket = io.sockets.sockets.get(clientId);
        if (clientSocket && clientSocket.isSharing) {
          console.log(`Notifying ${socket.id} that ${clientId} is sharing`);
          socket.emit('peerScreenShareStatus', {
            userId: clientId,
            isSharing: true,
          });
        }
      }
    });

    // Notify ALL existing users about the new user
    socket.to(roomId).emit('userJoined', {
      id: socket.id,
      name: socket.name,
    });
  });

  socket.on('signal', data => {
    const targetId = data.targetId;
    if (targetId) {
      // Forward the signal to the target peer
      io.to(targetId).emit('signal', {
        from: socket.id,
        signal: data.signal,
      });
    }
  });

  // Broadcast screen share status
  socket.on('screenShareStatus', ({ roomId, isSharing, userId }) => {
    console.log(
      `${socket.name} (${socket.id}) ${isSharing ? 'started' : 'stopped'} screen sharing`
    );

    // Store sharing state on socket
    socket.isSharing = isSharing;

    // Broadcast to ALL users in room (including sender for confirmation)
    io.in(roomId).emit('peerScreenShareStatus', {
      userId: socket.id,
      isSharing: isSharing,
    });
  });

  socket.on('leaveRoom', () => {
    const roomId = socket.roomId;
    if (roomId) {
      console.log(`${socket.name} (${socket.id}) left ${roomId}`);
      socket.leave(roomId);
      socket.to(roomId).emit('userLeft', socket.id);
      socket.roomId = null;
    }
  });
});

server.listen(5000, () => console.log('Server is running on port 5000'));
