import { useState } from "react";
import useConversation from "../zustand/useConversation.js";
import axios from "axios";
import toast from "react-hot-toast";

const useDeleteMessage = () => {
    const [loading, setLoading] = useState(false);
    const { messages, setMessage } = useConversation();

    const deleteMessage = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`/api/message/delete/${id}`);
            setMessage(messages.filter((msg) => msg._id !== id));
            toast.success("Message deleted");
        } catch (error) {
            toast.error("Error deleting message");
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return { loading, deleteMessage };
};
export default useDeleteMessage;
