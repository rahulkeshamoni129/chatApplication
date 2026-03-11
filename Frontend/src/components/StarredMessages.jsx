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
        const res = await axios.get('/api/messages/starred');
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
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-base-100 w-full max-w-2xl max-h-[80vh] rounded-3xl overflow-hidden shadow-2xl border border-base-200 flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-warning text-warning-content p-6 flex justify-between items-center shadow-md z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black/10 rounded-xl">
                <IoStar size={24} />
            </div>
            <div>
                <h2 className="text-xl font-black uppercase tracking-tight">Starred Messages</h2>
                <p className="text-xs font-bold opacity-70">Your personal collection of important notes</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-circle btn-sm btn-ghost hover:bg-black/20">
             <IoClose size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto bg-base-200 flex-1 flex flex-col gap-3">
          {loading ? (
             <div className="flex justify-center items-center h-48">
                 <Loading />
             </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 opacity-30 gap-4">
                <IoStar size={80} />
                <p className="font-black text-xl">No starred messages yet</p>
            </div>
          ) : (
            messages.map((msg) => (
                <div key={msg._id} className="bg-base-100 p-4 rounded-2xl border border-base-300 shadow-sm hover:border-warning/50 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <div className="avatar">
                                <div className="w-6 rounded-full">
                                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${msg.senderId?.fullname}`} alt="avatar" />
                                </div>
                            </div>
                            <span className="text-xs font-black opacity-80">{msg.senderId?.fullname || "Unknown"}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] opacity-40 font-bold uppercase">
                            <IoTimeOutline />
                            {new Date(msg.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                    <p className="text-sm font-medium leading-relaxed italic border-l-4 border-warning/30 pl-3 py-1 bg-warning/5 rounded-r-lg">
                        "{msg.message}"
                    </p>
                </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default StarredMessages;
