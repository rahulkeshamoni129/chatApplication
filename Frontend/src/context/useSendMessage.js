import React, { useState } from 'react'
import useConversation from '../zustand/useConversation.js'
import axios from "axios"
import { encryptMessage, decryptMessage } from '../utils/cryptoUtils.js'

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

            // E2EE: Decrypt the message we just received from the server before adding to state
            let processedMessage = { ...res.data.newMessage };
            const auth = JSON.parse(localStorage.getItem('chatApp'));
            const userId = auth?.user?._id;
            const privKey = sessionStorage.getItem(`e2ee_private_key_${userId}`);

            if (processedMessage.message?.startsWith("__E2EE__") && privKey) {
                try {
                    // We are the sender of this message
                    processedMessage.message = await decryptMessage(processedMessage.message, privKey, true);
                } catch (e) { processedMessage.message = "[Decryption Error]"; }
            }

            // Also decrypt reply if it exists in the returned message
            if (processedMessage.replyTo?.message?.startsWith("__E2EE__") && privKey) {
                try {
                    const replyIsMe = processedMessage.replyTo.senderId === userId;
                    processedMessage.replyTo.message = await decryptMessage(processedMessage.replyTo.message, privKey, replyIsMe);
                } catch (e) { processedMessage.replyTo.message = "[Decryption Error]"; }
            }

            setMessage(prev => [...prev, processedMessage]);
            setReplyingTo(null);
            setLoading(false);
            
            // Helpful for mobile/slow networks to ensure UI updates before scroll
            setTimeout(() => {
                const chatContainer = document.querySelector('.hide-scroll');
                if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
            }, 50);
        } catch (error) {
            console.log("Error in send Messages", error);
            setLoading(false)
        }


    };
    return { loading, sendMessages }
}

export default useSendMessage