import React, { useState } from 'react'
import { BiLogOutCircle } from "react-icons/bi";
import axios from "axios"
import Cookies from "js-cookie"
import toast from 'react-hot-toast';

function Logout() {
  const [loading,setLoading]=useState(false)
  const handleLogout=async()=>{
    try {
      setLoading(true)
      const res =await axios.post("/api/users/logout")
      localStorage.removeItem("chatApp")
      Cookies.remove("jwt")
      setLoading(false)
      toast.success("Logged out successful")
      window.location.reload()
    } catch (error) {
      console.log("Error in Logout",error)
    }
  }
  return (
    <div className='h-[10vh]'>
     <div>
      <BiLogOutCircle className='text-5xl text-white hover:bg-slate-700 duration-300 cursor-pointer rounded-full p-2 ml-2' onClick={handleLogout}/>
     </div>
    </div>
  )
}

export default Logout