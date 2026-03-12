import React, { useEffect } from "react";
import Chatuser from "./Chatuser";
import Messages from "./Messages";
import Typesend from "./Typesend";
import useConversation from "../../zustand/useConversation.js";
import { useAuth } from "../../context/Authprovider.jsx";
import { CiMenuFries } from "react-icons/ci";
import useGetSocketMessage from "../../context/useGetSocketMessage.js";
import useMarkSeen from "../../context/useMarkSeen.js";
import { useSocketcontext } from "../../context/SocketContext.jsx";
import { IoMegaphoneOutline, IoClose } from "react-icons/io5";

function Right() {
  const { selectedConversation, setSelectedConversation } = useConversation();
  useGetSocketMessage();
  useMarkSeen();
  useEffect(() => {
    return setSelectedConversation(null);
  }, [setSelectedConversation]);

  const { announcements, setAnnouncements } = useSocketcontext();
  const latestAnnouncement = announcements[0] || null;

  return (
    <div className="w-full h-full bg-base-100 text-base-content relative flex flex-col overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>

      {/* Floating Announcement Banner (shows in chat view too) */}
      {latestAnnouncement && selectedConversation && (
        <div className="relative z-[200] animate-in slide-in-from-top duration-500">
          <div className="bg-primary/10 border-b border-primary/20 px-6 py-2.5 flex items-center gap-3">
            <div className="bg-primary/20 text-primary p-1.5 rounded-lg shrink-0">
              <IoMegaphoneOutline size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-black uppercase tracking-widest text-primary mr-2">Echo Announcement</span>
              <span className="text-xs font-medium text-base-content truncate">{latestAnnouncement.message}</span>
            </div>
            <button
              onClick={() => setAnnouncements(prev => prev.filter(a => a.id !== latestAnnouncement.id))}
              className="text-base-content/30 hover:text-base-content/70 transition-colors shrink-0"
            >
              <IoClose size={14} />
            </button>
          </div>
        </div>
      )}

      {!selectedConversation ? (
        <NoChatSelected />
      ) : (
        <>
          <Chatuser />
          <div
            className="flex-1 hide-scroll overflow-y-auto px-4 py-2 relative z-10"
          >
            <Messages />
          </div>
          <Typesend />
        </>
      )}
    </div>
  );
}

export default Right;

const NoChatSelected = () => {
  const [authUser] = useAuth();
  const { announcements, setAnnouncements } = useSocketcontext();

  const dismissAnnouncement = (id) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const formatTime = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative flex-1 h-full flex flex-col justify-center items-center overflow-hidden">
      <label
        htmlFor="my-drawer-2"
        className="btn btn-ghost drawer-button lg:hidden absolute left-5 top-5"
      >
        <CiMenuFries className="text-white text-xl" />
      </label>

      {/* Announcements Panel - top area */}
      {announcements.length > 0 && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-10 flex flex-col gap-2">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="animate-in slide-in-from-top-3 fade-in duration-500 bg-base-100/80 backdrop-blur-md border border-primary/20 rounded-2xl shadow-xl shadow-primary/10 px-4 py-3 flex gap-3 items-start"
            >
              <div className="w-8 h-8 bg-primary/10 text-primary flex items-center justify-center rounded-xl shrink-0 mt-0.5">
                <IoMegaphoneOutline size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary">Echo · Announcement</span>
                  <span className="text-[9px] opacity-30 font-bold">{formatTime(ann.sentAt)}</span>
                </div>
                <p className="text-sm font-medium leading-snug text-base-content">{ann.message}</p>
                <p className="text-[9px] text-base-content/30 font-bold mt-1 uppercase tracking-wider">From: {ann.sentBy}</p>
              </div>
              <button
                onClick={() => dismissAnnouncement(ann.id)}
                className="text-base-content/20 hover:text-base-content/60 transition-colors mt-0.5 shrink-0"
              >
                <IoClose size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Welcome Message */}
      <div className="text-center p-10 max-w-md animate-in fade-in zoom-in duration-500">
        <div className="mb-6 relative inline-flex items-center justify-center">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary">
            <CiMenuFries size={40} className="opacity-20" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight">
          Welcome back, <span className="font-black text-primary">{authUser.user.fullname}</span>
        </h1>
        <p className="mt-3 text-base-content/40 text-sm font-medium leading-relaxed">
          Select a conversation to start chatting. Echo announcements will appear at the top.
        </p>
      </div>
    </div>
  );
};