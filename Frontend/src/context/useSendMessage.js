import React, { useState } from 'react'
import useConversation from '../zustand/useConversation.js'
import axios from "axios"

const useSendMessage = () => {
    const [loading, setLoading] = useState(false)
    const { messages, setMessage, selectedConversation, replyingTo, setReplyingTo } = useConversation()
    const sendMessages = async (message) => {
        setLoading(true);

        try {
            const res = await axios.post(`/api/message/send/${selectedConversation._id}`,
                { message, replyTo: replyingTo?._id }
            );
            setMessage([...messages, res.data.newMessage]);
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