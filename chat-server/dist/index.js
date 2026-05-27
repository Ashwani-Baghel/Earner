"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const prisma_1 = require("./config/prisma");
const firebase_1 = require("./config/firebase");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*", // In production, restrict to your frontend URL
        methods: ["GET", "POST"]
    }
});
// Middleware for Socket Authentication
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token)
            return next(new Error("Authentication error: No token provided"));
        const decoded = await (0, firebase_1.verifyToken)(token);
        socket.data.user = decoded;
        next();
    }
    catch (err) {
        next(new Error("Authentication error: Invalid token"));
    }
});
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.data.user.uid} (${socket.id})`);
    // Join a specific conversation room
    socket.on("join_conversation", (conversationId) => {
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
    socket.on("send_message", async (data) => {
        try {
            const { conversationId, text } = data;
            const senderId = socket.data.user.uid;
            // 1. Save message to PostgreSQL
            const message = await prisma_1.prisma.message.create({
                data: {
                    conversationId,
                    senderId,
                    text,
                    read: false
                }
            });
            // 2. Update conversation's last message and timestamp
            await prisma_1.prisma.conversation.update({
                where: { id: conversationId },
                data: {
                    lastMessage: text,
                    updatedAt: new Date()
                }
            });
            // 3. Broadcast to others in the room
            io.to(conversationId).emit("receive_message", message);
            // Also notify specific users if they are online but not in the room (Requires mapping users to sockets)
            // For a lightweight version, emitting to the room is sufficient if they are actively in the chat.
        }
        catch (err) {
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
        if (!authHeader?.startsWith("Bearer "))
            return res.status(401).json({ error: "Unauthorized" });
        const token = authHeader.split("Bearer ")[1];
        const decoded = await (0, firebase_1.verifyToken)(token);
        const conversations = await prisma_1.prisma.conversation.findMany({
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
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Get messages for a conversation
app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer "))
            return res.status(401).json({ error: "Unauthorized" });
        const token = authHeader.split("Bearer ")[1];
        const decoded = await (0, firebase_1.verifyToken)(token);
        const { id } = req.params;
        // Verify user is part of the conversation
        const isParticipant = await prisma_1.prisma.conversationParticipant.findUnique({
            where: {
                conversationId_userId: { conversationId: id, userId: decoded.uid }
            }
        });
        if (!isParticipant)
            return res.status(403).json({ error: "Forbidden" });
        const messages = await prisma_1.prisma.message.findMany({
            where: { conversationId: id },
            orderBy: { createdAt: "asc" }
        });
        res.json(messages);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Start a new conversation or get existing one
app.post("/api/conversations", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer "))
            return res.status(401).json({ error: "Unauthorized" });
        const token = authHeader.split("Bearer ")[1];
        const decoded = await (0, firebase_1.verifyToken)(token);
        const { recipientId } = req.body;
        if (!recipientId)
            return res.status(400).json({ error: "recipientId is required" });
        // Check if conversation already exists between these two
        // This is a simplified check assuming 1-on-1 chats
        const existing = await prisma_1.prisma.conversation.findFirst({
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
        const newConv = await prisma_1.prisma.conversation.create({
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
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Chat server running on port ${PORT}`);
});
