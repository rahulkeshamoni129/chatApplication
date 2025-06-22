import React from 'react';
import useConversation from "../../zustand/useConversation.js";
import { useSocketcontext } from '../../context/SocketContext.jsx';
import { CiMenuFries } from "react-icons/ci";

function Chatuser() {
  const { selectedConversation } = useConversation();
  const { onlineUsers } = useSocketcontext();

  const getOnlineUsersStatus = (userId) => {
    return onlineUsers.includes(userId) ? "online" : "offline";
  };

  return (
    <div className="relative bg-slate-800 hover:bg-slate-700 duration-300 h-[8vh] flex items-center">
      
      {/* Left: Drawer menu */}
      <label
        htmlFor="my-drawer-2"
        className="btn btn-ghost drawer-button lg:hidden absolute left-4"
      >
        <CiMenuFries className="text-white text-xl" />
      </label>

      {/* Center: Avatar and user info */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3">
        <div className="avatar avatar-online">
          <div className="w-10 rounded-full">
            <img src="https://img.daisyui.com/images/profile/demo/gordon@192.webp" />
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-base font-semibold">{selectedConversation.fullname}</h1>
          <span className="text-sm text-gray-400">{getOnlineUsersStatus(selectedConversation._id)}</span>
        </div>
      </div>
    </div>
  );
}

export default Chatuser;
