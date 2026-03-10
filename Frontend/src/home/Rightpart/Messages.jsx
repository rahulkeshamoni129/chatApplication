import React, { useEffect, useRef } from 'react'
import Message from './Message'
import useGetMessage from '../../context/useGetMessage.js'
import Loading from '../../components/Loading.jsx'
import useGetSocketMessage from '../../context/useGetSocketMessage.js'

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
  return (
    <div className='flex flex-col gap-2'>
      {loading ? (<Loading />) : (messages.length > 0 &&
        messages.map((message) => {
          return (
            <div key={message._id} ref={lastMsgRef}>
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