import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  socket.emit("me", socket.id);

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded");
  });

  socket.on("endCall", (data) => {
    io.to(data.to).emit("callEnded");
  });

  socket.on("callUser", (data) => {
    io.to(data.userToCall).emit("callUser", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });

  // ---- NEW GROUP CALL CODE ----
  socket.on("joinRoom", ({ roomId, name }) => {
    socket.join(roomId);
    socket.roomId = roomId;
    socket.name = name || "Anonymous";

    console.log(name + " joined " + roomId);

    // Send existing users list to the new user
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    const otherUsers = clients.filter((id) => id !== socket.id);

    // make sure it's always an array
    socket.emit("allUsers", otherUsers);

    // Notify others in room that a new user joined
    socket.to(roomId).emit("userJoined", {
      id: socket.id,
      name: socket.name,
    });
  });

  socket.on("signal", ({ targetId, signal }) => {
    io.to(targetId).emit("signal", { from: socket.id, signal });
  });

  socket.on("disconnect", () => {
    const roomId = socket.roomId;
    if (roomId) {
      socket.to(roomId).emit("userLeft", socket.id);
    }
  });

  socket.on("leaveRoom", () => {
    const roomId = socket.roomId;
    if (roomId) {
      socket.leave(roomId);
      socket.to(roomId).emit("userLeft", socket.id);
    }
  });
});

server.listen(5000, () => console.log("Server is running on port 5000"));
