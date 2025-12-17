import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const recorders = {};
const chatHistory = {};
// Waiting room: roomId -> { hostSocketId, waitingGuests: [...] }
const waitingRooms = {};
// Room hosts: roomId -> hostSocketId
const roomHosts = {};
const roomMetadata = {};

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'https://collabsphere.space'],
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

      // If this was the host, close the entire room
      if (roomHosts[roomId] === socket.id) {
        console.log(
          `🏠 Host of room ${roomId} disconnected - closing room for all users`
        );

        // Notify all users in the room that the host left and room is closed
        socket.to(roomId).emit('room-closed', {
          roomId,
          reason: 'Host has left the meeting',
        });

        delete roomHosts[roomId];
        delete roomMetadata[roomId];
      }

      // Notify host if a waiting guest disconnected
      if (waitingRooms[roomId]) {
        const wasWaiting = waitingRooms[roomId].find(
          g => g.socketId === socket.id
        );
        if (wasWaiting) {
          waitingRooms[roomId] = waitingRooms[roomId].filter(
            g => g.socketId !== socket.id
          );
          const hostSocketId = roomHosts[roomId];
          if (hostSocketId) {
            io.to(hostSocketId).emit('waiting-guest-disconnected', {
              guestSocketId: socket.id,
              roomId,
            });
          }
        }
      }

      const clientsInRoom = io.sockets.adapter.rooms.get(roomId);
      // Delete history if no one is left in the room
      if (!clientsInRoom || clientsInRoom.size === 0) {
        console.log(`🗑️ Room ${roomId} is empty, cleaning up`);
        delete chatHistory[roomId];
        delete waitingRooms[roomId];
        delete roomHosts[roomId];
      }
    }
    socket.isSharing = false;
    for (const [roomId, recorderId] of Object.entries(recorders)) {
      if (recorderId === socket.id) {
        delete recorders[roomId];
        io.to(roomId).emit('recordStopped', { userId: socket.id });
      }
    }
  });

  socket.on('chatMessage', ({ roomId, sender, message }) => {
    const chatMsg = {
      sender,
      message,
      timestamp: new Date().toISOString(),
      userId: socket.id,
    };

    // Save to history
    if (!chatHistory[roomId]) {
      chatHistory[roomId] = [];
    }
    chatHistory[roomId].push(chatMsg);

    // Limit quantity (optional)
    const MAX_MESSAGES = 100;
    if (chatHistory[roomId].length > MAX_MESSAGES) {
      chatHistory[roomId] = chatHistory[roomId].slice(-MAX_MESSAGES);
    }

    // Broadcast to all
    io.to(roomId).emit('chatMessage', chatMsg);
  });
  socket.on('requestChatHistory', roomId => {
    const history = chatHistory[roomId] || [];
    socket.emit('chatHistory', history);
    console.log(`✅ Sent ${history.length} messages to ${socket.id}`);
  });

  socket.on('joinRoom', ({ roomId, name, isHost, teamId }) => {
    socket.join(roomId);
    socket.roomId = roomId;
    socket.name = name || 'Anonymous';

    console.log(
      `${name} (${socket.id}) joined ${roomId}${isHost ? ' as HOST' : ''}`
    );

    // If this user is the host, register them
    if (isHost) {
      roomHosts[roomId] = socket.id;
      roomMetadata[roomId] = {
        teamId: teamId,
        hostSocketId: socket.id,
        createdAt: new Date().toISOString(),
      };
      console.log(`🏠 ${name} is now the host of room ${roomId}`);
      console.log(`📋 Room metadata saved:`, roomMetadata[roomId]);
    }

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

    // Notify existing users in the room about the new user
    socket.to(roomId).emit('userJoined', {
      id: socket.id,
      name: socket.name,
    });
  });

  // ==================== WAITING ROOM EVENTS ====================

  // Guest requests to join a room
  socket.on(
    'request-to-join',
    ({ roomId, guestId, guestName, guestSocketId }) => {
      console.log(
        `📥 ${guestName} (${guestSocketId}) requesting to join room ${roomId}`
      );
      console.log(`📊 Current roomHosts:`, roomHosts);
      console.log(`📊 Current waitingRooms:`, waitingRooms);

      // Store guest in waiting room
      if (!waitingRooms[roomId]) {
        waitingRooms[roomId] = [];
      }

      // Avoid duplicate entries
      const existingGuest = waitingRooms[roomId].find(
        g => g.socketId === guestSocketId
      );
      if (!existingGuest) {
        waitingRooms[roomId].push({
          id: guestId,
          name: guestName,
          socketId: guestSocketId,
          requestedAt: new Date(),
        });
        console.log(
          `📊 Added guest to waiting room. Total waiting: ${waitingRooms[roomId].length}`
        );
      } else {
        console.log(`📊 Guest already in waiting room, skipping`);
      }

      // Find the host and notify them
      const hostSocketId = roomHosts[roomId];
      console.log(
        `📊 Looking for host of room ${roomId}: ${hostSocketId || 'NOT FOUND'}`
      );

      if (hostSocketId) {
        // Check if host is still connected
        const hostSocket = io.sockets.sockets.get(hostSocketId);
        if (hostSocket) {
          io.to(hostSocketId).emit('join-request', {
            guestId,
            guestName,
            guestSocketId,
            roomId,
          });
          console.log(`📤 Notified host ${hostSocketId} about join request`);
        } else {
          console.log(
            `⚠️ Host socket ${hostSocketId} not found, broadcasting to room`
          );
          delete roomHosts[roomId]; // Clean up stale host reference
          io.to(roomId).emit('join-request', {
            guestId,
            guestName,
            guestSocketId,
            roomId,
          });
        }
      } else {
        // No host found - try to notify all users in the room
        io.to(roomId).emit('join-request', {
          guestId,
          guestName,
          guestSocketId,
          roomId,
        });
        console.log(`📤 Broadcast join request to all users in room ${roomId}`);
      }
    }
  );

  // Host approves a guest
  socket.on(
    'approve-guest',
    ({ roomId, guestSocketId, guestId, guestName }) => {
      console.log(
        `✅ Host approved ${guestName} (${guestSocketId}) to join room ${roomId}`
      );

      // Remove from waiting room
      if (waitingRooms[roomId]) {
        waitingRooms[roomId] = waitingRooms[roomId].filter(
          g => g.socketId !== guestSocketId
        );
      }

      // Notify the guest they're approved
      io.to(guestSocketId).emit('join-approved', {
        roomId,
        approvedBy: socket.id,
      });
    }
  );

  // Host rejects a guest
  socket.on('reject-guest', ({ roomId, guestSocketId, guestId }) => {
    console.log(`❌ Host rejected guest ${guestSocketId} from room ${roomId}`);

    // Remove from waiting room
    if (waitingRooms[roomId]) {
      waitingRooms[roomId] = waitingRooms[roomId].filter(
        g => g.socketId !== guestSocketId
      );
    }

    // Notify the guest they're rejected
    io.to(guestSocketId).emit('join-rejected', {
      roomId,
      rejectedBy: socket.id,
    });
  });

  // Guest cancels their join request
  socket.on('cancel-join-request', ({ roomId, guestSocketId }) => {
    console.log(
      `🚫 Guest ${guestSocketId} cancelled join request for room ${roomId}`
    );

    // Remove from waiting room
    if (waitingRooms[roomId]) {
      waitingRooms[roomId] = waitingRooms[roomId].filter(
        g => g.socketId !== guestSocketId
      );
    }

    // Notify host that request was cancelled
    const hostSocketId = roomHosts[roomId];
    if (hostSocketId) {
      io.to(hostSocketId).emit('request-cancelled', {
        guestSocketId,
        roomId,
      });
    } else {
      io.to(roomId).emit('request-cancelled', {
        guestSocketId,
        roomId,
      });
    }
  });

  // ==================== END WAITING ROOM EVENTS ====================

  socket.on('signal', data => {
    const targetId = data.targetId;
    if (targetId) {
      io.to(targetId).emit('signal', {
        from: socket.id,
        signal: data.signal,
      });
    }
  });

  // ✅ New Handler: Request screen track
  socket.on('requestScreenTrack', ({ targetId }) => {
    console.log(`${socket.id} requesting screen track from ${targetId}`);
    io.to(targetId).emit('requestScreenTrack', {
      requesterId: socket.id,
    });
  });

  socket.on('screenShareStatus', ({ roomId, isSharing }) => {
    console.log(
      `${socket.name} (${socket.id}) ${isSharing ? 'started' : 'stopped'} screen sharing`
    );

    socket.isSharing = isSharing;

    io.in(roomId).emit('peerScreenShareStatus', {
      userId: socket.id,
      isSharing: isSharing,
    });
  });
  socket.on('requestStartRecord', (roomId, callback) => {
    // If someone is already recording, deny; otherwise allow and save recorder ID
    if (recorders[roomId]) {
      callback({ success: false, message: 'Someone is already recording.' });
      return;
    }
    recorders[roomId] = socket.id;
    io.to(roomId).emit('recordStarted', { userId: socket.id });
    callback({ success: true });
  });

  socket.on('requestStopRecord', roomId => {
    if (recorders[roomId] === socket.id) {
      delete recorders[roomId];
      io.to(roomId).emit('recordStopped', { userId: socket.id });
    }
  });

  socket.on('leaveRoom', () => {
    const roomId = socket.roomId;
    if (roomId) {
      console.log(`${socket.name} (${socket.id}) left ${roomId}`);

      // If this was the host, close the entire room
      if (roomHosts[roomId] === socket.id) {
        console.log(
          `🏠 Host of room ${roomId} left - closing room for all users`
        );

        // Notify all users in the room that the host left
        socket.to(roomId).emit('room-closed', {
          roomId,
          reason: 'Host has left the meeting',
        });

        delete roomHosts[roomId];
      }

      socket.leave(roomId);
      socket.to(roomId).emit('userLeft', socket.id);
      socket.roomId = null;
    }
  });

  socket.on('check-team-access', ({ roomId, userTeamId }, callback) => {
    console.log(
      `🔍 [SERVER] Team access check: Room ${roomId}, User team ${userTeamId}`
    );

    const metadata = roomMetadata[roomId];

    if (!metadata) {
      console.log(`⚠️ [SERVER] No metadata found for room ${roomId}`);
      callback({
        hasDirectAccess: true, // Allow if no metadata (backward compat)
        reason: 'no_metadata',
      });
      return;
    }

    const roomTeamId = metadata.teamId;
    const hasDirectAccess = Number(userTeamId) === Number(roomTeamId);

    console.log(`🎯 [SERVER] Access decision:`, {
      roomTeamId,
      userTeamId,
      hasDirectAccess,
    });

    callback({
      hasDirectAccess,
      roomTeamId,
      reason: hasDirectAccess ? 'same_team' : 'different_team',
    });
  });

  socket.on('get-room-metadata', ({ roomId }, callback) => {
    console.log(`🔍 [SERVER] Metadata requested for room: ${roomId}`);

    const metadata = roomMetadata[roomId];

    if (!metadata) {
      console.log(`⚠️ [SERVER] No metadata found for room ${roomId}`);
      callback({
        success: false,
        error: 'Room not found or has no metadata',
      });
      return;
    }

    console.log(`✅ [SERVER] Returning metadata for room ${roomId}:`, metadata);
    callback({
      success: true,
      teamId: metadata.teamId,
      hostSocketId: metadata.hostSocketId,
      createdAt: metadata.createdAt,
    });
  });

  // Check if a room exists (has active users and valid host)
  socket.on('check-room-exists', ({ roomId }, callback) => {
    const clientsInRoom = io.sockets.adapter.rooms.get(roomId);
    const exists = clientsInRoom && clientsInRoom.size > 0;
    const hostSocketId = roomHosts[roomId];

    // Verify host is still actually connected
    let hasHost = false;
    if (hostSocketId) {
      const hostSocket = io.sockets.sockets.get(hostSocketId);
      if (hostSocket && hostSocket.connected) {
        hasHost = true;
      } else {
        // Host reference is stale, clean it up
        console.log(`🧹 Cleaning up stale host reference for room ${roomId}`);
        delete roomHosts[roomId];
      }
    }

    console.log(
      `🔍 Checking room ${roomId}: exists=${exists}, hasHost=${hasHost}, users=${clientsInRoom?.size || 0}`
    );

    callback({
      exists,
      hasHost,
      userCount: clientsInRoom?.size || 0,
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
