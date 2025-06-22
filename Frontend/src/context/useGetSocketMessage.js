import React, { useEffect } from 'react'
import { useSocketcontext } from './SocketContext'
import useConversation from '../zustand/useConversation.js'

const  useGetSocketMessage=()=>{
    const {socket}=useSocketcontext()
    const {messages,setMessage}=useConversation()
    useEffect(()=>{
        //  socket?.on("newMessage", (newMessage) => {
        //     setMessage((prevMessages) => [...prevMessages, newMessage])
        //  })
        
        socket.on("newMessage",(newMessage)=>{
            setMessage([...messages,newMessage]);
        });
        return ()=>{
            socket.off("newMessage")
        }
    },[socket,messages,setMessage])
 
}

export default useGetSocketMessage