import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import bcrypt from "bcryptjs";
import { createTokenAndSaveCookie } from "../jwt/generateToken.js";
export const signup = async (req, res) => {
    const { fullname, email, password, confirmPassword } = req.body;
    try {
        if (password != confirmPassword) {
            return res.status(400).json({ error: "Password does not match" });//status 400 is for invalid data
        }
        //finding a user if already exists with email
        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ error: "User already exists", user });
        }
        //hashing the password and saving
        const hashPassword = await bcrypt.hash(password, 10);
        //if user not exists then create a new user
        const newUser = await new User({
            fullname,
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
                    email: newUser.email,
                    bio: newUser.bio,
                    pinnedChats: newUser.pinnedChats
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
        //if user found generate a token so that user can acces the website
        createTokenAndSaveCookie(user._id, res);
        res.status(200).json({
            message: "User Logged in Succesfully", user: {
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                bio: user.bio,
                pinnedChats: user.pinnedChats
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

export const allUsers = async (req, res) => {
    try {
        const loggedInUser = req.user._id;

        const filteredusers = await User.find({ _id: { $ne: loggedInUser } }).select("-password");

        // Enhance with unread counts for each contact
        const usersWithUnreads = await Promise.all(filteredusers.map(async (user) => {
            const count = await Message.countDocuments({
                senderId: user._id,
                receiverId: loggedInUser,
                seen: false
            });
            return {
                ...user.toObject(),
                unreadCount: count
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

        const index = user.pinnedChats.indexOf(contactId);
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

        // Add admin to members if not already there
        const allMembers = [...new Set([...members, loggedInUser.toString()])];

        const newGroup = await Conversation.create({
            groupName,
            members: allMembers,
            isGroup: true,
            groupAdmin: loggedInUser
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
        const groups = await Conversation.find({
            members: loggedInUser,
            isGroup: true
        }).sort({ updatedAt: -1 });

        res.status(200).json(groups);
    } catch (error) {
        console.log("Error in allGroups: ", error);
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