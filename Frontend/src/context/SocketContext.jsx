import {useAuth} from "./Authprovider"
import { useEffect } from "react";
import { useContext } from "react";
import { useState } from "react";
import { createContext } from "react";
import io from "socket.io-client"

const socketContext=createContext()
export const useSocketcontext=()=>{
    return useContext(socketContext)
}

export const SocketProvider=({children})=>{
    const[socket,setSocket]=useState(null);
    const [authUser]=useAuth()
    const [onlineUsers,setOnlineUsers]=useState([])
    useEffect(()=>{
        if(authUser){
            const socket=io("http://localhost:3000",{

                query:{
                    userId:authUser.user._id
                },
            });
        setSocket(socket)
        socket.on("getOnlineUsers",(users)=>{
            setOnlineUsers(users);
        })
        return ()=>socket.close()
        }
        else{
            if(socket){
                socket.close();
                setSocket(null)
            }
        }

    },[authUser]) 
    return(
        <socketContext.Provider value={{socket,onlineUsers}}>
            {children}
        </socketContext.Provider>
    )  
}
