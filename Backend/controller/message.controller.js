import { response } from "express";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import getReceiverSocketId from "../SockedIo/server.js"
import { io } from "../SockedIo/server.js"


export const sendMessage = async (req, res) => {
    //console.log("Message sent",req.params.id,req.body.message);
    try {
        const { message, replyTo } = req.body;
        const { id: receiverId } = req.params;//to whom we are sending the message
        const senderId = req.user._id;//currently logged in user
        let conversation = await Conversation.findOne({
            members: { $all: [senderId, receiverId] }
        })
        if (!conversation) {
            conversation = await Conversation.create({
                members: [senderId, receiverId]
            });
        }
        const newMessage = new Message({
            senderId,
            receiverId,
            message,
            replyTo: replyTo || null
        })
        if (newMessage) {
            conversation.messages.push(newMessage._id);
        }
        await Promise.all(
            [conversation.save(), newMessage.save()]
        );

        // Populate replyTo for socket emit and response
        if (replyTo) {
            await newMessage.populate({
                path: 'replyTo',
                select: 'message senderId'
            });
        }

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }
        res.status(201).json({
            message: "Message send successfully",
            newMessage
        });
    } catch (error) {
        console.log("Error in sendMessage", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMessage = async (req, res) => {
    try {
        const { id: chatUser } = req.params;
        const senderId = req.user._id;
        let conversation = await Conversation.findOne({
            members: { $all: [senderId, chatUser] }
        }).populate({
            path: 'messages',
            populate: {
                path: 'replyTo',
                select: 'message senderId'
            }
        });
        if (!conversation) {
            return res.status(201).json([]);//returning empty becoz they did not chat till data
        }
        const messages = conversation.messages;
        res.status(201).json(messages);

    } catch (error) {
        console.log("Error in get Message", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const senderId = req.user._id;
        const message = await Message.findById(id);
        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }
        if (message.senderId.toString() !== senderId.toString()) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        await Message.findByIdAndDelete(id);

        await Conversation.updateOne(
            { messages: id },
            { $pull: { messages: id } }
        );

        const receiverSocketId = getReceiverSocketId(message.receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("messageDeleted", id);
        }

        res.status(200).json({ message: "Message deleted successfully", messageId: id });
    } catch (error) {
        console.log("Error in deleteMessage", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const markMessagesAsSeen = async (req, res) => {
    try {
        const { id: chatUser } = req.params;
        const senderId = req.user._id;

        const unseenMessages = await Message.find({
            senderId: chatUser,
            receiverId: senderId,
            seen: false
        });

        if (unseenMessages.length > 0) {
            await Message.updateMany(
                { senderId: chatUser, receiverId: senderId, seen: false },
                { $set: { seen: true } }
            );

            // Notify the sender that their messages were read
            const receiverSocketId = getReceiverSocketId(chatUser);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("messagesSeen", {
                    seenMessages: unseenMessages.map(msg => msg._id)
                });
            }
        }
        res.status(200).json({ message: "Messages marked as seen" });
    } catch (error) {
        console.log("Error in markMessagesAsSeen", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const editMessage = async (req, res) => {
    try {
        const { id } = req.params; // message ID
        const { message: newText } = req.body;
        const senderId = req.user._id;

        const message = await Message.findById(id);
        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }
        if (message.senderId.toString() !== senderId.toString()) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Limit to 5 mins
        const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (message.createdAt < fiveMinsAgo) {
            return res.status(400).json({ error: "You can only edit messages within 5 minutes" });
        }

        message.message = newText;
        message.edited = true;
        message.editedAt = new Date();
        await message.save();

        const receiverSocketId = getReceiverSocketId(message.receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("messageEdited", message);
        }

        res.status(200).json({ message: "Message updated", updatedMessage: message });
    } catch (error) {
        console.log("Error in editMessage: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const searchMessages = async (req, res) => {
    try {
        const { id: chatUser } = req.params;
        const { query } = req.query;
        const senderId = req.user._id;

        if (!query) return res.status(400).json({ error: "Search query required" });

        const messages = await Message.find({
            $and: [
                {
                    $or: [
                        { senderId: senderId, receiverId: chatUser },
                        { senderId: chatUser, receiverId: senderId }
                    ]
                },
                { $text: { $search: query } }
            ]
        }).sort({ createdAt: -1 });

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in searchMessages: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};