import React, { useState, useEffect } from 'react';
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
  const { onlineUsers, socket } = useSocketcontext();
  const [authUser, setAuthUser] = useAuth();
  const [typing, setTyping] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const isBlockedByMe = authUser?.user?.blockedUsers?.includes(selectedConversation?._id);

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
    const diff = (new Date() - d) / 1000;
    if (diff < 60) return "last seen just now";
    if (diff < 3600) return `last seen ${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `last seen ${Math.floor(diff / 3600)}h ago`;
    return `last seen on ${d.toLocaleDateString()}`;
  };

  if (!selectedConversation) return null;

  return (
    <div className="relative bg-base-300 h-[10vh] border-b border-base-200 shadow-sm flex items-center justify-between px-6 lg:px-10">

      <div className="flex items-center gap-4">
        <label htmlFor="my-drawer-2" className="btn btn-ghost btn-xs btn-circle lg:hidden">
          <CiMenuFries className="text-white text-xl" />
        </label>

        <div className={`avatar ${!selectedConversation.isGroup && getOnlineUsersStatus(selectedConversation._id) === "online" ? "avatar-online" : ""}`}>
          <div className="w-10 rounded-full border border-primary">
            <img
              src={selectedConversation.isGroup
                ? `https://api.dicebear.com/7.x/shapes/svg?seed=${selectedConversation.fullname}`
                : `https://api.dicebear.com/7.x/initials/svg?seed=${selectedConversation.fullname}`}
              alt="avatar"
            />
          </div>
        </div>
        {!showSearch && (
          <div className="text-left flex flex-col justify-center animate-in fade-in duration-300">
            <h1 className="text-sm font-bold flex items-center gap-2">
              {selectedConversation.fullname}
              {isBlockedByMe && <span className="badge badge-error badge-xs text-[8px]">BLOCKED</span>}
            </h1>
            <span className="text-[10px] text-base-content opacity-70">
              {typing ? (
                <span className="text-primary font-medium animate-pulse">
                  {selectedConversation.isGroup ? "Someone is typing..." : "typing..."}
                </span>
              ) : (
                selectedConversation.isGroup
                  ? `${selectedConversation.members.length} members`
                  : onlineUsers.includes(selectedConversation._id)
                    ? "online"
                    : formatLastSeen(selectedConversation.lastSeen)
              )}
            </span>
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
              <button onClick={handleToggleBlock} className={`btn btn-ghost btn-sm btn-circle ${isBlockedByMe ? 'text-error' : 'text-base-content/70 hover:text-error'} transition-colors`} title={isBlockedByMe ? "Unblock User" : "Block User"}>
                {isBlockedByMe ? <IoBan size={20} /> : <IoBanOutline size={20} />}
              </button>
            )}
          </div>
        )}
      </div>
      {showGroupSettings && (
        <GroupSettings group={selectedConversation} onClose={() => setShowGroupSettings(false)} onUpdate={(updatedGroup) => setSelectedConversation(updatedGroup)} />
      )}
    </div>
  );
}

export default Chatuser;
