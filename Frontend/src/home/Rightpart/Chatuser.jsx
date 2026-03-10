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
      socket.on("userTyping", ({ senderId }) => {
        if (selectedConversation && senderId === selectedConversation._id) {
          setTyping(true);
        }
      });
      socket.on("userStopTyping", ({ senderId }) => {
        if (selectedConversation && senderId === selectedConversation._id) {
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
        <div className={`avatar ${getOnlineUsersStatus(selectedConversation._id) === "online" ? "avatar-online" : ""}`}>
          <div className="w-12 rounded-full border border-primary">
            <img src="https://img.daisyui.com/images/profile/demo/gordon@192.webp" />
          </div>
        </div>
        <div className="text-left flex flex-col justify-center">
          <h1 className="text-base font-semibold">{selectedConversation.fullname}</h1>
          <span className="text-xs text-base-content opacity-70">
            {typing ? (
              <span className="text-primary font-medium animate-pulse">typing...</span>
            ) : (
              getOnlineUsersStatus(selectedConversation._id)
            )}
          </span>
        </div>
      </div>
      <div className="flex-1"></div>
    </div>
  );
}

export default Chatuser;
