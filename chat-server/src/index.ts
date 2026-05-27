import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import { prisma } from "./config/prisma";
import { verifyToken } from "./config/firebase";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict to your frontend URL
    methods: ["GET", "POST"]
  }
});

// Middleware for Socket Authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error: No token provided"));
    
    const decoded = await verifyToken(token);
    socket.data.user = decoded;
    next();
  } catch (err) {
    next(new Error("Authentication error: Invalid token"));
  }
});

io.on("connection", (socket: Socket) => {
  console.log(`User connected: ${socket.data.user.uid} (${socket.id})`);

  // Join a personal room based on their uid to receive global notifications
  socket.join(socket.data.user.uid);

  // Join a specific conversation room
  socket.on("join_conversation", (conversationId: string) => {
    socket.join(conversationId);
    console.log(`User ${socket.data.user.uid} joined conversation ${conversationId}`);
  });

  // Handle typing indicator
  socket.on("typing", ({ conversationId, isTyping }) => {
    socket.to(conversationId).emit("typing", {
      userId: socket.data.user.uid,
      isTyping
    });
  });

  // Handle sending a message
  socket.on("send_message", async (data: { conversationId: string; text: string }) => {
    try {
      const { conversationId, text } = data;
      const senderId = socket.data.user.uid;

      // 1. Save message to PostgreSQL
      const message = await prisma.message.create({
        data: {
          conversationId,
          senderId,
          text,
          read: false
        }
      });

      // 2. Update conversation's last message and timestamp
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessage: text,
          updatedAt: new Date()
        }
      });

      // 3. Broadcast to everyone in the conversation room including sender
      io.to(conversationId).emit("receive_message", message);
      
      // 4. Notify recipient globally if they are online
      // We find the recipient from the conversation
      const conv = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { participants: true }
      });
      const recipient = conv?.participants.find(p => p.userId !== senderId);
      if (recipient) {
        // Emit global notification to their personal room
        io.to(recipient.userId).emit("new_message_notification", {
          ...message,
          senderName: socket.data.user.name || "Someone"
        });
      }

    } catch (err) {
      console.error("Error sending message:", err);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.data.user.uid} (${socket.id})`);
  });
});

// ── REST API Routes (for initial fetches) ──

// Get all conversations for the user
app.get("/api/conversations", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
    const token = authHeader.split("Bearer ")[1];
    const decoded = await verifyToken(token);

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: decoded.uid }
        }
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, avatar: true } }
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    res.json(conversations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get total unread message count across all conversations
app.get("/api/conversations/unread-count", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
    const token = authHeader.split("Bearer ")[1];
    const decoded = await verifyToken(token);

    const count = await prisma.message.count({
      where: {
        read: false,
        senderId: { not: decoded.uid },
        conversation: {
          participants: {
            some: { userId: decoded.uid }
          }
        }
      }
    });

    res.json({ unreadCount: count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get messages for a conversation
app.get("/api/conversations/:id/messages", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
    const token = authHeader.split("Bearer ")[1];
    const decoded = await verifyToken(token);
    
    const { id } = req.params;

    // Verify user is part of the conversation
    const isParticipant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId: id, userId: decoded.uid }
      }
    });

    if (!isParticipant) return res.status(403).json({ error: "Forbidden" });

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" }
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: decoded.uid },
        read: false
      },
      data: { read: true }
    });

    res.json(messages);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Start a new conversation or get existing one
app.post("/api/conversations", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
    const token = authHeader.split("Bearer ")[1];
    const decoded = await verifyToken(token);

    const { recipientId } = req.body;
    if (!recipientId) return res.status(400).json({ error: "recipientId is required" });

    // Check if conversation already exists between these two
    // This is a simplified check assuming 1-on-1 chats
    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: decoded.uid } } },
          { participants: { some: { userId: recipientId } } }
        ]
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, avatar: true } }
          }
        }
      }
    });

    if (existing) {
      return res.json(existing);
    }

    // Create new conversation
    const newConv = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId: decoded.uid },
            { userId: recipientId }
          ]
        }
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, avatar: true } }
          }
        }
      }
    });

    res.status(201).json(newConv);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Chat server running on port ${PORT}`);
});
