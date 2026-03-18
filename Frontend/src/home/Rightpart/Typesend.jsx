import React, { useState, useEffect } from 'react'
import { IoSend, IoCloseCircle, IoHappyOutline } from "react-icons/io5";
import EmojiPicker from 'emoji-picker-react';
import useSendMessage from '../../context/useSendMessage.js';
import useEditMessage from '../../context/useEditMessage.js';
import { useSocketcontext } from '../../context/SocketContext.jsx';
import useConversation from '../../zustand/useConversation.js';
import { useAuth } from '../../context/Authprovider.jsx';

function Typesend() {
  const [message, setMessage] = useState("")
  const [showEmoji, setShowEmoji] = useState(false)
  const { loading: sending, sendMessages } = useSendMessage()
  const { loading: editing, editMsg } = useEditMessage()
  const { socket } = useSocketcontext()
  const { selectedConversation, editingMessage, setEditingMessage, replyingTo, setReplyingTo, bumpConversation } = useConversation()
  const [authUser] = useAuth()

  const isBlockedByMe = authUser?.user?.blockedUsers?.includes(selectedConversation?._id);

  const onEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
  };

  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.message);
    } else {
      setMessage("");
    }
  }, [editingMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = message.trim();
    if (!trimmed || isBlockedByMe) return;

    // Clear input and bump chat to top IMMEDIATELY (optimistic)
    setMessage("")
    setShowEmoji(false)
    if (!editingMessage) {
      bumpConversation(selectedConversation._id);
    }

    if (editingMessage) {
      await editMsg(editingMessage._id, trimmed);
    } else {
      await sendMessages(trimmed);
    }

    if (socket) {
      socket.emit("stopTyping", {
        senderId: authUser.user._id,
        receiverId: selectedConversation._id,
        isGroup: !!selectedConversation.isGroup
      })
    }
  };

  const handleOnChange = (e) => {
    setMessage(e.target.value)
    if (socket && selectedConversation && !isBlockedByMe) {
      // Throttle typing emits to once per second
      const now = Date.now();
      if (!window.lastTypingEmit || now - window.lastTypingEmit > 1000) {
        socket.emit("typing", {
          senderId: authUser.user._id,
          receiverId: selectedConversation._id,
          isGroup: !!selectedConversation.isGroup
        })
        window.lastTypingEmit = now;
      }

      if (window.typingTimeout) clearTimeout(window.typingTimeout)
      window.typingTimeout = setTimeout(() => {
        socket.emit("stopTyping", {
          senderId: authUser.user._id,
          receiverId: selectedConversation._id,
          isGroup: !!selectedConversation.isGroup
        })
        window.lastTypingEmit = 0; // Reset so next keypress emits immediately
      }, 2000)
    }
  }

  const handleCancel = () => {
    setEditingMessage(null);
    setReplyingTo(null);
    setMessage("");
  }

  return (
    <div className='relative'>
      {/* Emoji Picker */}
      {showEmoji && (
        <div className="absolute bottom-full right-2 md:right-6 z-50 mb-2 animate-in slide-in-from-bottom-2 duration-300">
          <EmojiPicker 
            onEmojiClick={onEmojiClick} 
            theme="auto" 
            searchDisabled={false} 
            skinTonesDisabled={true} 
            width={window.innerWidth < 500 ? "280px" : "350px"} 
            height="400px"
          />
        </div>
      )}

      {/* Replying/Editing Preview */}
      {(replyingTo || editingMessage) && (
        <div className="absolute bottom-full left-0 w-full bg-base-200 border-t border-x border-base-300 px-6 py-2 flex items-center justify-between text-xs animate-in slide-in-from-bottom-2 duration-200 rounded-t-xl shadow-lg z-20">
          <div className="truncate flex flex-col">
            <span className="font-bold text-primary italic">
              {editingMessage ? "Editing Message" : `Replying to ${replyingTo?.senderId === authUser.user._id ? "yourself" : "them"}`}
            </span>
            <span className="truncate opacity-70 italic">
              "{editingMessage?.message || replyingTo?.message}"
            </span>
          </div>
          <button onClick={handleCancel} className="text-error hover:scale-110 duration-200">
            <IoCloseCircle size={20} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className='flex items-center space-x-4 h-[10vh] px-6 bg-base-300 border-t border-base-200' >
          <button type="button" onClick={() => setShowEmoji(!showEmoji)} disabled={isBlockedByMe} className="btn btn-ghost btn-circle text-2xl text-base-content/70">
            <IoHappyOutline />
          </button>

          <div className='w-full'>
            <input type="text"
              placeholder={isBlockedByMe ? "This user is blocked" : (editingMessage ? "Edit..." : "Type a message")}
              value={message}
              onChange={handleOnChange}
              disabled={isBlockedByMe}
              className={`input input-bordered w-full rounded-full shadow-sm ${isBlockedByMe ? 'input-error opacity-50' : 'input-primary'}`} />
          </div>
          <button disabled={sending || editing || isBlockedByMe || !message.trim()} className="btn btn-circle btn-primary shadow-md">
            <IoSend className='text-2xl text-white' />
          </button>
        </div>
      </form>
    </div>
  )
}

export default Typesend