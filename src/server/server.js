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
    const otherUsers = clients.filter(id => id !== socket.id);
    console.log(`Sending to ${socket.id}, other users:`, otherUsers);
    socket.emit('allUsers', otherUsers);

    // Notify ONLY the new user about existing peers
    // (they will initiate connections to all existing users)
    
    // Notify ALL existing users about the new user
    // (they will wait for connection from the new user)
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