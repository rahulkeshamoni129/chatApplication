import { Server } from "socket.io"
import http from "http"
import express from "express"
import Conversation from "../models/conversation.model.js"



const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3001", "http://localhost:3002"],
        methods: ["GET", "POST"]
    }
})

//realtime msg code
const users = {}
const getReceiverSocketId = (receiverId) => {
    return users[receiverId]
}
export default getReceiverSocketId
//used to listen the evenets on the server side
io.on("connection", (socket) => {
    console.log("A user connected", socket.id)
    const userId = socket.handshake.query.userId
    if (userId) {
        users[userId] = socket.id;
        console.log("Hello", users)
    }
    io.emit("getOnlineUsers", Object.keys(users))
    //used to listen clien side evenets on server side
    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.id)
        delete users[userId]
        io.emit("getOnlineUsers", Object.keys(users))
    })

    // Typing Indicators
    socket.on("typing", async ({ senderId, receiverId, isGroup }) => {
        if (isGroup) {
            const conversation = await Conversation.findById(receiverId);
            if (conversation) {
                conversation.members.forEach(memberId => {
                    if (memberId.toString() !== senderId.toString()) {
                        const socketId = getReceiverSocketId(memberId);
                        if (socketId) io.to(socketId).emit("userTyping", { senderId, receiverId });
                    }
                });
            }
        } else {
            const receiverSocketId = getReceiverSocketId(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("userTyping", { senderId });
            }
        }
    });

    socket.on("stopTyping", async ({ senderId, receiverId, isGroup }) => {
        if (isGroup) {
            const conversation = await Conversation.findById(receiverId);
            if (conversation) {
                conversation.members.forEach(memberId => {
                    if (memberId.toString() !== senderId.toString()) {
                        const socketId = getReceiverSocketId(memberId);
                        if (socketId) io.to(socketId).emit("userStopTyping", { senderId, receiverId });
                    }
                });
            }
        } else {
            const receiverSocketId = getReceiverSocketId(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("userStopTyping", { senderId });
            }
        }
    });
})
export { app, server, io }