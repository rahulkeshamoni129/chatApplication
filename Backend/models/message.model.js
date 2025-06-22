import mongoose from "mongoose"
const messageSchema=new mongoose.Schema({
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',//from user collection you will get it
        required:true
    },
    receiverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',//from user collection you will get it
        required:true
    },
    message:{
        type:String,
        required:true
    }

},{
    timestamps:true
});

const Message=mongoose.model("message",messageSchema);
export default Message;