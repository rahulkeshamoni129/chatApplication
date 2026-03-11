import React, { useState, useEffect } from 'react';
import { BiLogOutCircle } from "react-icons/bi";
import { FaSun, FaMoon } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import axios from "axios";
import Cookies from "js-cookie";
import toast from 'react-hot-toast';
import { useTranslation } from '../../context/TranslationContext';
import Settings from '../../components/Settings';
import { useAuth } from '../../context/Authprovider';
import { IoShieldCheckmarkOutline } from 'react-icons/io5';
import { Link } from 'react-router-dom';

function Logout() {
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark")
  const { lang, setLang, t } = useTranslation();
  const [authUser] = useAuth();

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
      toast.success("Logged out successfully")
      window.location.reload()
    } catch (error) {
      console.log("Error in Logout", error)
      toast.error("Logout failed");
    }
  }

  return (
    <div className='h-[10vh] px-4 flex justify-between items-center bg-base-300 border-t border-base-200'>
      <div className='flex gap-2 items-center'>
        <BiLogOutCircle className='text-4xl text-base-content hover:bg-base-200 duration-300 cursor-pointer rounded-full p-2' onClick={handleLogout} />
        <span className="text-xs font-bold uppercase tracking-wider">{t('logout')}</span>
      </div>

      <div className="flex items-center gap-1">
        {/* Language Selector */}
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="select select-ghost select-xs text-[10px] focus:outline-none"
        >
          <option value="en">EN</option>
          <option value="hi">हि</option>
          <option value="es">ES</option>
        </select>

        {authUser?.user?.isAdmin && (
          <Link to="/admin" className="btn btn-ghost btn-xs btn-circle text-xl text-warning hover:bg-base-200" title="Admin Control Dashboard">
            <IoShieldCheckmarkOutline />
          </Link>
        )}

        <button onClick={() => setShowSettings(true)} className="btn btn-ghost btn-xs btn-circle text-xl text-base-content hover:bg-base-200" title="Settings">
          <IoSettingsOutline />
        </button>

        <button onClick={toggleTheme} className="btn btn-ghost btn-xs btn-circle text-xl text-base-content hover:bg-base-200">
          {theme === "dark" ? <FaSun className="text-warning" /> : <FaMoon className="text-primary" />}
        </button>
      </div>

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  )
}

export default Logout;