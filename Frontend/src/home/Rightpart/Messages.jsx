import React, { useEffect, useRef } from 'react'
import Message from './Message'
import useGetMessage from '../../context/useGetMessage.js'
import Loading from '../../components/Loading.jsx'
import useGetSocketMessage from '../../context/useGetSocketMessage.js'
import { BsPinAngleFill } from 'react-icons/bs'

function Messages() {
  const { loading, messages } = useGetMessage()
  const lastMsgRef = useRef()
  useEffect(() => {
    setTimeout(() => {
      if (lastMsgRef.current) {
        lastMsgRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100)
  }, [messages])
  //console.log(messages)
  const pinnedMessage = messages.findLast(m => m.isPinned);

  return (
    <div className='flex flex-col gap-3 py-4 relative'>
      {pinnedMessage && (
        <div className="sticky top-0 z-20 bg-primary/20 backdrop-blur-md border-b border-primary/20 p-2 flex items-center justify-between animate-in slide-in-from-top duration-300 mx-[-1rem] px-6">
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => document.getElementById(pinnedMessage._id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
            <div className="bg-primary text-primary-content p-1.5 rounded-lg">
                <BsPinAngleFill size={14} className="rotate-45" />
            </div>
            <div className="flex flex-col overflow-hidden">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Pinned Message</span>
                <p className="text-xs truncate opacity-80">{pinnedMessage.message}</p>
            </div>
          </div>
        </div>
      )}
      {loading ? (<Loading />) : (messages.length > 0 &&
        messages.map((message, index) => {
          const prevMessage = index > 0 ? messages[index - 1] : null;
          const showDateSeparator = !prevMessage || 
            new Date(message.createdAt).toDateString() !== new Date(prevMessage.createdAt).toDateString();
          
          return (
            <div key={message._id} ref={index === messages.length - 1 ? lastMsgRef : null}>
              {showDateSeparator && (
                <div className="flex justify-center my-6 sticky top-12 z-[5]">
                   <span className="bg-base-200/80 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest opacity-40 border border-base-300 shadow-sm transition-all hover:opacity-100 hover:scale-110">
                    {(() => {
                      const d = new Date(message.createdAt).toDateString();
                      const today = new Date().toDateString();
                      const yesterday = new Date(Date.now() - 86400000).toDateString();
                      if (d === today) return "Today";
                      if (d === yesterday) return "Yesterday";
                      return new Date(message.createdAt).toLocaleDateString(undefined, { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      });
                    })()}
                   </span>
                </div>
              )}
              <Message message={message} />
            </div>
          )
        }))}
      {!loading && messages.length === 0 && (
        <div className='text-center mt-[20%]'>
          <p>Say! Hi to start a conversation</p>
        </div>
      )}
    </div>
  )
}

export default Messages