import React, { useEffect, useState } from 'react'
import useConversation from '../zustand/useConversation.js'
import axios from "axios"
import { decryptMessage } from '../utils/cryptoUtils.js'

const useGetMessage=() =>{
    const [loading,setLoading]=useState(false)
    const {messages,setMessage,selectedConversation}=useConversation()
    useEffect(()=>{
        const getMessages=async()=>{
            setLoading(true);
            if(selectedConversation && selectedConversation._id){
                try {
                    const res = await axios.get(`/api/message/get/${selectedConversation._id}`);
                    const userId = JSON.parse(localStorage.getItem('chatApp'))?.user?._id;
                    const privKey = sessionStorage.getItem(`e2ee_private_key_${userId}`);
                    
                    const decryptedMessages = await Promise.all(res.data.map(async (msg) => {
                        let processed = { ...msg };
                        
                        // Decrypt main message
                        if (processed.message?.startsWith("__E2EE__") && privKey) {
                            try {
                                const senderId = processed.senderId?._id || processed.senderId;
                                const itsMe = senderId === JSON.parse(localStorage.getItem('chatApp'))?.user?._id;
                                processed.message = await decryptMessage(processed.message, privKey, itsMe);
                            } catch (e) { processed.message = "[Decryption Error]"; }
                        }

                        // Decrypt reply
                        if (processed.replyTo?.message?.startsWith("__E2EE__") && privKey) {
                            try {
                                const replyIsMe = processed.replyTo.senderId === JSON.parse(localStorage.getItem('chatApp'))?.user?._id;
                                processed.replyTo.message = await decryptMessage(processed.replyTo.message, privKey, replyIsMe);
                            } catch (e) { processed.replyTo.message = "[Decryption Error]"; }
                        }
                        
                        return processed;
                    }));

                    setMessage(decryptedMessages);
                    setLoading(false)
                } catch (error) {
                    console.log("Error in getting Messages",error);
                    setLoading(false)
                }
                
            }
        };
        getMessages();
    },[selectedConversation,setMessage])
  return {loading,messages}
}

export default useGetMessage