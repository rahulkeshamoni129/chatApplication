import { useEffect } from "react";
import useConversation from "../zustand/useConversation";
import axios from "axios";

const useMarkSeen = () => {
    const { selectedConversation, messages, updateMessage } = useConversation();

    useEffect(() => {
        const markSeen = async () => {
            if (!selectedConversation) return;

            try {
                await axios.put(`/api/message/seen/${selectedConversation._id}`);

                // Locally update unseen messages from the other user
                messages.forEach(msg => {
                    if (msg.senderId === selectedConversation._id && !msg.seen) {
                        updateMessage({ ...msg, seen: true });
                    }
                });
            } catch (error) {
                console.log("Error marking messages as seen:", error);
            }
        };

        if (selectedConversation) {
            markSeen();
        }
    }, [selectedConversation, messages, updateMessage]);
};

export default useMarkSeen;
