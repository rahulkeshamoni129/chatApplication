import { useEffect } from 'react'
import { useSocketcontext } from './SocketContext.jsx'
import useConversation from '../zustand/useConversation.js'

const useGetSocketMessage = () => {
    const { socket } = useSocketcontext()
    const { setMessage, selectedConversation, addUnread, updateMessage } = useConversation()

    useEffect(() => {
        if (!socket) return;

        socket.on("newMessage", (newMessage) => {
            const convId = selectedConversation?._id;
            const isCurrentChat =
                convId &&
                (
                    // 1-on-1: the sender is the person we're chatting with
                    convId === newMessage.senderId ||
                    // Group: the group id matches receiverId
                    convId === newMessage.receiverId
                );

            if (isCurrentChat) {
                // Use functional updater via Zustand to avoid stale closure
                setMessage(prev => {
                    // Prevent duplicates
                    if (prev.find(m => m._id === newMessage._id)) return prev;
                    return [...prev, newMessage];
                });
            } else {
                // Increment unread badge for sender or group
                addUnread(newMessage.receiverId || newMessage.senderId);
            }
        });

        socket.on("messageDeleted", (messageId) => {
            setMessage(prev => prev.filter((msg) => msg._id !== messageId));
        });

        socket.on("messagesSeen", ({ seenMessages }) => {
            setMessage(prev => prev.map(msg =>
                seenMessages.includes(msg._id) ? { ...msg, seen: true } : msg
            ));
        });

        socket.on("messageEdited", (updatedMsg) => {
            setMessage(prev => prev.map(msg =>
                msg._id === updatedMsg._id ? updatedMsg : msg
            ));
        });

        socket.on("messageReaction", ({ messageId, reactions }) => {
            setMessage(prev => prev.map(msg =>
                msg._id === messageId ? { ...msg, reactions } : msg
            ));
        });

        socket.on("groupMessagesSeen", ({ messageIds, userId }) => {
            setMessage(prev => prev.map(msg =>
                messageIds.includes(msg._id)
                    ? { ...msg, seenBy: [...(msg.seenBy || []), { userId, seenAt: new Date() }] }
                    : msg
            ));
        });

        return () => {
            socket.off("newMessage")
            socket.off("messageDeleted")
            socket.off("messagesSeen")
            socket.off("messageEdited")
            socket.off("messageReaction")
            socket.off("groupMessagesSeen")
        }
    }, [socket, selectedConversation]) // Removed `messages` from deps - use functional updater instead
}

export default useGetSocketMessage