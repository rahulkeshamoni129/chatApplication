import { useEffect } from 'react'
import { useSocketcontext } from './SocketContext.jsx'
import useConversation from '../zustand/useConversation.js'
import { useAuth } from './Authprovider.jsx'
import { decryptMessage } from '../utils/cryptoUtils.js'
import toast from 'react-hot-toast'

const useGetSocketMessage = () => {
    const { socket } = useSocketcontext()
    const { 
        setMessage, selectedConversation, setSelectedConversation,
        addUnread, updateMessage, bumpConversation, updateSecurityUpdate
    } = useConversation()
    const [authUser] = useAuth();

    useEffect(() => {
        if (!socket) return;

        socket.on("newMessage", async (newMessage) => {
            const senderId = newMessage.senderId?._id || newMessage.senderId;
            const receiverId = newMessage.receiverId?._id || newMessage.receiverId;
            const convId = selectedConversation?._id;

            // Decrypt message if needed BEFORE adding to state
            let processedMessage = { ...newMessage };
            const privKey = sessionStorage.getItem(`e2ee_private_key_${authUser.user._id}`);
            
            if (processedMessage.message?.startsWith("__E2EE__") && privKey) {
                try {
                    const itsMe = senderId === authUser.user._id;
                    const decoded = await decryptMessage(processedMessage.message, privKey, itsMe);
                    processedMessage.message = decoded;
                } catch (e) {
                    processedMessage.message = "[Decryption Error]";
                }
            }

            // Also decrypt reply if exists
            if (processedMessage.replyTo?.message?.startsWith("__E2EE__") && privKey) {
                try {
                    const replyIsMe = processedMessage.replyTo.senderId === authUser.user?._id;
                    const decoded = await decryptMessage(processedMessage.replyTo.message, privKey, replyIsMe);
                    processedMessage.replyTo.message = decoded;
                } catch (e) {
                    processedMessage.replyTo.message = "[Decryption Error]";
                }
            }

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
                    if (prev.find(m => m._id === processedMessage._id)) return prev;
                    return [...prev, processedMessage];
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

        socket.on("messagesSeen", ({ seenMessages, chatId, isMe }) => {
            setMessage(prev => prev.map(msg =>
                seenMessages.includes(msg._id) ? { ...msg, seen: true } : msg
            ));
            
            // If I am the one who saw them (syncing across tabs)
            if (isMe && chatId) {
                clearUnreads(chatId);
            }
        });

        socket.on("messageEdited", async (updatedMsg) => {
            let processedMsg = { ...updatedMsg };
            const privKey = sessionStorage.getItem(`e2ee_private_key_${authUser.user._id}`);
            
            if (processedMsg.message?.startsWith("__E2EE__") && privKey) {
                try {
                    const senderId = processedMsg.senderId?._id || processedMsg.senderId;
                    const itsMe = senderId === authUser.user._id;
                    const decoded = await decryptMessage(processedMsg.message, privKey, itsMe);
                    processedMsg.message = decoded;
                } catch (e) {
                    processedMsg.message = "[Decryption Error]";
                }
            }
            
            setMessage(prev => prev.map(msg =>
                msg._id === processedMsg._id ? processedMsg : msg
            ));
        });

        socket.on("messageReaction", ({ messageId, reactions }) => {
            setMessage(prev => prev.map(msg =>
                msg._id === messageId ? { ...msg, reactions } : msg
            ));
        });

        socket.on("groupMessagesSeen", ({ messageIds, userId, fullname, chatId }) => {
            setMessage(prev => prev.map(msg => {
                if (!messageIds.includes(msg._id)) return msg;

                const alreadySeen = msg.seenBy?.some(s => (s.userId?._id || s.userId) === userId);
                if (alreadySeen) return msg;

                return { 
                    ...msg, 
                    seenBy: [
                        ...(msg.seenBy || []), 
                        { 
                            userId: { _id: userId, fullname: fullname }, 
                            seenAt: new Date() 
                        }
                    ] 
                }
            }));

            // Sync unreads across tabs if it's ME who saw the messages
            if (userId === authUser.user?._id && chatId) {
                clearUnreads(chatId);
            }
        });

        socket.on("groupDeleted", (groupId) => {
            if (selectedConversation?._id === groupId) {
                setSelectedConversation(null);
                toast.error("This group has been deleted by an admin.");
                setTimeout(() => window.location.reload(), 3000);
            } else {
                // For other users, just refresh
                window.location.reload();
            }
        });
        
        socket.on("newGroup", (data) => {
            // Trigger a re-fetch of all groups via useGetGroups
            updateSecurityUpdate();
            toast.success(`New group: ${data.fullname}`);
        });

        return () => {
            socket.off("newMessage")
            socket.off("messageDeleted")
            socket.off("messagesSeen")
            socket.off("messageEdited")
            socket.off("messageReaction")
            socket.off("groupMessagesSeen")
            socket.off("groupDeleted")
            socket.off("newGroup")
        }
    }, [socket, selectedConversation, updateSecurityUpdate]) // Removed `messages` from deps - use functional updater instead
}

export default useGetSocketMessage