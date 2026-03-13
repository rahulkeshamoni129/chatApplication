import mongoose from "mongoose";
const userSchema = mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    confirmPassword: {
        type: String,
    },
    bio: {
        type: String,
        default: "Hey there! I am using this chat app."
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    pinnedChats: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isAdmin: {
        type: Boolean,
        default: false
    },
    blockedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    lastSeen: {
        type: Date
    },
    publicKey: {
        type: String,
        default: null
    },
    encryptedPrivateKey: {
        type: String,
        default: null
    }
}, { timestamps: true })//createdAt when the user is created & updatedAt when latest updated like password

const User = mongoose.model("User", userSchema);
export default User;