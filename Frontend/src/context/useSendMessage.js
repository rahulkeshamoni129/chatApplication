import React, { useState } from 'react'
import useConversation from '../zustand/useConversation.js'
import axios from "axios"
import { encryptMessage } from '../utils/cryptoUtils.js'

const useSendMessage = () => {
    const [loading, setLoading] = useState(false)
    const { setMessage, selectedConversation, replyingTo, setReplyingTo } = useConversation()
    const sendMessages = async (message) => {
        setLoading(true);

        try {
            let messageToSend = message;

            // E2EE: Only encrypt for 1-to-1 chats if recipient has a public key
            if (!selectedConversation.isGroup) {
                const myPublicKey = JSON.parse(localStorage.getItem('chatApp'))?.user?.publicKey;
                
                if (selectedConversation.publicKey) {
                    console.log("E2EE: Encrypting message for both recipient and sender...");
                    messageToSend = await encryptMessage(message, selectedConversation.publicKey, myPublicKey);
                } else {
                    console.warn("E2EE: Recipient has no public key. Sending as PLAIN TEXT.");
                }
            }

            const res = await axios.post(`/api/message/send/${selectedConversation._id}`,
                { message: messageToSend, replyTo: replyingTo?._id }
            );
            setMessage(prev => [...prev, res.data.newMessage]);
            setReplyingTo(null);
            setLoading(false)
        } catch (error) {
            console.log("Error in send Messages", error);
            setLoading(false)
        }


    };
    return { loading, sendMessages }
}

export default useSendMessage