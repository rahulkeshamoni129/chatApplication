import { useEffect } from 'react'
import { useSocketcontext } from './SocketContext.jsx'
import useConversation from '../zustand/useConversation.js'
import { useAuth } from './Authprovider.jsx'

const useGetSocketMessage = () => {
    const { socket } = useSocketcontext()
    const { setMessage, selectedConversation, addUnread, updateMessage, bumpConversation } = useConversation()
    const [authUser] = useAuth();

    useEffect(() => {
        if (!socket) return;

        socket.on("newMessage", (newMessage) => {
            const senderId = newMessage.senderId?._id || newMessage.senderId;
            const receiverId = newMessage.receiverId?._id || newMessage.receiverId;
            const convId = selectedConversation?._id;

            const isCurrentChat =
                convId &&
                (
                    // 1-on-1: the sender is the person we're chatting with
                    convId === senderId ||
                    // Group: the group id matches receiverId
                    convId === receiverId
                );

            // Bump the conversation to the top of the list regardless of which chat it's in
            const bumpId = isCurrentChat
                ? (selectedConversation.isGroup ? receiverId : senderId)
                : (receiverId === authUser.user?._id ? senderId : receiverId);

            bumpConversation(bumpId);

            if (isCurrentChat) {
                // Use functional updater via Zustand to avoid stale closure
                setMessage(prev => {
                    // Prevent duplicates
                    if (prev.find(m => m._id === newMessage._id)) return prev;
                    return [...prev, newMessage];
                });
            } else {
                // If receiverId is ME, it's a private chat, so use senderId for the badge
                // If receiverId is a Group, use receiverId for the badge
                const badgeId = (receiverId === authUser.user?._id) 
                    ? senderId 
                    : receiverId;
                
                addUnread(badgeId);
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