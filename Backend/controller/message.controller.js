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

        if (conversation && conversation.isGroup && !conversation.members.some(m => m.toString() === senderId.toString())) {
            return res.status(403).json({ error: "You are not a member of this group" });
        }

        if (!conversation) {
            // Only create if it's a user-to-user chat
            const targetUser = await User.findById(targetId);
            if (targetUser) {
                // Check if blocked
                const isBlockedByTarget = targetUser.blockedUsers.includes(senderId);
                const currentUser = await User.findById(senderId);
                const hasBlockedTarget = currentUser.blockedUsers.includes(targetId);

                if (isBlockedByTarget || hasBlockedTarget) {
                    return res.status(403).json({ error: "Messaging is blocked between you and this user" });
                }

                conversation = await Conversation.create({
                    members: [senderId, targetId]
                });
            } else {
                return res.status(404).json({ error: "Conversation not found" });
            }
        } else if (!conversation.isGroup) {
            // Check blocking for existing 1-to-1 conversation
            const targetUser = await User.findById(targetId);
            const currentUser = await User.findById(senderId);
            if (targetUser?.blockedUsers.includes(senderId) || currentUser?.blockedUsers.includes(targetId)) {
                return res.status(403).json({ error: "Messaging is blocked between you and this user" });
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

        await newMessage.populate([
            {
                path: 'senderId',
                select: 'fullname username'
            },
            {
                path: 'replyTo',
                select: 'message senderId'
            }
        ]);

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
            populate: [
                {
                    path: 'senderId',
                    select: 'fullname username'
                },
                {
                    path: 'replyTo',
                    select: 'message senderId'
                },
                {
                    path: 'seenBy.userId',
                    select: 'fullname'
                }
            ]
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

        const conversation = await Conversation.findOneAndUpdate(
            { messages: id },
            { $pull: { messages: id } }
        );

        if (conversation) {
            conversation.members.forEach(memberId => {
                const receiverSocketId = getReceiverSocketId(memberId.toString());
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("messageDeleted", id);
                }
            });
        }

        res.status(200).json({ message: "Message deleted successfully", messageId: id });
    } catch (error) {
        console.log("Error in deleteMessage", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const markMessagesAsSeen = async (req, res) => {
    try {
        const { id: chatId } = req.params;
        const loggedInUserId = req.user._id;

        // Check if it's a group
        const conversation = await Conversation.findById(chatId);
        const isGroup = conversation?.isGroup || false;

        if (isGroup) {
            const unseenMessages = await Message.find({
                receiverId: chatId,
                senderId: { $ne: loggedInUserId },
                'seenBy.userId': { $nin: [loggedInUserId] }
            });

            if (unseenMessages.length > 0) {
                await Message.updateMany(
                    { _id: { $in: unseenMessages.map(m => m._id) } },
                    { $push: { seenBy: { userId: loggedInUserId } } }
                );

                // Broadcast update to all group members
                conversation.members.forEach(memberId => {
                    const socketId = getReceiverSocketId(memberId);
                    if (socketId) {
                        io.to(socketId).emit("groupMessagesSeen", {
                            chatId,
                            userId: loggedInUserId,
                            fullname: req.user.fullname,
                            messageIds: unseenMessages.map(m => m._id)
                        });
                    }
                });
            }
        } else {
            // 1-to-1 Chat
            const unseenMessages = await Message.find({
                senderId: chatId,
                receiverId: loggedInUserId,
                seen: false
            });

            if (unseenMessages.length > 0) {
                await Message.updateMany(
                    { senderId: chatId, receiverId: loggedInUserId, seen: false },
                    {
                        $set: { seen: true },
                        $push: { seenBy: { userId: loggedInUserId } }
                    }
                );

                const senderSocketId = getReceiverSocketId(chatId);
                if (senderSocketId) {
                    io.to(senderSocketId).emit("messagesSeen", {
                        seenMessages: unseenMessages.map(msg => msg._id)
                    });
                }

                // Also notify viewer's other tabs
                const viewerSocketId = getReceiverSocketId(loggedInUserId);
                if (viewerSocketId) {
                    io.to(viewerSocketId).emit("messagesSeen", {
                        chatId, // The user whose messages were seen
                        seenMessages: unseenMessages.map(msg => msg._id),
                        isMe: true
                    });
                }
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
        const { id: chatId } = req.params;
        const { query } = req.query;
        const senderId = req.user._id;

        if (!query) return res.status(400).json({ error: "Search query required" });

        // Verify conversation access
        const conversation = await Conversation.findOne({
            $or: [
                { _id: chatId },
                { members: { $all: [senderId, chatId] }, isGroup: false }
            ]
        });

        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        const messages = await Message.find({
            _id: { $in: conversation.messages },
            $text: { $search: query }
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

export const toggleReaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { emoji } = req.body;
        const userId = req.user._id;

        const message = await Message.findById(id);
        if (!message) return res.status(404).json({ error: "Message not found" });

        const existingReactionIndex = message.reactions.findIndex(
            r => r.userId.toString() === userId.toString() && r.emoji === emoji
        );

        if (existingReactionIndex !== -1) {
            message.reactions.splice(existingReactionIndex, 1);
        } else {
            message.reactions.push({ emoji, userId });
        }

        await message.save();

        // Broadcast to conversation members
        const conversation = await Conversation.findOne({ messages: id });
        if (conversation) {
            conversation.members.forEach(memberId => {
                if (memberId.toString() !== userId.toString()) {
                    const socketId = getReceiverSocketId(memberId);
                    if (socketId) io.to(socketId).emit("messageReaction", { messageId: id, reactions: message.reactions });
                }
            });
        }

        res.status(200).json({ message: "Reaction updated", reactions: message.reactions });
    } catch (error) {
        console.log("Error in toggleReaction: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const forwardMessage = async (req, res) => {
    try {
        const { messageId, targetIds } = req.body; // targetIds is an array of IDs
        const senderId = req.user._id;

        const originalMsg = await Message.findById(messageId);
        if (!originalMsg) return res.status(404).json({ error: "Original message not found" });

        const forwardedResults = [];

        for (const targetId of targetIds) {
            let conversation = await Conversation.findOne({
                $or: [
                    { _id: targetId },
                    { members: { $all: [senderId, targetId] }, isGroup: false }
                ]
            });

            if (!conversation) {
                const targetUser = await User.findById(targetId);
                if (targetUser) {
                    conversation = await Conversation.create({ members: [senderId, targetId] });
                } else continue;
            }

            const newMessage = new Message({
                senderId,
                receiverId: targetId,
                message: originalMsg.message,
            });

            conversation.messages.push(newMessage._id);
            await Promise.all([conversation.save(), newMessage.save()]);

            // Broadcast
            const isGroup = conversation.isGroup;
            if (isGroup) {
                conversation.members.forEach(memberId => {
                    const socketId = getReceiverSocketId(memberId);
                    if (socketId) io.to(socketId).emit("newMessage", newMessage);
                });
            } else {
                const socketId = getReceiverSocketId(targetId);
                const senderSocketId = getReceiverSocketId(senderId);
                if (socketId) io.to(socketId).emit("newMessage", newMessage);
                if (senderSocketId) io.to(senderSocketId).emit("newMessage", newMessage);
            }
            forwardedResults.push(newMessage);
        }

        res.status(200).json({ message: "Message forwarded successfully", forwardedResults });
    } catch (error) {
        console.log("Error in forwardMessage", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const broadcastMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const senderId = req.user._id;

        if (!req.user.isAdmin) {
            return res.status(403).json({ error: "Only admins can broadcast messages" });
        }

        if (!message?.trim()) {
            return res.status(400).json({ error: "Message cannot be empty" });
        }

        // Emit a dedicated broadcast event to ALL connected sockets
        // This does NOT create chat messages — it's an announcement only
        const broadcastPayload = {
            message,
            sentBy: req.user.fullname || "Admin",
            sentAt: new Date().toISOString(),
        };

        io.emit("broadcastAnnouncement", broadcastPayload);

        res.status(200).json({ message: `Broadcast sent to all users`, payload: broadcastPayload });
    } catch (error) {
        console.log("Error in broadcastMessage: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getStarredMessages = async (req, res) => {
    try {
        const userId = req.user._id;
        const starredMessages = await Message.find({ starredBy: userId })
            .populate('senderId', 'fullname username')
            .sort({ createdAt: -1 });
        res.status(200).json(starredMessages);
    } catch (error) {
        console.log("Error in getStarredMessages: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const togglePinMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await Message.findById(id);
        if (!message) return res.status(404).json({ error: "Message not found" });

        message.isPinned = !message.isPinned;
        await message.save();

        res.status(200).json({ message: `Message ${message.isPinned ? 'pinned' : 'unpinned'}`, isPinned: message.isPinned });
    } catch (error) {
        console.log("Error in togglePinMessage: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};