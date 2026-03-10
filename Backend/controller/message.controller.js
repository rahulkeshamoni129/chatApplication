import User from "../models/user.model.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import getReceiverSocketId from "../SockedIo/server.js"
import { io } from "../SockedIo/server.js"


export const sendMessage = async (req, res) => {
    try {
        const { message, replyTo } = req.body;
        const { id: targetId } = req.params; // User ID or Group ID
        const senderId = req.user._id;

        let conversation = await Conversation.findOne({
            $or: [
                { _id: targetId },
                { members: { $all: [senderId, targetId] }, isGroup: false }
            ]
        });

        if (!conversation) {
            // Only create if it's a user-to-user chat
            const isUser = await User.exists({ _id: targetId });
            if (isUser) {
                conversation = await Conversation.create({
                    members: [senderId, targetId]
                });
            } else {
                return res.status(404).json({ error: "Conversation not found" });
            }
        }

        const newMessage = new Message({
            senderId,
            receiverId: targetId,
            message,
            replyTo: replyTo || null
        });

        if (newMessage) {
            conversation.messages.push(newMessage._id);
        }

        await Promise.all([conversation.save(), newMessage.save()]);

        if (replyTo) {
            await newMessage.populate({
                path: 'replyTo',
                select: 'message senderId'
            });
        }

        // Socket broadcast
        conversation.members.forEach(memberId => {
            if (memberId.toString() !== senderId.toString()) {
                const receiverSocketId = getReceiverSocketId(memberId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("newMessage", newMessage);
                }
            }
        });

        res.status(201).json({
            message: "Message sent successfully",
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
            $or: [
                { _id: chatUser },
                { members: { $all: [senderId, chatUser] }, isGroup: false }
            ]
        }).populate({
            path: 'messages',
            populate: {
                path: 'replyTo',
                select: 'message senderId'
            }
        });
        if (!conversation) {
            return res.status(200).json([]);
        }
        const messages = conversation.messages;
        res.status(200).json(messages);

    } catch (error) {
        console.log("Error in get Message", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const loggedInUser = req.user;
        const message = await Message.findById(id);
        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }

        // Allow if sender or admin
        if (message.senderId.toString() !== loggedInUser._id.toString() && !loggedInUser.isAdmin) {
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

export const toggleStarMessage = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const message = await Message.findById(id);

        if (!message) return res.status(404).json({ error: "Message not found" });

        const index = message.starredBy.indexOf(userId);
        if (index === -1) {
            message.starredBy.push(userId);
        } else {
            message.starredBy.splice(index, 1);
        }
        await message.save();
        res.status(200).json({ message: "Message star status updated", starredBy: message.starredBy });
    } catch (error) {
        console.log("Error in toggleStarMessage: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};