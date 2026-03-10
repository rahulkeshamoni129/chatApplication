import React from 'react'
import { FaTrash, FaReply, FaPencilAlt, FaStar, FaRegStar } from 'react-icons/fa'
import { IoCheckmarkDoneOutline, IoCheckmarkOutline } from 'react-icons/io5'
import { MdOutlineAddReaction } from "react-icons/md";
import axios from 'axios'
import toast from 'react-hot-toast'
import useDeleteMessage from '../../context/useDeleteMessage.js'
import useConversation from '../../zustand/useConversation.js'

function Message({ message }) {
  const authUser = JSON.parse(localStorage.getItem('chatApp'))
  const { setEditingMessage, setReplyingTo, updateMessage } = useConversation();
  const itsMe = message.senderId === authUser.user._id;
  const isAdmin = authUser.user.isAdmin;
  const { deleteMessage } = useDeleteMessage();
  const isStarred = message.starredBy?.includes(authUser.user._id);

  const chatName = itsMe ? "chat-end" : "chat-start"
  const chatColor = itsMe ? "bg-primary text-primary-content" : "bg-base-200 text-base-content border border-base-300"

  // Format DateTime
  const createdAt = new Date(message.createdAt)
  const formattedTime = createdAt.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
  const formattedDate = createdAt.toLocaleDateString([], {
    month: 'short',
    day: 'numeric'
  })

  const isEditable = itsMe && (new Date() - new Date(message.createdAt)) < 5 * 60 * 1000;

  const handleToggleStar = async () => {
    try {
      const res = await axios.put(`/api/message/star/${message._id}`);
      updateMessage({ ...message, starredBy: res.data.starredBy });
      toast.success(isStarred ? "Message unstarred" : "Message starred");
    } catch (error) {
      console.log("Error starring message:", error);
      toast.error("Failed to update star status");
    }
  }

  const reactionsGrouped = message.reactions?.reduce((acc, curr) => {
    acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
    return acc;
  }, {});

  const handleToggleReaction = async (emoji) => {
    try {
      const res = await axios.put(`/api/message/reaction/${message._id}`, { emoji });
      updateMessage({ ...message, reactions: res.data.reactions });
    } catch (error) {
      console.log("Error reacting:", error);
    }
  }

  const reactionEmojis = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

  return (
    <div id={message._id}>
      <div className='group'>
        <div className={`chat ${chatName}`}>
          <div className="relative">
            <div className={`chat-bubble ${chatColor} shadow-sm relative text-sm flex flex-col gap-1`}>
              {message.replyTo && (
                <div className="bg-base-300/30 border-l-4 border-primary p-2 rounded mb-1 text-[11px] opacity-80 cursor-pointer hover:bg-base-300/50 transition-all max-w-[200px]">
                  <p className="font-bold text-primary truncate">
                    {message.replyTo.senderId === authUser.user._id ? "You" : "Them"}
                  </p>
                  <p className="truncate italic">"{message.replyTo.message}"</p>
                </div>
              )}
              <div className="pr-4">
                {message.message}
                {message.edited && (
                  <span className="text-[10px] opacity-70 ml-2 italic">(edited)</span>
                )}
              </div>

              {isStarred && (
                <FaStar className="absolute top-2 right-2 text-warning text-[10px]" />
              )}

              {/* Actions */}
              <div className={`absolute top-1/2 transform -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${itsMe ? '-left-36' : '-right-28'}`}>
                {/* Reaction Picker Dropdown */}
                <div className="dropdown dropdown-top dropdown-end">
                  <label tabIndex={0} className="hover:text-primary p-1 cursor-pointer">
                    <MdOutlineAddReaction size={14} />
                  </label>
                  <div tabIndex={0} className="dropdown-content z-[1] menu p-1 shadow-2xl bg-base-100 rounded-full flex flex-row gap-0.5 mb-2 border border-base-200 animate-in slide-in-from-bottom-2">
                    {reactionEmojis.map(emoji => (
                      <button
                        key={emoji}
                        className="hover:bg-base-200 p-1.5 rounded-full transition-transform hover:scale-125 duration-200"
                        onClick={() => handleToggleReaction(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={() => setReplyingTo(message)} className="hover:text-primary p-1" title="Reply">
                  <FaReply size={12} />
                </button>

                <button onClick={handleToggleStar} className="hover:text-warning p-1" title={isStarred ? "Unstar" : "Star"}>
                  {isStarred ? <FaStar size={12} /> : <FaRegStar size={12} />}
                </button>

                {isEditable && (
                  <button onClick={() => setEditingMessage(message)} className="hover:text-warning p-1" title="Edit Message">
                    <FaPencilAlt size={12} />
                  </button>
                )}

                {(itsMe || isAdmin) && (
                  <button onClick={() => deleteMessage(message._id)} className="hover:text-error p-1" title={isAdmin && !itsMe ? "Admin: Delete Message" : "Unsend Message"}>
                    <FaTrash size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Reactions Display */}
            {message.reactions?.length > 0 && (
              <div className={`flex flex-wrap gap-1 mt-1 ${itsMe ? 'justify-end' : 'justify-start'}`}>
                {Object.entries(reactionsGrouped).map(([emoji, count]) => (
                  <div
                    key={emoji}
                    onClick={() => handleToggleReaction(emoji)}
                    className="bg-base-200 border border-base-300 rounded-full px-1.5 py-0.5 text-[10px] cursor-pointer hover:bg-base-300 transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <span>{emoji}</span>
                    {count > 1 && <span className="font-bold opacity-60 ml-0.5">{count}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className={`chat-footer opacity-50 text-[10px] mt-1 font-medium flex items-center gap-1 ${itsMe ? 'justify-end' : 'justify-start'}`}>
            {formattedDate} {formattedTime}
            {itsMe && (
              <span>
                {message.seen ? (
                  <IoCheckmarkDoneOutline className="text-blue-500 text-sm" />
                ) : (
                  <IoCheckmarkOutline className="text-sm" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Message