import mongoose from "mongoose"

const conversationSchema = new mongoose.Schema({
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'message',
            default: []
        }
    ],
    isGroup: {
        type: Boolean,
        default: false
    },
    groupName: {
        type: String,
        default: ""
    },
    groupAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true })

const Conversation = mongoose.model("conversation", conversationSchema)
export default Conversation