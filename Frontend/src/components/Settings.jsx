import React, { useState, useEffect } from 'react';
import { IoClose, IoPersonOutline, IoLockClosedOutline, IoColorPaletteOutline, IoStarOutline, IoLeafOutline, IoMoonOutline, IoSunnyOutline } from 'react-icons/io5';
import axios from 'axios';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/Authprovider';
import StarredMessages from './StarredMessages';
import useTheme from '../zustand/useTheme';

const THEMES = [
    { id: "light", icon: <IoSunnyOutline />, color: "bg-white" },
    { id: "dark", icon: <IoMoonOutline />, color: "bg-neutral" },
];

function Settings({ onClose }) {
    const [authUser, setAuthUser] = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const { theme, setTheme } = useTheme();

    // Profile State
    const [profileData, setProfileData] = useState({
        fullname: authUser?.user?.fullname || "",
        bio: authUser?.user?.bio || ""
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.put('/api/users/update', profileData);
            const updatedAuth = { ...authUser, user: res.data.user };
            localStorage.setItem("chatApp", JSON.stringify(updatedAuth));
            setAuthUser(updatedAuth);
            toast.success(res.data.message);
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error("New passwords do not match");
        }
        try {
            setLoading(true);
            const res = await axios.put('/api/users/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success(res.data.message);
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    const NavItem = ({ id, label, icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === id ? 'bg-primary text-primary-content shadow-lg shadow-primary/20 scale-[1.02]' : 'hover:bg-base-200 opacity-60 hover:opacity-100'}`}
        >
            {icon}
            <span className="text-sm">{label}</span>
        </button>
    );

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-10 animate-in fade-in duration-300">
            <div className="bg-base-100 w-full max-w-4xl h-full max-h-[600px] rounded-[2rem] overflow-hidden shadow-2xl border border-base-200 flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
                
                {/* Sidebar */}
                <div className="w-full md:w-64 bg-base-200/50 border-r border-base-200 p-6 flex flex-col gap-6">
                    <div className="flex items-center justify-between md:mb-4">
                        <h2 className="text-2xl font-black italic tracking-tighter text-primary">SETTINGS</h2>
                        <button onClick={onClose} className="btn btn-circle btn-xs btn-ghost md:hidden">
                            <IoClose size={20} />
                        </button>
                    </div>

                    <div className="flex flex-row md:flex-col gap-1 overflow-x-auto no-scrollbar">
                        <NavItem id="profile" label="Profile" icon={<IoPersonOutline size={20} />} />
                        <NavItem id="security" label="Security" icon={<IoLockClosedOutline size={20} />} />
                        <NavItem id="appearance" label="Appearance" icon={<IoColorPaletteOutline size={20} />} />
                        <NavItem id="starred" label="Starred" icon={<IoStarOutline size={20} />} />
                    </div>

                    <div className="hidden md:block mt-auto bg-base-300/50 p-4 rounded-2xl border border-base-300">
                        <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mb-2">Logged in as</p>
                        <p className="text-xs font-bold truncate">{authUser?.user?.fullname}</p>
                        <p className="text-[9px] opacity-50 truncate">@{authUser?.user?.username}</p>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden bg-base-100 relative">
                    <button onClick={onClose} className="absolute top-6 right-6 btn btn-circle btn-sm btn-ghost z-50 hidden md:flex">
                        <IoClose size={24} />
                    </button>

                    <div className="p-6 md:p-10 overflow-y-auto h-full flex-1">
                        {activeTab === 'profile' && (
                            <div className="animate-in slide-in-from-bottom-5 duration-300 h-full flex flex-col">
                                <h3 className="text-2xl font-black mb-6">Profile Settings</h3>
                                <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-md">
                                    <div className="flex items-center gap-6 p-4 bg-base-200 rounded-2xl">
                                        <div className="avatar">
                                            <div className="w-20 rounded-2xl ring ring-primary ring-offset-base-100 ring-offset-4">
                                                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${profileData.fullname}`} alt="avatar" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold opacity-50">Profile Picture</p>
                                            <p className="text-xs opacity-40">Initials updated based on your name</p>
                                        </div>
                                    </div>

                                    <div className="form-control flex flex-col gap-2">
                                        <label className="label pb-0"><span className="label-text font-bold opacity-60 text-xs uppercase tracking-widest">Full Name</span></label>
                                        <input
                                            type="text"
                                            className="input input-bordered w-full bg-base-200 focus:bg-base-100 transition-all font-medium rounded-xl"
                                            value={profileData.fullname}
                                            onChange={(e) => setProfileData({ ...profileData, fullname: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-control flex flex-col gap-2">
                                        <label className="label pb-0"><span className="label-text font-bold opacity-60 text-xs uppercase tracking-widest">Bio / Status</span></label>
                                        <textarea
                                            className="textarea textarea-bordered h-28 bg-base-200 focus:bg-base-100 transition-all font-medium rounded-xl leading-relaxed"
                                            value={profileData.bio}
                                            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                            placeholder="Introduce yourself to the world..."
                                        ></textarea>
                                    </div>

                                    <button disabled={loading} className="btn btn-primary btn-block rounded-xl shadow-lg shadow-primary/20">
                                        {loading && <span className="loading loading-spinner"></span>}
                                        Update Profile
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="animate-in slide-in-from-bottom-5 duration-300 h-full flex flex-col">
                                <h3 className="text-2xl font-black mb-6">Security & Password</h3>
                                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                                    <div className="alert alert-warning text-xs font-bold rounded-xl py-3 border-none bg-warning/20 text-warning-content">
                                        <span>Keep your password safe and don't share it with others.</span>
                                    </div>
                                    <div className="form-control">
                                        <label className="label"><span className="label-text font-bold opacity-60 text-xs uppercase tracking-widest">Current Password</span></label>
                                        <input
                                            type="password"
                                            className="input input-bordered w-full bg-base-200 focus:bg-base-100 transition-all rounded-xl"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-control">
                                        <label className="label"><span className="label-text font-bold opacity-60 text-xs uppercase tracking-widest">New Password</span></label>
                                        <input
                                            type="password"
                                            className="input input-bordered w-full bg-base-200 focus:bg-base-100 transition-all rounded-xl"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-control">
                                        <label className="label"><span className="label-text font-bold opacity-60 text-xs uppercase tracking-widest">Confirm New Password</span></label>
                                        <input
                                            type="password"
                                            className="input input-bordered w-full bg-base-200 focus:bg-base-100 transition-all rounded-xl"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <button disabled={loading} className="btn btn-primary btn-block mt-4 rounded-xl shadow-lg shadow-primary/20">
                                        {loading && <span className="loading loading-spinner"></span>}
                                        Change Password
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div className="animate-in slide-in-from-bottom-5 duration-300 h-full flex flex-col">
                                <div className="mb-8">
                                    <h3 className="text-2xl font-black mb-2">Appearance</h3>
                                    <p className="text-sm opacity-50">Personalize your chat experience with custom themes.</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 max-w-sm">
                                    {THEMES.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => setTheme(t.id)}
                                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 group relative overflow-hidden ${theme === t.id ? 'border-primary bg-primary/5 shadow-inner' : 'border-base-200 hover:border-base-300 bg-base-200/30'}`}
                                        >
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-lg transition-transform group-hover:scale-110 ${theme === t.id ? 'bg-primary text-primary-content' : 'bg-base-100'}`}>
                                                {t.icon}
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-widest opacity-70">{t.id}</span>
                                            {theme === t.id && (
                                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-10 p-6 bg-base-200 rounded-3xl border border-base-300 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-content shrink-0">
                                        <IoColorPaletteOutline size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">Live Preview</h4>
                                        <p className="text-xs opacity-60">The entire application adapts instantly as you pick a theme.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'starred' && (
                            <div className="animate-in slide-in-from-bottom-5 duration-300 h-full flex flex-col">
                                <h3 className="text-2xl font-black mb-6">Starred Messages</h3>
                                <div className="flex-1 overflow-hidden">
                                     <StarredMessages onClose={() => setActiveTab('profile')} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default Settings;
