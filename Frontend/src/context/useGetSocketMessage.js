import React, { useEffect } from 'react'
import { useSocketcontext } from './SocketContext.jsx'
import useConversation from '../zustand/useConversation.js'

const useGetSocketMessage = () => {
    const { socket } = useSocketcontext()
    const { messages, setMessage, selectedConversation, addUnread } = useConversation()

    useEffect(() => {
        if (!socket) return;
        socket.on("newMessage", (newMessage) => {
            // If the user's currently focused chat is the one sending the new message:
            if (selectedConversation && selectedConversation._id === newMessage.senderId) {
                setMessage([...messages, newMessage]);
            } else {
                // Otherwise increment unread badge
                addUnread(newMessage.senderId);
            }
        });

        socket.on("messageDeleted", (messageId) => {
            setMessage(messages.filter((msg) => msg._id !== messageId));
        });

        socket.on("messagesSeen", ({ seenMessages }) => {
            const updatedMessages = messages.map(msg =>
                seenMessages.includes(msg._id) ? { ...msg, seen: true } : msg
            );
            setMessage(updatedMessages);
        });

        socket.on("messageEdited", (updatedMsg) => {
            setMessage(messages.map(msg => msg._id === updatedMsg._id ? updatedMsg : msg));
        });

        return () => {
            socket.off("newMessage")
            socket.off("messageDeleted")
            socket.off("messagesSeen")
            socket.off("messageEdited")
        }
    }, [socket, messages, setMessage, selectedConversation, addUnread])
}

export default useGetSocketMessage