import React from 'react'
import useConversation from '../../zustand/useConversation.js'
import { useSocketcontext } from '../../context/SocketContext.jsx';

function User({ user }) {
  const { selectedConversation, setSelectedConversation, unreads, clearUnreads } = useConversation()
  const isSelected = selectedConversation?._id === user._id;
  const { socket, onlineUsers } = useSocketcontext()
  const isOnline = onlineUsers.includes(user._id)

  const handleSelectUser = () => {
    setSelectedConversation(user)
    clearUnreads(user._id)
  }

  return (
    <div
      className={`mx-4 rounded-xl cursor-pointer transition-all duration-200 ease-in-out border ${isSelected
          ? "bg-primary border-primary text-primary-content shadow-md scale-[1.02]"
          : "bg-base-100 border-base-200 hover:bg-base-200 hover:border-base-300 shadow-sm"
        }`}
      onClick={handleSelectUser}
    >
      <div className='flex space-x-4 px-4 py-3 items-center'>
        <div className={`avatar ${isOnline ? "avatar-online" : ""}`}>
          <div className={`w-12 rounded-full border-2 ${isSelected ? "border-primary-content" : "border-base-300"}`}>
            <img src="https://img.daisyui.com/images/profile/demo/gordon@192.webp" />
          </div>
        </div>
        <div className='flex-1 flex justify-between items-center overflow-hidden'>
          <div className="truncate">
            <h1 className='font-bold text-sm truncate'>{user.fullname}</h1>
            <span className={`text-xs truncate block ${isSelected ? "opacity-80" : "opacity-60"}`}>{user.email}</span>
          </div>

          {unreads[user._id] > 0 && (
            <div className={`badge ${isSelected ? "badge-outline text-primary-content" : "badge-secondary"}`}>
              {unreads[user._id]}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default User