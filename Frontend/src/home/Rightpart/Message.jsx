import React, { useState } from 'react'
import { FaTrash, FaReply, FaPencilAlt, FaStar, FaRegStar, FaShare } from 'react-icons/fa'
import { IoCheckmarkDoneOutline, IoCheckmarkOutline, IoEyeOutline } from 'react-icons/io5'
import { BsPinAngle, BsPinAngleFill } from 'react-icons/bs'
import { MdOutlineAddReaction } from "react-icons/md";
import axios from 'axios'
import toast from 'react-hot-toast'
import useDeleteMessage from '../../context/useDeleteMessage.js'
import useConversation from '../../zustand/useConversation.js'
import ForwardModal from '../../components/ForwardModal'

import { Link } from 'react-router-dom'

function Message({ message }) {
  const authUser = JSON.parse(localStorage.getItem('chatApp'))
  const { setEditingMessage, setReplyingTo, updateMessage, selectedConversation } = useConversation();
  const [showForward, setShowForward] = useState(false);
  const [showSeenBy, setShowSeenBy] = useState(false);
  const senderId = message.senderId?._id || message.senderId;
  const itsMe = senderId === authUser.user._id;

  // E2EE: Logic removed - messages are pre-decrypted by hooks
  const decryptedContent = message.message;
  const decryptedReply = message.replyTo?.message;

  const isAdmin = authUser.user.isAdmin;
  const { deleteMessage } = useDeleteMessage();
  const isStarred = message.starredBy?.includes(authUser.user._id);

  const chatName = itsMe ? "chat-end" : "chat-start"
  const chatBubbleStyle = itsMe 
    ? "bg-primary text-primary-content shadow-lg shadow-primary/20 rounded-2xl rounded-tr-none" 
    : "bg-base-100 text-base-content border border-base-200 shadow-sm rounded-2xl rounded-tl-none"

  // Format DateTime
  const createdAt = new Date(message.createdAt)
  const formattedTime = createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const isEditable = itsMe && (new Date() - new Date(message.createdAt)) < 5 * 60 * 1000;

  const reactionEmojis = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

  const reactionsGrouped = message.reactions?.reduce((acc, curr) => {
    acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
    return acc;
  }, {});

  const handleToggleStar = async () => {
    try {
      const res = await axios.put(`/api/message/star/${message._id}`);
      updateMessage({ ...message, starredBy: res.data.starredBy });
      toast.success(isStarred ? "Message unstarred" : "Message starred");
    } catch (error) {
      toast.error("Failed to update star status");
    }
  }

  const handleToggleReaction = async (emoji) => {
    try {
      const res = await axios.put(`/api/message/reaction/${message._id}`, { emoji });
      updateMessage({ ...message, reactions: res.data.reactions });
    } catch (error) {
      console.log("Error reacting:", error);
    }
  }


  return (
    <div id={message._id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className='group'>
        <div className={`chat ${chatName}`}>
          <div className={`relative max-w-[85%] sm:max-w-[75%] ${itsMe ? 'ml-auto' : ''}`}>
            <div className={`chat-bubble ${chatBubbleStyle} min-h-0 py-2.5 px-3 relative text-[13px] font-medium leading-relaxed w-fit max-w-full pb-6 pr-10`}>
              {selectedConversation?.isGroup && !itsMe && (
                <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-1 opacity-80">
                  {message.senderId?.fullname || "Unknown User"}
                </div>
              )}
              {message.replyTo && (
                <div 
                  className={`border-l-4 p-2 rounded-xl mb-2 text-[11px] cursor-pointer transition-all min-w-[150px] max-w-[95%] overflow-hidden shadow-sm ${
                    itsMe 
                      ? 'bg-white/15 border-white/40 text-primary-content font-medium' 
                      : 'bg-base-300 border-primary text-base-content/80'
                  }`}
                  onClick={() => {
                    const el = document.getElementById(message.replyTo._id);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                >
                  <p className={`font-black text-[9px] uppercase tracking-wider mb-0.5 ${
                    itsMe ? 'text-primary-content/80' : 'text-primary'
                  }`}>
                    {message.replyTo.senderId === authUser.user._id ? "You" : "Them"}
                  </p>
                  <p className="italic leading-tight whitespace-pre-wrap">
                    "{decryptedReply || "[Message Unreadable]"}"
                  </p>
                </div>
              )}
              
              <div className="whitespace-pre-wrap break-words inline-block min-w-[20px]">
                {decryptedContent}
                {message.edited && (
                  <span className="text-[9px] opacity-50 ml-2 font-black italic uppercase tracking-tighter">Edited</span>
                )}
              </div>

              {/* Time and Status inside bubble */}
              <div className={`absolute bottom-1 right-2 flex items-center gap-1.5 select-none ${itsMe ? 'opacity-70' : 'opacity-40'}`}>
                <span className="text-[9px] font-black tracking-tighter">{formattedTime}</span>
                {itsMe && (
                  <div className="flex items-center translate-y-[0.5px]">
                    {selectedConversation?.isGroup ? (
                      <div className="relative group/seen">
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowSeenBy(!showSeenBy); }}
                          className="flex items-center transition-colors"
                        >
                          {message.seenBy?.length > 0 ? (
                            <span className="flex items-center text-primary-content">
                              <IoCheckmarkDoneOutline size={13} className="stroke-[3]" />
                            </span>
                          ) : (
                            <IoCheckmarkOutline size={13} className="text-primary-content/60" />
                          )}
                        </button>
                        {showSeenBy && message.seenBy?.length > 0 && (
                          <div className="absolute bottom-full right-0 mb-2 w-36 bg-base-100 border border-base-300 rounded-2xl shadow-2xl p-3 z-50 animate-in slide-in-from-bottom-2 text-base-content">
                            <p className="font-black text-[9px] uppercase opacity-40 mb-2 tracking-widest border-b border-base-200 pb-1">Seen by</p>
                            <div className="flex flex-col gap-1.5">
                               {message.seenBy.map((s, idx) => (
                                 <p key={idx} className="text-[10px] font-bold truncate">{s.userId?.fullname || "Unknown"}</p>
                               ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      message.seen ? (
                        <IoCheckmarkDoneOutline className={`${itsMe ? 'text-primary-content' : 'text-primary'} stroke-[3]`} size={13} />
                      ) : (
                        <IoCheckmarkOutline className="text-primary-content/60" size={13} />
                      )
                    )}
                  </div>
                )}
              </div>

              {isStarred && (
                <div className="absolute -top-1.5 -right-1.5 bg-warning text-warning-content p-1 rounded-full shadow-md scale-75 animate-in zoom-in">
                   <FaStar size={10} />
                </div>
              )}

              {/* Enhanced Quick Actions Bar */}
              <div className={`absolute bottom-[-24px] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-[50] ${itsMe ? 'right-0' : 'left-0'}`}>
                <div className="flex bg-base-200/80 backdrop-blur-md border border-base-300 rounded-xl p-0.5 shadow-xl glass">
                  <button onClick={() => setReplyingTo(message)} className="p-1.5 hover:bg-base-300 rounded-lg text-base-content/60 hover:text-primary transition-colors" title="Reply">
                    <FaReply size={10} />
                  </button>

                  <div className="dropdown dropdown-top dropdown-end">
                    <label tabIndex={0} className="p-1.5 hover:bg-base-300 rounded-lg text-base-content/60 hover:text-primary cursor-pointer flex items-center">
                      <MdOutlineAddReaction size={12} />
                    </label>
                    <div tabIndex={0} className="dropdown-content z-[1] menu p-1 shadow-2xl bg-base-100 rounded-2xl flex flex-row gap-0.5 mb-2 border border-base-200 animate-in slide-in-from-bottom-2">
                      {reactionEmojis.map(emoji => (
                        <button
                          key={emoji}
                          className="hover:bg-base-200 p-2 rounded-xl transition-transform hover:scale-125 duration-200"
                          onClick={() => handleToggleReaction(emoji)}
                        >
                          <span className="text-base">{emoji}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button onClick={handleToggleStar} className={`p-1.5 hover:bg-base-300 rounded-lg transition-colors ${isStarred ? 'text-warning' : 'text-base-content/60 hover:text-warning'}`} title={isStarred ? "Unstar" : "Star"}>
                    {isStarred ? <FaStar size={11} /> : <FaRegStar size={11} />}
                  </button>

                  {(itsMe || isAdmin) && (
                    <button onClick={() => deleteMessage(message._id)} className="p-1.5 hover:bg-error/10 rounded-lg text-base-content/60 hover:text-error transition-colors" title="Delete">
                      <FaTrash size={10} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Reactions Display - Modern Chips */}
            {message.reactions?.length > 0 && (
              <div className={`flex flex-wrap gap-1 mt-1.5 ${itsMe ? 'justify-end' : 'justify-start'}`}>
                {Object.entries(reactionsGrouped).map(([emoji, count]) => (
                  <div
                    key={emoji}
                    onClick={() => handleToggleReaction(emoji)}
                    className="bg-base-100 border border-base-200 rounded-full px-2 py-0.5 text-[11px] cursor-pointer hover:bg-base-200 hover:scale-110 active:scale-95 transition-all flex items-center gap-1 shadow-sm font-black"
                  >
                    <span>{emoji}</span>
                    {count > 1 && <span className="opacity-40 text-[9px]">{count}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {showForward && <ForwardModal message={message} onClose={() => setShowForward(false)} />}
    </div>
  )
}

export default Message