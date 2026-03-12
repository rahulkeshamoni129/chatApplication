import { useEffect } from "react";
import useConversation from "../zustand/useConversation";
import axios from "axios";

const useMarkSeen = () => {
    const { selectedConversation, messages, updateMessage, clearUnreads } = useConversation();
    const authUser = JSON.parse(localStorage.getItem('chatApp')) || {};

    useEffect(() => {
        const markSeen = async () => {
            if (!selectedConversation) return;

            try {
                await axios.put(`/api/message/seen/${selectedConversation._id}`);
                
                // Clear the badge instantly
                clearUnreads(selectedConversation._id);

                // Locally update unseen messages
                messages.forEach(msg => {
                    const isFromOther = msg.senderId !== authUser.user?._id;
                    if (selectedConversation.isGroup) {
                        const alreadySeen = msg.seenBy?.some(s => s.userId === authUser.user?._id);
                        if (isFromOther && !alreadySeen) {
                            updateMessage({ ...msg, seenBy: [...(msg.seenBy || []), { userId: authUser.user?._id }] });
                        }
                    } else if (isFromOther && !msg.seen) {
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
