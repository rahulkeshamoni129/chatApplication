import React, { createContext, useContext, useState } from 'react'
import Cookies from "js-cookie"

//local storage of the user where we can use it globally
export const AuthContext=createContext()

//children can be all the components that we did in our project like login signup leftpart,rightpart,app.jsx 
export const Authprovider=({children})=> {
    //retrieving user information stored in the browser
    const initialUserState = localStorage.getItem("chatApp");
    let user = undefined;
    try {
        if (initialUserState) user = JSON.parse(initialUserState);
    } catch (e) {
        console.error("Auth initialization error:", e);
        localStorage.removeItem("chatApp");
    }
    const [authUser, setAuthUser] = useState(user);
  return (
    <AuthContext.Provider value={[authUser,setAuthUser]}>
    {children}
    </AuthContext.Provider>
  )
}

export const useAuth=()=>useContext(AuthContext);