import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import Log from "../models/log.model.js";
import mongoose from "mongoose";
import SystemConfig from "../models/systemConfig.model.js";
import bcrypt from "bcryptjs";
import { createTokenAndSaveCookie } from "../jwt/generateToken.js";
import { io } from "../SockedIo/server.js";
import getReceiverSocketId from "../SockedIo/server.js";

export const updatePublicKey = async (req, res) => {
    try {
        const { publicKey, encryptedPrivateKey } = req.body;
        const userId = req.user._id;
        await User.findByIdAndUpdate(userId, { publicKey, encryptedPrivateKey });
        res.status(200).json({ message: "Security keys updated successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const signup = async (req, res) => {
    const { fullname, username, email, password, confirmPassword } = req.body;
    try {
        if (password != confirmPassword) {
            return res.status(400).json({ error: "Password does not match" });//status 400 is for invalid data
        }
        //finding a user if already exists with email
        const userByEmail = await User.findOne({ email })
        if (userByEmail) {
            return res.status(400).json({ error: "User already exists with this email" });
        }
        
        //finding a user if already exists with username
        const userByUsername = await User.findOne({ username })
        if (userByUsername) {
            return res.status(400).json({ error: "Username is already taken" });
        }
        
        //hashing the password and saving
        const hashPassword = await bcrypt.hash(password, 10);
        //if user not exists then create a new user
        const newUser = await new User({
            fullname,
            username,
            email,
            password: hashPassword
        });
        await newUser.save();//saving the user
        if (newUser) {
            createTokenAndSaveCookie(newUser._id, res);
            res.status(201).json({
                message: "User created Succesfully",
                user: {
                    _id: newUser._id,
                    fullname: newUser.fullname,
                    username: newUser.username,
                    email: newUser.email,
                    bio: newUser.bio,
                    isAdmin: newUser.isAdmin,
                    pinnedChats: newUser.pinnedChats,
                    publicKey: newUser.publicKey,
                    encryptedPrivateKey: newUser.encryptedPrivateKey
                }
            })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
};
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid credential" });
        }
        if (user.isBlocked) {
            return res.status(403).json({ error: "Your account has been blocked by admin" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credential" });
        }
        
        // Log the activity
        await Log.create({
            userId: user._id,
            action: "LOGIN",
            details: `User ${user.username} logged in`
        });

        //if user found generate a token so that user can acces the website
        createTokenAndSaveCookie(user._id, res);
        res.status(200).json({
            message: "User Logged in Succesfully", user: {
                _id: user._id,
                fullname: user.fullname,
                username: user.username,
                email: user.email,
                bio: user.bio,
                isAdmin: user.isAdmin,
                pinnedChats: user.pinnedChats,
                publicKey: user.publicKey,
                encryptedPrivateKey: user.encryptedPrivateKey
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });

    }
}

//so for logout the token which we are generating and saving in cookies should be clearled

export const logout = async (req, res) => {
    try {
        res.clearCookie("jwt");
        res.status(201).json({ message: "User Logged out Succesfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });

    }
}

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select("-password -email");
        if (!user) return res.status(404).json({ error: "User not found" });
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getUserById: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const allUsers = async (req, res) => {
    try {
        const loggedInUser = req.user._id;

        const filteredusers = await User.find({ _id: { $ne: loggedInUser } }).select("-password");

        // Enhance with unread counts and last message time for each contact
        const usersWithUnreads = await Promise.all(filteredusers.map(async (user) => {
            const count = await Message.countDocuments({
                senderId: user._id,
                receiverId: loggedInUser,
                seen: false
            });

            // Find the most recent message between these two users
            const lastMsg = await Message.findOne({
                $or: [
                    { senderId: loggedInUser, receiverId: user._id },
                    { senderId: user._id, receiverId: loggedInUser }
                ]
            }).sort({ createdAt: -1 }).select("createdAt").lean();

            return {
                ...user.toObject(),
                unreadCount: count,
                lastMessageAt: lastMsg?.createdAt || null
            };
        }));

        res.status(200).json(usersWithUnreads);
    } catch (error) {
        console.log("Error in all users controller" + error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// =======================
// FEATURE 2: UPDATE PROFILE & PASSWORD
// =======================

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { fullname, bio } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { fullname, bio },
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.log("Error in update profile: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const changePassword = async (req, res) => {
    try {
        const userId = req.user._id;
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Incorrect current password" });
        }

        const hashPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashPassword;
        await user.save();

        res.status(200).json({ message: "Password changed successfully" });

    } catch (error) {
        console.log("Error in change password: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const togglePinChat = async (req, res) => {
    try {
        const userId = req.user._id;
        const { contactId } = req.body;
        const user = await User.findById(userId);

        if (!user.pinnedChats) user.pinnedChats = [];

        // Use toString() to ensure comparison works between String IDs and ObjectIds
        const index = user.pinnedChats.findIndex(id => id.toString() === contactId.toString());
        
        if (index === -1) {
            user.pinnedChats.push(contactId);
        } else {
            user.pinnedChats.splice(index, 1);
        }
        await user.save();
        res.status(200).json({ message: "Pinned chats updated", pinnedChats: user.pinnedChats });
    } catch (error) {
        console.log("Error in togglePinChat: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const createGroup = async (req, res) => {
    try {
        const { groupName, members } = req.body;
        const loggedInUser = req.user._id;

        if (!members || members.length < 2) {
            return res.status(400).json({ error: "At least 2 members are required to create a group" });
        }

        // Add admin to members and cast to ObjectIds for consistency
        const allMembers = [...new Set([...members, loggedInUser.toString()])].map(m => new mongoose.Types.ObjectId(m));

        const newGroup = await Conversation.create({
            groupName,
            members: allMembers,
            isGroup: true,
            groupAdmin: loggedInUser,
            messages: []
        });

        // Broadcast to all members so it shows in their sidebar immediately
        allMembers.forEach(memberId => {
            const socketId = getReceiverSocketId(memberId);
            if (socketId) {
                io.to(socketId).emit("newGroup", {
                    ...newGroup.toObject(),
                    _id: newGroup._id.toString(),
                    fullname: groupName,
                    isGroup: true,
                    unreadCount: 0,
                    lastMessageAt: newGroup.createdAt
                });
            }
        });

        res.status(201).json(newGroup);
    } catch (error) {
        console.log("Error in createGroup: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const allGroups = async (req, res) => {
    try {
        const loggedInUser = req.user._id;
        // Optimization: Find all conversations where isGroup is true AND current user is a member
        const groups = await Conversation.find({
            members: { $in: [loggedInUser] },
            isGroup: true
        }).sort({ updatedAt: -1 }).lean();

        const groupsWithUnreads = await Promise.all(groups.map(async (group) => {
            const count = await Message.countDocuments({
                receiverId: group._id,
                senderId: { $ne: loggedInUser }, // Added this to be explicit: only messages from others are unread
                'seenBy.userId': { $nin: [loggedInUser] }
            });

            // Find the most recent message in this group
            const lastMsg = await Message.findOne({ receiverId: group._id })
                .sort({ createdAt: -1 }).select("createdAt").lean();

            return {
                ...group,
                _id: group._id.toString(),
                fullname: group.groupName || "Unnamed Group", // Crucial for frontend display
                isGroup: true,
                unreadCount: count,
                lastMessageAt: lastMsg?.createdAt || group.updatedAt || null
            };
        }));

        res.status(200).json(groupsWithUnreads);
    } catch (error) {
        console.log("Error in allGroups: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const addGroupMember = async (req, res) => {
    try {
        const { groupId, memberId } = req.body;
        const adminId = req.user._id;

        const group = await Conversation.findById(groupId);
        if (!group || !group.isGroup) return res.status(404).json({ error: "Group not found" });

        if (group.groupAdmin.toString() !== adminId.toString()) {
            return res.status(403).json({ error: "Only group admin can add members" });
        }

        if (group.members.includes(memberId)) {
            return res.status(400).json({ error: "User is already a member" });
        }

        group.members.push(memberId);
        await group.save();
        res.status(200).json({ message: "Member added successfully", group });
    } catch (error) {
        console.log("Error in addGroupMember: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const removeGroupMember = async (req, res) => {
    try {
        const { groupId, memberId } = req.body;
        const adminId = req.user._id;

        const group = await Conversation.findById(groupId);
        if (!group || !group.isGroup) return res.status(404).json({ error: "Group not found" });

        if (group.groupAdmin.toString() !== adminId.toString()) {
            return res.status(403).json({ error: "Only group admin can remove members" });
        }

        if (group.groupAdmin.toString() === memberId.toString()) {
            return res.status(400).json({ error: "Admin cannot be removed" });
        }

        group.members = group.members.filter(m => m.toString() !== memberId.toString());
        await group.save();
        res.status(200).json({ message: "Member removed successfully", group });
    } catch (error) {
        console.log("Error in removeGroupMember: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Conversation.findById(groupId);
        if (!group || !group.isGroup) return res.status(404).json({ error: "Group not found" });

        // Only group admin or system admin can delete
        const isGroupAdmin = group.groupAdmin.toString() === userId.toString();
        const isSystemAdmin = req.user.isAdmin;

        if (!isGroupAdmin && !isSystemAdmin) {
            return res.status(403).json({ error: "Only group admin or system admin can delete the group" });
        }

        // Notify all members via socket that the group is being deleted
        if (group.members && group.members.length > 0) {
            group.members.forEach(memberId => {
                const socketId = getReceiverSocketId(memberId);
                if (socketId) {
                    io.to(socketId).emit("groupDeleted", groupId);
                }
            });
        }

        // Delete all messages associated with this group
        await Message.deleteMany({ receiverId: groupId });

        // Delete the conversation
        await Conversation.findByIdAndDelete(groupId);

        res.status(200).json({ message: "Group deleted permanently" });
    } catch (error) {
        console.log("Error in deleteGroup: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const toggleBlockUser = async (req, res) => {
    try {
        const { id } = req.params;
        const loggedInUser = req.user;

        if (!loggedInUser.isAdmin) {
            return res.status(403).json({ error: "Only admins can perform this action" });
        }

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ error: "User not found" });

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.status(200).json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, isBlocked: user.isBlocked });
    } catch (error) {
        console.log("Error in toggleBlockUser: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const blockUser = async (req, res) => {
    try {
        const { id: targetId } = req.params;
        const userId = req.user._id;

        if (userId.toString() === targetId.toString()) {
            return res.status(400).json({ error: "You cannot block yourself" });
        }

        const user = await User.findById(userId);
        const index = user.blockedUsers.indexOf(targetId);

        if (index === -1) {
            user.blockedUsers.push(targetId);
        } else {
            user.blockedUsers.splice(index, 1);
        }

        await user.save();
        res.status(200).json({
            message: index === -1 ? "User blocked" : "User unblocked",
            blockedUsers: user.blockedUsers
        });
    } catch (error) {
        console.log("Error in blockUser: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getLogs = async (req, res) => {
    try {
        if (!req.user.isAdmin) return res.status(403).json({ error: "Unauthorized" });
        const logs = await Log.find().populate('userId', 'fullname username').sort({ createdAt: -1 }).limit(50);
        res.status(200).json(logs);
    } catch (error) {
        console.log("Error in getLogs: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getSystemConfig = async (req, res) => {
    try {
        let config = await SystemConfig.findOne();
        if (!config) {
            config = await SystemConfig.create({});
        }
        res.status(200).json(config);
    } catch (error) {
        console.log("Error in getSystemConfig: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const toggleMaintenance = async (req, res) => {
    try {
        if (!req.user.isAdmin) return res.status(403).json({ error: "Unauthorized" });
        let config = await SystemConfig.findOne();
        if (!config) config = await SystemConfig.create({});
        
        config.maintenanceMode = !config.maintenanceMode;
        await config.save();
        
        res.status(200).json({ message: `Maintenance mode ${config.maintenanceMode ? 'ENABLED' : 'DISABLED'}`, maintenanceMode: config.maintenanceMode });
    } catch (error) {
        console.log("Error in toggleMaintenance: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};