import React from 'react'
import { FaTrash, FaReply, FaPencilAlt } from 'react-icons/fa'
import { IoCheckmarkDoneOutline, IoCheckmarkOutline } from 'react-icons/io5'
import useDeleteMessage from '../../context/useDeleteMessage.js'
import useConversation from '../../zustand/useConversation.js'

function Message({ message }) {
  const authUser = JSON.parse(localStorage.getItem('chatApp'))
  const { setEditingMessage, setReplyingTo } = useConversation();
  const itsMe = message.senderId === authUser.user._id;
  const { deleteMessage } = useDeleteMessage();

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

  return (
    <div>
      <div className='group'>
        <div className={`chat ${chatName}`}>
          <div className={`chat-bubble ${chatColor} shadow-sm relative text-sm flex flex-col gap-1`}>
            {message.replyTo && (
              <div className="bg-base-300/30 border-l-4 border-primary p-2 rounded mb-1 text-[11px] opacity-80 cursor-pointer hover:bg-base-300/50 transition-all max-w-[200px]">
                <p className="font-bold text-primary truncate">
                  {message.replyTo.senderId === authUser.user._id ? "You" : "Them"}
                </p>
                <p className="truncate italic">"{message.replyTo.message}"</p>
              </div>
            )}
            <div>
              {message.message}
              {message.edited && (
                <span className="text-[10px] opacity-70 ml-2 italic">(edited)</span>
              )}
            </div>

            {/* Actions: Edit, Delete, Reply */}
            <div className={`absolute top-1/2 transform -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${itsMe ? '-left-20' : '-right-12'}`}>
              <button
                onClick={() => setReplyingTo(message)}
                className="hover:text-primary p-1"
                title="Reply"
              >
                <FaReply size={12} />
              </button>

              {isEditable && (
                <button
                  onClick={() => setEditingMessage(message)}
                  className="hover:text-warning p-1"
                  title="Edit Message"
                >
                  <FaPencilAlt size={12} />
                </button>
              )}

              {itsMe && (
                <button
                  onClick={() => deleteMessage(message._id)}
                  className="hover:text-error p-1"
                  title="Unsend Message"
                >
                  <FaTrash size={12} />
                </button>
              )}
            </div>
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