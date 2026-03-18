import React, { useState, useEffect } from 'react';
import { IoClose, IoStar, IoTimeOutline, IoPersonOutline } from 'react-icons/io5';
import axios from 'axios';
import Loading from './Loading';

function StarredMessages({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStarred = async () => {
      try {
        const res = await axios.get('/api/message/starred');
        setMessages(res.data);
      } catch (error) {
        console.log("Error fetching starred messages:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStarred();
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
        {/* Sub-Header */}
        <div className="flex items-center gap-3 mb-4 p-3 bg-warning/10 rounded-2xl border border-warning/20">
            <div className="p-2 bg-warning text-warning-content rounded-xl shadow-sm">
                <IoStar size={20} />
            </div>
            <div>
                <h2 className="text-sm font-black uppercase tracking-tight text-warning">Important Notes</h2>
                <p className="text-[10px] font-bold opacity-60">Your bookmarked messages</p>
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4 custom-scrollbar">
          {loading ? (
             <div className="flex justify-center items-center h-full">
                 <div className="loading loading-spinner loading-lg text-primary opacity-20"></div>
             </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-10 gap-4">
                <IoStar size={80} />
                <p className="font-black text-xl tracking-[0.3em] uppercase">Empty</p>
            </div>
          ) : (
            messages.map((msg) => (
                <div key={msg._id} className="bg-base-200/40 p-5 rounded-[1.5rem] border border-base-300/50 hover:border-primary/30 transition-all hover:bg-base-200 group relative">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                                {msg.senderId?.fullname?.charAt(0) || "?"}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-black tracking-tight">{msg.senderId?.fullname || "Unknown User"}</span>
                                <span className="text-[9px] opacity-40 font-bold uppercase tracking-wider">{new Date(msg.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                        <div className="p-1.5 bg-warning/10 text-warning rounded-lg opacity-40 group-hover:opacity-100 transition-opacity">
                            <IoStar size={14} />
                        </div>
                    </div>
                    <p className="text-sm font-medium leading-relaxed opacity-80 pl-11">
                        {msg.message}
                    </p>
                </div>
            ))
          )}
        </div>
    </div>
  );
}

export default StarredMessages;
