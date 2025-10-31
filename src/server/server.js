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
    socket.isSharing = false;
  });

  socket.on('chatMessage', ({ roomId, sender, message }) => {
    io.to(roomId).emit('chatMessage', {
      sender,
      message,
      timestamp: Date.now(),
    });
  });

  socket.on('joinRoom', ({ roomId, name }) => {
    socket.join(roomId);
    socket.roomId = roomId;
    socket.name = name || 'Anonymous';

    console.log(`${name} (${socket.id}) joined ${roomId}`);

    const clientsInRoom = io.sockets.adapter.rooms.get(roomId);
    
    const usersInRoom = [];
    const usersSharing = [];

    if (clientsInRoom) {
      for (const clientId of clientsInRoom) {
        const clientSocket = io.sockets.sockets.get(clientId);

        if (clientId !== socket.id) {
          usersInRoom.push({
            id: clientId,
            name: clientSocket?.name || 'Anonymous',
          });
        }

        if (clientSocket && clientSocket.isSharing) {
          usersSharing.push(clientId);
        }
      }
    }

    socket.emit('allUsers', { usersInRoom, usersSharing });
    
    // Thông báo cho những người cũ trong phòng biết có user mới
    socket.to(roomId).emit('userJoined', {
      id: socket.id,
      name: socket.name,
    });
  });

  socket.on('signal', data => {
    const targetId = data.targetId;
    if (targetId) {
      io.to(targetId).emit('signal', {
        from: socket.id,
        signal: data.signal,
      });
    }
  });

  // ✅ Handler mới: Yêu cầu screen track
  socket.on('requestScreenTrack', ({ targetId }) => {
    console.log(`${socket.id} requesting screen track from ${targetId}`);
    io.to(targetId).emit('requestScreenTrack', {
      requesterId: socket.id,
    });
  });

  socket.on('screenShareStatus', ({ roomId, isSharing, userId }) => {
    console.log(
      `${socket.name} (${socket.id}) ${isSharing ? 'started' : 'stopped'} screen sharing`
    );

    socket.isSharing = isSharing;

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