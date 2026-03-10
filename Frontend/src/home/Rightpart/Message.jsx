import React from 'react'
import { FaTrash } from 'react-icons/fa'
import useDeleteMessage from '../../context/useDeleteMessage.js'

function Message({ message }) {
  const authUser = JSON.parse(localStorage.getItem('chatApp'))
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

  return (
    <div>
      <div className='group'>
        <div className={`chat ${chatName}`}>
          <div className={`chat-bubble ${chatColor} shadow-sm relative text-sm`}>
            {message.message}
            {itsMe && (
              <button
                onClick={() => deleteMessage(message._id)}
                className="absolute -left-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 text-error hover:scale-110 duration-200 p-2"
                title="Unsend Message"
              >
                <FaTrash size={12} />
              </button>
            )}
          </div>
          <div className='chat-footer opacity-50 text-[10px] mt-1 font-medium'>
            {formattedDate} {formattedTime}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Message