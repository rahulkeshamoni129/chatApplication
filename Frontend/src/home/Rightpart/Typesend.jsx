import React, { useState } from 'react'
import { IoSend } from "react-icons/io5";
import useSendMessage from '../../context/useSendMessage.js';
import { useSocketcontext } from '../../context/SocketContext.jsx';
import useConversation from '../../zustand/useConversation.js';
import { useAuth } from '../../context/Authprovider.jsx';

function Typesend() {
  const [message, setMessage] = useState("")
  const { loading, sendMessages } = useSendMessage()
  const { socket } = useSocketcontext()
  const { selectedConversation } = useConversation()
  const [authUser] = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim()) return;
    await sendMessages(message)
    setMessage("")
    if (socket) {
      socket.emit("stopTyping", { senderId: authUser.user._id, receiverId: selectedConversation._id })
    }
  };

  const handleOnChange = (e) => {
    setMessage(e.target.value)
    if (socket && selectedConversation) {
      socket.emit("typing", { senderId: authUser.user._id, receiverId: selectedConversation._id })

      if (window.typingTimeout) clearTimeout(window.typingTimeout)
      window.typingTimeout = setTimeout(() => {
        socket.emit("stopTyping", { senderId: authUser.user._id, receiverId: selectedConversation._id })
      }, 2000)
    }
  }

  return (

    <form onSubmit={handleSubmit}>
      <div className='flex items-center space-x-4 h-[10vh] px-6 bg-base-300 border-t border-base-200' >
        <div className='w-full'>
          <input type="text" placeholder="Type a message..." value={message} onChange={handleOnChange}
            className="input input-bordered input-primary w-full rounded-full shadow-sm" />

        </div>
        <button disabled={loading} className="btn btn-circle btn-primary shadow-md">
          <IoSend className='text-2xl text-white' />

        </button>
      </div>
    </form>
  )
}

export default Typesend