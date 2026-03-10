import React, { useState, useEffect } from 'react'
import { BiLogOutCircle } from "react-icons/bi";
import { FaSun, FaMoon } from "react-icons/fa";
import axios from "axios"
import Cookies from "js-cookie"
import toast from 'react-hot-toast';

function Logout() {
  const [loading, setLoading] = useState(false)
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark")

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    try {
      setLoading(true)
      const res = await axios.post("/api/users/logout")
      localStorage.removeItem("chatApp")
      Cookies.remove("jwt")
      setLoading(false)
      toast.success("Logged out successful")
      window.location.reload()
    } catch (error) {
      console.log("Error in Logout", error)
    }
  }
  return (
    <div className='h-[10vh] px-4 flex justify-between items-center bg-base-300'>
      <div className='flex gap-2 items-center'>
        <BiLogOutCircle className='text-5xl text-base-content hover:bg-base-200 duration-300 cursor-pointer rounded-full p-2' onClick={handleLogout} />
        <span className="text-sm">Logout</span>
      </div>

      <button onClick={toggleTheme} className="btn btn-ghost btn-circle text-2xl text-base-content">
        {theme === "dark" ? <FaSun /> : <FaMoon />}
      </button>
    </div>
  )
}

export default Logout