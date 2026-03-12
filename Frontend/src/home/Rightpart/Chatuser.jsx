import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import useConversation from "../../zustand/useConversation.js";
import { useSocketcontext } from '../../context/SocketContext.jsx';
import { useAuth } from '../../context/Authprovider.jsx';
import { CiMenuFries, CiSearch } from "react-icons/ci";
import { IoClose, IoBanOutline, IoBan, IoInformationCircleOutline } from "react-icons/io5";
import axios from 'axios';
import toast from 'react-hot-toast';
import GroupSettings from '../../components/GroupSettings.jsx';

function Chatuser() {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const { onlineUsers, socket, offlineUpdates } = useSocketcontext();
  const [authUser, setAuthUser] = useAuth();
  const [typing, setTyping] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [tick, setTick] = useState(0);

  const isBlockedByMe = authUser?.user?.blockedUsers?.includes(selectedConversation?._id);

  // Force re-render every minute to update relative "last seen" times
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleBlock = async () => {
    try {
      const res = await axios.put(`/api/users/block/${selectedConversation._id}`);
      const updatedUser = { ...authUser.user, blockedUsers: res.data.blockedUsers };
      const newAuthData = { ...authUser, user: updatedUser };
      localStorage.setItem("chatApp", JSON.stringify(newAuthData));
      setAuthUser(newAuthData);
      toast.success(res.data.message);
    } catch (error) {
      console.log("Error blocking user:", error);
      toast.error(error.response?.data?.error || "Failed to toggle block");
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim() && selectedConversation?._id) {
        setIsSearching(true);
        try {
          const res = await axios.get(`/api/message/search/${selectedConversation._id}?query=${searchQuery}`);
          setSearchResults(res.data);
        } catch (error) {
          console.log("Search error:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedConversation?._id]);

  useEffect(() => {
    if (socket) {
      socket.on("userTyping", ({ senderId, receiverId }) => {
        if (selectedConversation &&
          (senderId === selectedConversation._id || (selectedConversation.isGroup && receiverId === selectedConversation._id))) {
          setTyping(true);
        }
      });
      socket.on("userStopTyping", ({ senderId, receiverId }) => {
        if (selectedConversation &&
          (senderId === selectedConversation._id || (selectedConversation.isGroup && receiverId === selectedConversation._id))) {
          setTyping(false);
        }
      });
    }
    return () => {
      if (socket) {
        socket.off("userTyping");
        socket.off("userStopTyping");
      }
    };
  }, [socket, selectedConversation]);

  useEffect(() => {
    setTyping(false);
    setShowSearch(false);
    setSearchQuery("");
  }, [selectedConversation]);

  const getOnlineUsersStatus = (userId) => {
    return onlineUsers.includes(userId) ? "online" : "offline";
  };

  const formatLastSeen = (date) => {
    if (!date) return "offline";
    const d = new Date(date);
    const now = new Date();
    // Use Math.abs to fix clock skew issues where server time is slightly ahead of frontend time
    const diffInSeconds = Math.abs((now - d) / 1000);
    
    if (diffInSeconds < 60) return "last seen just now";
    if (diffInSeconds < 3600) return `last seen ${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `last seen ${Math.floor(diffInSeconds / 3600)}h ago`;
    return `last seen on ${d.toLocaleDateString()}`;
  };

  if (!selectedConversation) return null;

  const activeLastSeen = offlineUpdates?.[selectedConversation._id] || selectedConversation.lastSeen;

  return (
    <div className="relative bg-base-100/70 backdrop-blur-xl h-[10vh] border-b border-base-200 shadow-sm flex items-center justify-between px-6 lg:px-10 z-[100]">

      <div className="flex items-center gap-4">
        <label htmlFor="my-drawer-2" className="btn btn-ghost btn-sm btn-circle lg:hidden">
          <CiMenuFries size={20} />
        </label>

        <div className="relative group cursor-pointer" onClick={() => !selectedConversation.isGroup && setShowUserInfo(true)}>
          <div className={`avatar ${!selectedConversation.isGroup && onlineUsers.includes(selectedConversation._id) ? "avatar-online" : ""}`}>
            <div className="w-11 h-11 rounded-2xl ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all duration-300 overflow-hidden">
              <img
                src={selectedConversation.isGroup
                  ? `https://api.dicebear.com/7.x/shapes/svg?seed=${selectedConversation.fullname}`
                  : `https://api.dicebear.com/7.x/initials/svg?seed=${selectedConversation.fullname}`}
                alt="avatar"
              />
            </div>
          </div>
        </div>
        
        {!showSearch && (
          <div className="text-left flex flex-col justify-center animate-in fade-in slide-in-from-left-2 duration-500">
            <h1 className="text-[15px] font-black tracking-tight flex items-center gap-2">
              {selectedConversation.fullname}
              {isBlockedByMe && <span className="bg-error/10 text-error text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase">Blocked</span>}
            </h1>
            <div className="flex items-center gap-2">
               {typing ? (
                 <div className="flex items-center gap-1.5">
                   <span className="flex gap-0.5">
                     <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                     <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                     <span className="w-1 h-1 bg-primary rounded-full animate-bounce"></span>
                   </span>
                   <span className="text-[10px] text-primary font-bold uppercase tracking-widest">{selectedConversation.isGroup ? "Someone is typing" : "Typing"}</span>
                 </div>
               ) : (
                 <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${onlineUsers.includes(selectedConversation._id) ? "text-success" : "opacity-40"}`}>
                   {onlineUsers.includes(selectedConversation._id) && !selectedConversation.isGroup && <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></span>}
                   {selectedConversation.isGroup
                     ? `${selectedConversation.members.length} members`
                     : onlineUsers.includes(selectedConversation._id)
                       ? "online"
                       : formatLastSeen(activeLastSeen)}
                 </span>
               )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {showSearch ? (
          <div className="flex items-center gap-2 animate-in slide-in-from-right-5 duration-300">
            <div className="relative">
              <input
                type="text"
                placeholder="Search messages..."
                className="input input-sm input-bordered rounded-full w-40 md:w-64 bg-base-100"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {isSearching && <span className="loading loading-spinner loading-xs absolute right-3 top-2"></span>}
              {searchResults.length > 0 && searchQuery && (
                <div className="absolute top-full right-0 mt-2 w-64 md:w-80 bg-base-100 border border-base-200 rounded-2xl shadow-2xl z-[100] max-h-60 overflow-y-auto p-2 flex flex-col gap-1">
                  <p className="text-[10px] opacity-50 px-2 py-1 font-bold italic">Found {searchResults.length} results</p>
                  {searchResults.map(msg => (
                    <div
                      key={msg._id}
                      className="p-2 hover:bg-base-200 rounded-xl cursor-pointer text-xs transition-colors"
                      onClick={() => {
                        const el = document.getElementById(msg._id);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        setShowSearch(false);
                      }}
                    >
                      <p className="truncate font-medium">{msg.message}</p>
                      <p className="text-[9px] opacity-50 mt-1">{new Date(msg.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => { setShowSearch(false); setSearchQuery(""); }} className="btn btn-ghost btn-sm btn-circle">
              <IoClose size={20} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <button onClick={() => setShowSearch(true)} className="btn btn-ghost btn-sm btn-circle text-base-content/70 hover:text-primary transition-colors" title="Search Messages">
              <CiSearch size={22} />
            </button>
            {selectedConversation.isGroup && (
              <button onClick={() => setShowGroupSettings(true)} className="btn btn-ghost btn-sm btn-circle text-base-content/70 hover:text-primary transition-colors" title="Group Info">
                <IoInformationCircleOutline size={22} />
              </button>
            )}
            {!selectedConversation.isGroup && (
              <>
                <button onClick={() => setShowUserInfo(true)} className="btn btn-ghost btn-sm btn-circle text-base-content/70 hover:text-primary transition-colors" title="User Info">
                  <IoInformationCircleOutline size={22} />
                </button>
                <button onClick={handleToggleBlock} className={`btn btn-ghost btn-sm btn-circle ${isBlockedByMe ? 'text-error' : 'text-base-content/70 hover:text-error'} transition-colors`} title={isBlockedByMe ? "Unblock User" : "Block User"}>
                  {isBlockedByMe ? <IoBan size={20} /> : <IoBanOutline size={20} />}
                </button>
              </>
            )}
          </div>
        )}
      </div>
      {showGroupSettings && (
        <GroupSettings group={selectedConversation} onClose={() => setShowGroupSettings(false)} onUpdate={(updatedGroup) => setSelectedConversation(updatedGroup)} />
      )}

      {showUserInfo && createPortal(
        <dialog id="user_info_modal" className="modal modal-open" style={{ zIndex: 9999 }}>
          <div className="modal-box bg-base-100 border border-base-200 shadow-2xl rounded-3xl p-0 overflow-hidden max-w-sm">
            {/* Header banner */}
            <div className="bg-primary/5 border-b border-base-200 px-6 pt-6 pb-5 flex items-center gap-4">
              <div className="avatar">
                <div className="w-16 h-16 rounded-2xl border-2 border-primary/20 overflow-hidden shadow-lg">
                  <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedConversation.fullname}`} alt="avatar" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-[17px] truncate">{selectedConversation.fullname}</h4>
                <p className="text-xs opacity-40 font-bold mt-0.5">@{selectedConversation.username}</p>
              </div>
              <button
                onClick={() => setShowUserInfo(false)}
                className="btn btn-ghost btn-sm btn-circle text-base-content/40 hover:text-base-content shrink-0"
              >
                <IoClose size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 flex flex-col gap-3">
              <div className="bg-base-200/50 p-4 rounded-2xl border border-base-200">
                <h5 className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-1.5">About</h5>
                <p className="text-sm leading-relaxed text-base-content/80">{selectedConversation.bio || "Hey there! I am using this chat app."}</p>
              </div>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop" onClick={() => setShowUserInfo(false)}>
            <button>close</button>
          </form>
        </dialog>,
        document.body
      )}
    </div>
  );
}

export default Chatuser;
