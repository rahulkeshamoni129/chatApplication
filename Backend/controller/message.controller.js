    import { response } from "express";
    import Conversation from "../models/conversation.model.js";
    import Message from "../models/message.model.js";
    import getReceiverSocketId from "../SockedIo/server.js"
    import { io } from "../SockedIo/server.js"


    export const sendMessage=async(req,res)=>{
        //console.log("Message sent",req.params.id,req.body.message);
        try {
            const {message}=req.body;
            const {id:receiverId}=req.params;//to whom we are sending the message
            const senderId=req.user._id;//currently logged in user
            let conversation=await Conversation.findOne({
                //checking in conversation model where there is any chat between sender and receiver
                //if yes we will continue with same it will show previous chats also
                members:{$all:[senderId,receiverId]}
            })
            //if the conversation between them both is not started then we will build it like new chat
            if(!conversation){
                conversation=await Conversation.create({
                    members:[senderId,receiverId]
                });
            }
            //saving sender id receiver id and the message
            const newMessage= new Message({
                senderId,
                receiverId,
                message
            })
            //if neew message push it into conversation
            if(newMessage){
                conversation.messages.push(newMessage._id);
            }
            //we will save by promise at single time
            // await conversation.save();
            // await newMessage.save();
            await Promise.all(
                [conversation.save(),newMessage.save()]//run parallel
            );
            //sending to socket id
            const receiverSocketId=getReceiverSocketId(receiverId);
            if(receiverSocketId){
                    io.to(receiverSocketId).emit("newMessage",newMessage)
            }
            res.status(201).json({
                message:"Message send successfully",
                newMessage
            });
        } catch (error) {
            console.log("Error in sendMessage",error);
            res.status(500).json({error:"Internal server error"});
        }
    };

    export const getMessage=async(req,res)=>{
        try {
            const {id:chatUser}=req.params;
            const senderId=req.user._id;
            let conversation=await Conversation.findOne({
                //checking in conversation model where there is any chat between sender and receiver
                //if yes we will continue with same it will show previous chats also
                members:{$all:[senderId,chatUser]}
            }).populate("messages");
            if(!conversation){
            return res.status(201).json([]);//returning empty becoz they did not chat till data
            }
            const messages=conversation.messages;
            res.status(201).json(messages);
            
        } catch (error) {
            console.log("Error in get Message",error);
            res.status(500).json({error:"Internal server error"});
            
        }
    }