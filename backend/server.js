import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./database/connect.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import matchRoutes from "./routes/matches.js";
import requestRoutes from "./routes/requests.js";
import messageRoutes from "./routes/messages.js";
import conversationRoutes from "./routes/conversations.js";
import adminRoutes from "./routes/admin.js";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import { createMessage, markMessagesAsRead } from "./database/db.js";
//easy
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "SkillSwap API is running" });
});

// Create HTTP server so Socket.IO can attach
const httpServer = createServer(app);

// Socket.IO setup
const io = new SocketIOServer(httpServer, {
  cors: { origin: "*" },
});

// Simple map of userId -> Set(socketId)
const onlineUsers = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) return next();
  jwt.verify(
    token,
    process.env.JWT_SECRET || "your-secret-key",
    (err, user) => {
      if (err) return next();
      socket.user = user;
      next();
    }
  );
});

io.on("connection", (socket) => {
  const userId = socket.user?.id;
  if (userId) {
    const set = onlineUsers.get(userId) || new Set();
    set.add(socket.id);
    onlineUsers.set(userId, set);
  }

  // Join conversation room
  socket.on("joinConversation", (conversationId) => {
    if (!userId || !conversationId) return;
    socket.join(conversationId);
    console.log(`User ${userId} joined room ${conversationId}`);
  });

  // Leave conversation room
  socket.on("leaveConversation", (conversationId) => {
    if (!userId || !conversationId) return;
    socket.leave(conversationId);
  });

  socket.on("sendMessage", async (data, ack) => {
    try {
      // Data should contain the full message object returned from API
      // OR we can trust the client to send fields, but better to just relay
      // what the client got from POST /messages/send
      const { conversationId, text, senderId, receiverId, _id, createdAt } =
        data;

      if (!conversationId || !text) return;

      // Broadcast to everyone in the room (including sender if they have multiple tabs open,
      // but usually we want to emit to others).
      // broadcast.to(room) sends to everyone EXCEPT sender.
      // io.to(room) sends to everyone INCLUDING sender.

      socket.to(conversationId).emit("newMessage", {
        _id,
        conversationId,
        senderId,
        receiverId,
        text,
        createdAt,
      });

      ack && ack({ ok: true });
    } catch (err) {
      console.error("Socket sendMessage error:", err);
      ack && ack({ error: "Send failed" });
    }
  });

  // Handle messages seen
  socket.on("messagesSeen", async ({ conversationId, senderId }) => {
    // senderId here is the person who *sent* the messages (so we are marking their messages as read)
    // Or more simply: we (socket.user.id) have seen messages in 'conversationId'.
    if (!userId || !conversationId) return;

    try {
      await markMessagesAsRead(conversationId, userId);

      // Notify the other participant(s) in the room
      socket.to(conversationId).emit("messagesSeen", {
        conversationId,
        seenBy: userId,
        seenAt: new Date(),
      });
    } catch (err) {
      console.error("Socket messagesSeen error:", err);
    }
  });

  socket.on("disconnect", () => {
    if (userId) {
      const set = onlineUsers.get(userId);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) onlineUsers.delete(userId);
        else onlineUsers.set(userId, set);
      }
    }
  });
});

// Start HTTP server
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

httpServer.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. Please change the PORT in your .env`
    );
    process.exit(1);
  } else {
    console.error("Server error:", error);
    process.exit(1);
  }
});
