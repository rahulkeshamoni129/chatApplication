import React, { useState } from 'react';
import { 
  IoChatbubblesOutline, 
  IoImagesOutline, 
  IoSettingsOutline, 
  IoShieldCheckmarkOutline, 
  IoPowerOutline,
  IoAppsOutline
} from 'react-icons/io5';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/Authprovider';
import Settings from '../../components/Settings';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

function SidebarRail() {
  const [authUser] = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await axios.post("/api/users/logout");
      localStorage.removeItem("chatApp");
      Cookies.remove("jwt");
      setLoading(false);
      toast.success("Logged out successfully");
      window.location.reload();
    } catch (error) {
      console.log("Error in Logout", error);
      toast.error("Logout failed");
    }
  };

  const RailIcon = ({ icon: Icon, title, onClick, active, color = "" }) => (
    <div className="relative flex items-center justify-center w-full">
      {active && <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"></div>}
      <div 
        className={`relative flex items-center justify-center w-11 h-11 rounded-2xl cursor-pointer transition-all duration-300 group ${active ? 'bg-primary/10 text-primary shadow-sm' : 'text-base-content/30 hover:bg-base-200 hover:text-base-content'}`}
        onClick={onClick}
        title={title}
      >
        <Icon size={22} className={color} />
      </div>
    </div>
  );

  return (
    <div className="w-16 h-full bg-base-100 border-r border-base-200 flex flex-col items-center py-6 gap-8 z-20">
      {/* Echo Logo */}
      <div className="w-10 h-10 bg-primary text-primary-content rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 mb-2 select-none">
        <span className="text-lg font-black tracking-tighter">E</span>
      </div>

      {/* Navigation Icons */}
      <div className="flex flex-col gap-4 w-full">
        <RailIcon icon={IoChatbubblesOutline} title="Chats" active={true} />
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-4 mt-auto">
        {authUser?.user?.isAdmin && (
          <Link to="/admin">
            <RailIcon icon={IoShieldCheckmarkOutline} title="Admin Dashboard" color="text-warning" />
          </Link>
        )}
        
        <RailIcon icon={IoSettingsOutline} title="Settings" onClick={() => setShowSettings(true)} />
        
        <RailIcon 
          icon={loading ? () => <span className="loading loading-spinner loading-xs"></span> : IoPowerOutline} 
          title="Logout" 
          onClick={handleLogout}
          color="text-error"
        />
      </div>

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default SidebarRail;
