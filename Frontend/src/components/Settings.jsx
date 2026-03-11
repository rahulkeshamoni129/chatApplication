import React, { useState } from 'react';
import { IoClose, IoPersonOutline, IoLockClosedOutline, IoImagesOutline } from 'react-icons/io5';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/Authprovider';

function Settings({ onClose }) {
    const [authUser, setAuthUser] = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);

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

            // Update Auth State
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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-base-100 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-base-200 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-primary p-6 text-primary-content flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">Settings</h2>
                        <p className="text-xs opacity-70">Manage your account preferences</p>
                    </div>
                    <button onClick={onClose} className="btn btn-circle btn-sm btn-ghost hover:bg-white/20">
                        <IoClose size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-base-200">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'profile' ? 'text-primary border-b-2 border-primary' : 'text-base-content/60 hover:bg-base-200'}`}
                    >
                        <IoPersonOutline /> Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'security' ? 'text-primary border-b-2 border-primary' : 'text-base-content/60 hover:bg-base-200'}`}
                    >
                        <IoLockClosedOutline /> Security
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'profile' ? (
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="flex flex-col items-center mb-6">
                                <div className="avatar mb-2">
                                    <div className="w-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${profileData.fullname}`} alt="avatar" />
                                    </div>
                                </div>
                                <p className="text-[10px] opacity-50 uppercase font-bold tracking-widest">Profile Identity</p>
                            </div>

                            <div className="form-control">
                                <label className="label"><span className="label-text font-semibold">Username</span></label>
                                <label className="input input-bordered flex items-center gap-2 bg-base-300 opacity-70 cursor-not-allowed">
                                    <span className="font-bold opacity-50">@</span>
                                    <input
                                        type="text"
                                        className="grow"
                                        value={authUser?.user?.username || ""}
                                        disabled
                                        title="Usernames cannot be changed"
                                    />
                                </label>
                            </div>

                            <div className="form-control">
                                <label className="label"><span className="label-text font-semibold">Full Name</span></label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full bg-base-200 focus:bg-base-100 transition-colors"
                                    value={profileData.fullname}
                                    onChange={(e) => setProfileData({ ...profileData, fullname: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-control">
                                <label className="label"><span className="label-text font-semibold">Bio</span></label>
                                <textarea
                                    className="textarea textarea-bordered h-24 bg-base-200 focus:bg-base-100 transition-colors"
                                    value={profileData.bio}
                                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                    placeholder="Tell us about yourself..."
                                ></textarea>
                            </div>

                            <button disabled={loading} className="btn btn-primary w-full mt-4 shadow-lg shadow-primary/20">
                                {loading && <span className="loading loading-spinner"></span>}
                                Save Profile Updates
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text font-semibold">Current Password</span></label>
                                <input
                                    type="password"
                                    className="input input-bordered w-full bg-base-200 focus:bg-base-100 transition-colors"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-control">
                                <label className="label"><span className="label-text font-semibold">New Password</span></label>
                                <input
                                    type="password"
                                    className="input input-bordered w-full bg-base-200 focus:bg-base-100 transition-colors"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-control">
                                <label className="label"><span className="label-text font-semibold">Confirm New Password</span></label>
                                <input
                                    type="password"
                                    className="input input-bordered w-full bg-base-200 focus:bg-base-100 transition-colors"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>

                            <button disabled={loading} className="btn btn-primary w-full mt-4 shadow-lg shadow-primary/20">
                                {loading && <span className="loading loading-spinner"></span>}
                                Update Password
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Settings;
