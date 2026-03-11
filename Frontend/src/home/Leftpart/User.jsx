import React from 'react'
import { BsPinAngleFill, BsPinAngle } from 'react-icons/bs'
import { FaTrash } from 'react-icons/fa'
import axios from 'axios'
import toast from 'react-hot-toast'
import useConversation from '../../zustand/useConversation.js'
import { useSocketcontext } from '../../context/SocketContext.jsx'
import { useAuth } from '../../context/Authprovider.jsx'

function User({ user }) {
  const { selectedConversation, setSelectedConversation, unreads, clearUnreads, pinnedChats, togglePin } = useConversation()
  const isSelected = selectedConversation?._id === user._id;
  const { onlineUsers } = useSocketcontext()
  const [authUser] = useAuth()
  const isOnline = onlineUsers.includes(user._id)
  const isPinned = pinnedChats.includes(user._id)
  const isAdmin = authUser?.user?.isAdmin;
  const isBlockedByMe = authUser?.user?.blockedUsers?.includes(user._id);

  const handleSelectUser = () => {
    setSelectedConversation(user)
    clearUnreads(user._id)
  }

  const handleTogglePin = async (e) => {
    e.stopPropagation();
    try {
      await axios.put('/api/users/pin-chat', { contactId: user._id });
      togglePin(user._id);
      toast.success(isPinned ? "Chat unpinned" : "Chat pinned");
    } catch (error) {
      console.log("Error pinning chat:", error);
      toast.error("Failed to update pin status");
    }
  }

  const handleToggleBlock = async (e) => {
    e.stopPropagation();
    try {
      const res = await axios.put(`/api/users/toggle-block/${user._id}`);
      toast.success(res.data.message);
      // We could use a global user store to update isBlocked, but simpler to reload for now or add to useConversation
      window.location.reload();
    } catch (error) {
      console.log("Error blocking user:", error);
      toast.error(error.response?.data?.error || "Failed to block user");
    }
  }

  return (
    <div
      className={`mx-4 rounded-xl cursor-pointer transition-all duration-200 ease-in-out border group ${isSelected
        ? "bg-primary border-primary text-primary-content shadow-md scale-[1.02]"
        : "bg-base-100 border-base-200 hover:bg-base-200 hover:border-base-300 shadow-sm"
        } ${user.isBlocked ? 'grayscale opacity-60' : ''}`}
      onClick={handleSelectUser}
    >
      <div className='flex space-x-4 px-4 py-3 items-center relative'>
        <div className={`avatar ${isOnline && !user.isGroup ? "avatar-online" : ""}`}>
          <div className={`w-12 rounded-full border-2 ${isSelected ? "border-primary-content" : "border-base-300"}`}>
            <img
              src={user.isGroup
                ? `https://api.dicebear.com/7.x/shapes/svg?seed=${user.fullname}`
                : `https://api.dicebear.com/7.x/initials/svg?seed=${user.fullname}`}
              alt="avatar"
            />
          </div>
        </div>
        <div className='flex-1 flex justify-between items-center overflow-hidden'>
          <div className="truncate">
            <h1 className='font-bold text-sm truncate flex items-center gap-2'>
              {user.fullname}
              {user.isGroup && <span className="badge badge-xs badge-ghost text-[8px] opacity-60">GROUP</span>}
              {user.isBlocked && <span className="text-[10px] text-error font-bold">BLOCKED</span>}
              {isBlockedByMe && <span className="text-[10px] text-error font-bold italic underline">BLOCKED BY YOU</span>}
              {isPinned && <BsPinAngleFill className="text-xs rotate-45 text-secondary" />}
            </h1>
            <span className={`text-xs truncate block ${isSelected ? "opacity-80" : "opacity-60"}`}>
              {user.isGroup ? `${user.members.length} members` : `@${user.username}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {unreads[user._id] > 0 && (
              <div className={`badge badge-sm ${isSelected ? "badge-outline text-primary-content" : "badge-secondary"}`}>
                {unreads[user._id]}
              </div>
            )}

            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
              {isAdmin && !user.isGroup && (
                <button
                  onClick={handleToggleBlock}
                  className={`p-1 hover:scale-110 duration-200 ${user.isBlocked ? 'text-success' : 'text-error'}`}
                  title={user.isBlocked ? "Unblock User" : "Block User"}
                >
                  <FaTrash size={12} />
                </button>
              )}
              <button
                onClick={handleTogglePin}
                className={`p-1 hover:scale-110 duration-200 ${isSelected ? 'text-primary-content' : 'text-base-content/50 hover:text-primary'}`}
                title={isPinned ? "Unpin Chat" : "Pin Chat"}
              >
                {isPinned ? <BsPinAngleFill size={14} className="rotate-45 text-secondary" /> : <BsPinAngle size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default User