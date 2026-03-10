import React, { useState, useEffect } from 'react';
import useConversation from "../../zustand/useConversation.js";
import { useSocketcontext } from '../../context/SocketContext.jsx';
import { CiMenuFries } from "react-icons/ci";

function Chatuser() {
  const { selectedConversation } = useConversation();
  const { onlineUsers, socket } = useSocketcontext();
  const [typing, setTyping] = useState(false);

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
  }, [selectedConversation]);

  const getOnlineUsersStatus = (userId) => {
    return onlineUsers.includes(userId) ? "online" : "offline";
  };

  return (
    <div className="relative bg-base-300 hover:bg-base-200 duration-300 h-[10vh] border-b border-base-200 shadow-sm flex items-center justify-between px-6 px-10">

      {/* Left: Drawer menu */}
      <label
        htmlFor="my-drawer-2"
        className="btn btn-ghost drawer-button lg:hidden"
      >
        <CiMenuFries className="text-white text-xl" />
      </label>

      {/* Center: Avatar and user info */}
      <div className="flex items-center gap-4">
        <div className={`avatar ${!selectedConversation.isGroup && getOnlineUsersStatus(selectedConversation._id) === "online" ? "avatar-online" : ""}`}>
          <div className="w-12 rounded-full border border-primary">
            <img
              src={selectedConversation.isGroup
                ? `https://api.dicebear.com/7.x/shapes/svg?seed=${selectedConversation.fullname}`
                : `https://api.dicebear.com/7.x/initials/svg?seed=${selectedConversation.fullname}`}
              alt="avatar"
            />
          </div>
        </div>
        <div className="text-left flex flex-col justify-center">
          <h1 className="text-base font-semibold">{selectedConversation.fullname}</h1>
          <span className="text-xs text-base-content opacity-70">
            {typing ? (
              <span className="text-primary font-medium animate-pulse">
                {selectedConversation.isGroup ? "Someone is typing..." : "typing..."}
              </span>
            ) : (
              selectedConversation.isGroup ? `${selectedConversation.members.length} members` : getOnlineUsersStatus(selectedConversation._id)
            )}
          </span>
        </div>
      </div>
      <div className="flex-1"></div>
    </div>
  );
}

export default Chatuser;
