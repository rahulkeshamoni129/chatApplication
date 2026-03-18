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

  const handleSelectUser = async () => {
    try {
      // First select immediately for UI responsiveness
      setSelectedConversation(user)
      clearUnreads(user._id)
      
      // Then fetch the latest data for that user (refresh Public Key etc)
      if (!user.isGroup) {
        const res = await axios.get(`/api/users/${user._id}`);
        setSelectedConversation(res.data);
      }

      // Close drawer on mobile after selection
      const drawerToggle = document.getElementById("my-drawer-2");
      if (drawerToggle) drawerToggle.checked = false;
    } catch (error) {
      console.log("Error fetching user details:", error);
    }
  }

  const handleTogglePin = async (e) => {
    e.stopPropagation();
    try {
      await axios.put('/api/users/pin-chat', { contactId: user._id });
      togglePin(user._id);

      // Update local authUser to persist pin state and prevent re-sync overwrite
      const updatedAuth = { ...authUser };
      if (!updatedAuth.user.pinnedChats) updatedAuth.user.pinnedChats = [];
      const index = updatedAuth.user.pinnedChats.indexOf(user._id);
      if (index === -1) {
        updatedAuth.user.pinnedChats.push(user._id);
      } else {
        updatedAuth.user.pinnedChats.splice(index, 1);
      }
      setAuthUser(updatedAuth);
      localStorage.setItem("chatApp", JSON.stringify(updatedAuth));

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
      className={`group relative mx-2 mb-1 px-3 py-3 rounded-2xl cursor-pointer transition-all duration-300 ease-out border-none hover:bg-primary/5 active:scale-[0.98] ${isSelected
        ? "bg-primary shadow-xl shadow-primary/20 scale-[1.02]"
        : "bg-transparent text-base-content/80"
        } ${user.isBlocked ? 'grayscale opacity-60' : ''}`}
      onClick={handleSelectUser}
    >
      <div className='flex gap-4 items-center relative z-10'>
        <div className="relative">
          <div className={`avatar ${isOnline && !user.isGroup ? "avatar-online" : ""}`}>
            <div className={`w-12 h-12 rounded-2xl transition-transform duration-500 group-hover:rotate-3 ${isSelected ? "ring-2 ring-primary-content/50" : "ring-1 ring-base-300"}`}>
              <img
                src={user.isGroup
                  ? `https://api.dicebear.com/7.x/shapes/svg?seed=${user.fullname}`
                  : `https://api.dicebear.com/7.x/initials/svg?seed=${user.fullname}`}
                alt="avatar"
              />
            </div>
          </div>
          {isPinned && !isSelected && (
            <div className="absolute -top-1 -left-1 bg-secondary text-secondary-content p-1 rounded-lg">
               <BsPinAngleFill size={8} className="rotate-45" />
            </div>
          )}
        </div>
        
        <div className='flex-1 flex justify-between items-center overflow-hidden'>
          <div className="truncate pr-2">
            <div className={`font-semibold text-[13px] truncate flex items-center gap-1.5 ${isSelected ? 'text-primary-content' : 'text-base-content'}`}>
              {user.fullname}
              {user.isGroup ? (
                <span className={`text-[8px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded-md ${
                  isSelected ? 'bg-primary-content/20 text-primary-content' : 'bg-base-300 text-base-content/50'
                }`}>
                  {user.groupAdmin === authUser?.user?._id ? "Admin" : "Group"}
                </span>
              ) : user.isAdmin ? (
                <span className={`text-[8px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded-md ${
                  isSelected ? 'bg-primary-content/20 text-primary-content' : 'bg-info/20 text-info'
                }`}>
                  Staff
                </span>
              ) : null}
            </div>
            <div className={`text-[11px] font-bold truncate flex items-center gap-1 ${isSelected ? "text-primary-content/70" : "text-base-content/40"}`}>
               {isOnline && !user.isGroup ? (
                 <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
               ) : null}
               {user.isGroup ? `${user.members.length} members` : `@${user.username}`}
            </div>
          </div>

          <div className="relative flex flex-col items-end justify-center h-full min-w-[32px] shrink-0">
            {unreads[user._id] > 0 && sessionStorage.getItem(`e2ee_private_key_${authUser?.user?._id}`) && (
              <div className={`transition-all duration-300 ${isSelected ? "bg-primary-content text-primary" : "bg-primary text-primary-content animate-bounce shadow-md"} min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[9px] font-black group-hover:opacity-0 group-hover:scale-0`}>
                {unreads[user._id]}
              </div>
            )}
            
            <div className="absolute inset-y-0 right-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
              <button
                onClick={handleTogglePin}
                className={`p-1.5 rounded-xl transition-all active:scale-90 ${isSelected ? 'hover:bg-primary-content/10 text-primary-content font-bold' : 'hover:bg-base-300 text-base-content/30'}`}
                title={isPinned ? "Unpin chat" : "Pin chat"}
              >
                {isPinned ? <BsPinAngleFill size={14} className="rotate-45" /> : <BsPinAngle size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {isSelected && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-content rounded-r-full"></div>
      )}
    </div>
  )
}

export default User