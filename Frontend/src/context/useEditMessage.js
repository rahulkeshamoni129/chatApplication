import { useState } from 'react'
import useConversation from '../zustand/useConversation.js'
import axios from "axios"
import toast from 'react-hot-toast'

const useEditMessage = () => {
    const [loading, setLoading] = useState(false)
    const { updateMessage, setEditingMessage } = useConversation()

    const editMsg = async (messageId, newText) => {
        setLoading(true);
        try {
            const res = await axios.put(`/api/message/edit/${messageId}`, { message: newText });
            updateMessage(res.data.updatedMessage);
            setEditingMessage(null);
            toast.success("Message edited");
        } catch (error) {
            console.log("Error in editMessage", error);
            toast.error(error.response?.data?.error || "Failed to edit message");
        } finally {
            setLoading(false)
        }
    };
    return { loading, editMsg }
}

export default useEditMessage
