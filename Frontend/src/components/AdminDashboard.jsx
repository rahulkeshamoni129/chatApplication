import React, { useState, useEffect } from 'react';
import { IoArrowBack, IoShieldCheckmarkOutline, IoBanOutline, IoBan, IoPeopleOutline, IoTimeOutline, IoConstructOutline } from 'react-icons/io5';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [broadcastText, setBroadcastText] = useState("");
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchLogs();
    fetchConfig();
  }, []);

  const fetchLogs = async () => {
    try {
        const res = await axios.get('/api/users/logs');
        setLogs(res.data);
    } catch (error) {
        console.log("Error loading logs");
    }
  };

  const fetchConfig = async () => {
    try {
        const res = await axios.get('/api/users/config');
        setMaintenanceMode(res.data.maintenanceMode);
    } catch (error) {
        console.log("Error loading config");
    }
  };

  const handleToggleMaintenance = async () => {
    try {
        const res = await axios.put('/api/users/toggle-maintenance');
        setMaintenanceMode(res.data.maintenanceMode);
        toast.success(res.data.message);
    } catch (error) {
        toast.error("Failed to toggle maintenance mode");
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastText.trim()) return toast.error("Please enter a message to broadcast");
    try {
        setSendingBroadcast(true);
        const res = await axios.post('/api/message/broadcast', { message: broadcastText });
        toast.success(res.data.message);
        setBroadcastText("");
    } catch (error) {
        toast.error(error.response?.data?.error || "Failed to send broadcast");
    } finally {
        setSendingBroadcast(false);
    }
  };

  const fetchUsers = async () => {
    try {
        setLoading(true);
        const res = await axios.get('/api/users/allusers');
        setUsers(res.data);
    } catch (error) {
        toast.error("Failed to load users list");
    } finally {
        setLoading(false);
    }
  };

  const handleToggleBlock = async (userId) => {
    try {
        const res = await axios.put(`/api/users/toggle-block/${userId}`);
        toast.success(res.data.message);
        // Update local state without refreshing
        setUsers(prev => prev.map(u => {
            if (u._id === userId) return { ...u, isBlocked: res.data.isBlocked };
            return u;
        }));
    } catch (error) {
        toast.error(error.response?.data?.error || "Failed to toggle block status");
    }
  };

  const activeUsersCount = users.filter(u => !u.isBlocked).length;
  const bannedUsersCount = users.filter(u => u.isBlocked).length;

  return (
    <div className="min-h-screen bg-base-200 text-base-content flex flex-col font-sans">
      
      {/* Navbar segment of Dashboard */}
      <div className="bg-base-100 shadow-sm border-b border-base-300 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
            <Link to="/" className="btn btn-ghost btn-circle btn-sm hover:bg-base-200" title="Back to Chat">
                <IoArrowBack size={20} />
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-warning flex items-center gap-2">
                <IoShieldCheckmarkOutline size={28} />
                Admin Dashboard
            </h1>
        </div>
        <div className="hidden sm:flex items-center gap-6 text-sm font-semibold opacity-80">
            <div className="flex items-center gap-2">
                <IoPeopleOutline size={18} className="text-info" />
                <span>Total Users: {users.length}</span>
            </div>
            <div className="flex items-center gap-2 text-success">
                <div className="w-2 h-2 rounded-full bg-success"></div>
                <span>Active: {activeUsersCount}</span>
            </div>
            <div className="flex items-center gap-2 text-error">
                <div className="w-2 h-2 rounded-full bg-error"></div>
                <span>Suspended: {bannedUsersCount}</span>
            </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-base-100 p-6 rounded-2xl shadow-sm border border-base-300 flex items-center gap-4 transition-transform hover:scale-[1.02] duration-300">
                <div className="p-4 bg-info/10 rounded-xl text-info">
                    <IoPeopleOutline size={32} />
                </div>
                <div>
                    <h3 className="text-sm font-bold opacity-50 uppercase tracking-widest">Total Users</h3>
                    <p className="text-3xl font-black">{users.length}</p>
                </div>
            </div>

            <div className="bg-base-100 p-6 rounded-2xl shadow-sm border border-base-300 flex items-center gap-4 transition-transform hover:scale-[1.02] duration-300">
                <div className="p-4 bg-success/10 rounded-xl text-success">
                    <IoShieldCheckmarkOutline size={32} />
                </div>
                <div>
                    <h3 className="text-sm font-bold opacity-50 uppercase tracking-widest">Active Users</h3>
                    <p className="text-3xl font-black">{activeUsersCount}</p>
                </div>
            </div>

            <div className="bg-base-100 p-6 rounded-2xl shadow-sm border border-base-300 flex items-center gap-4 transition-transform hover:scale-[1.02] duration-300">
                <div className="p-4 bg-error/10 rounded-xl text-error">
                    <IoBan size={32} />
                </div>
                <div>
                    <h3 className="text-sm font-bold opacity-50 uppercase tracking-widest">Suspended</h3>
                    <p className="text-3xl font-black">{bannedUsersCount}</p>
                </div>
            </div>
        </div>

        {/* Global Broadcast Tool */}
        <div className="bg-base-100 p-6 rounded-2xl shadow-sm border border-base-300 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-warning">
                <IoShieldCheckmarkOutline size={24} />
                <h3 className="font-bold uppercase tracking-wider">Global Broadcast System</h3>
            </div>
            <p className="text-sm opacity-60">Send a priority message to every user registered on the platform instantly.</p>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    placeholder="Type broadcast message here..." 
                    className="input input-bordered grow bg-base-200"
                    value={broadcastText}
                    onChange={(e) => setBroadcastText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleBroadcast()}
                />
                <button 
                    disabled={sendingBroadcast}
                    onClick={handleBroadcast}
                    className="btn btn-warning shadow-lg shadow-warning/20 font-bold px-8"
                >
                    {sendingBroadcast ? <span className="loading loading-spinner"></span> : "Broadcast Now"}
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Maintenance Mode Tool */}
            <div className={`p-6 rounded-2xl shadow-sm border transition-colors duration-300 ${maintenanceMode ? 'bg-error/10 border-error/30' : 'bg-base-100 border-base-300'}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <IoConstructOutline size={24} className={maintenanceMode ? 'text-error' : 'text-primary'} />
                        <h3 className="font-bold uppercase tracking-wider">System Maintenance</h3>
                    </div>
                    <input 
                        type="checkbox" 
                        className="toggle toggle-error" 
                        checked={maintenanceMode}
                        onChange={handleToggleMaintenance}
                    />
                </div>
                <p className="text-sm opacity-70 mb-4">
                    {maintenanceMode 
                        ? "Currently: PUBLIC ACCESS RESTRICTED. Only admins can use the platform." 
                        : "Currently: PUBLIC ACCESS OPEN. All users can chat normally."}
                </p>
                {maintenanceMode && (
                    <div className="alert alert-error text-xs font-bold py-2 rounded-xl">
                        <span>SYSTEM IS IN LOCKDOWN MODE</span>
                    </div>
                )}
            </div>

            {/* Recent Activity Logs */}
            <div className="bg-base-100 p-6 rounded-2xl shadow-sm border border-base-300 flex flex-col max-h-[300px]">
                <div className="flex items-center gap-2 text-primary mb-4">
                    <IoTimeOutline size={24} />
                    <h3 className="font-bold uppercase tracking-wider">Recent Activity Logs</h3>
                </div>
                <div className="overflow-y-auto flex-1 flex flex-col gap-2 pr-2 custom-scrollbar">
                    {logs.map((log) => (
                        <div key={log._id} className="text-[11px] p-2 bg-base-200 rounded-lg flex justify-between items-center border border-base-300/50">
                            <div className="flex items-center gap-2">
                                <span className="badge badge-primary badge-outline badge-xs font-bold">{log.action}</span>
                                <span className="font-bold">{log.userId?.username || "System"}</span>
                            </div>
                            <span className="opacity-50 text-[9px]">{new Date(log.createdAt).toLocaleTimeString()}</span>
                        </div>
                    ))}
                    {logs.length === 0 && <p className="text-center opacity-30 italic py-4">No recent activity logs.</p>}
                </div>
            </div>
        </div>
        
        <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 overflow-hidden flex flex-col flex-1">
            {/* Table Header Wrapper */}
            <div className="bg-warning/10 p-4 border-b border-warning/20">
                <h2 className="text-warning font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                    <IoShieldCheckmarkOutline /> Platform Users
                </h2>
            </div>
            
            <div className="overflow-x-auto w-full flex-1HideScroll">
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <span className="loading loading-spinner loading-lg text-warning"></span>
                </div>
            ) : (
                <table className="table min-w-max w-full">
                    <thead className="bg-base-200 text-base-content/70 uppercase text-xs font-black">
                    <tr>
                        <th className="rounded-tl-lg">User Identity</th>
                        <th>Email Address</th>
                        <th>Status</th>
                        <th>Joined Date</th>
                        <th className="text-right pr-6">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map(u => (
                        <tr key={u._id} className={`hover transition-colors ${u.isBlocked ? 'bg-error/5 opacity-80' : ''}`}>
                            <td className="w-1/3">
                                <div className="flex items-center gap-4">
                                    <div className="avatar">
                                    <div className={`w-12 h-12 rounded-full border-2 shadow-sm ${u.isBlocked ? 'border-error' : 'border-success/50'}`}>
                                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${u.fullname}`} alt="avatar" />
                                    </div>
                                    </div>
                                    <div>
                                        <div className="font-bold text-base">{u.fullname} {u.isAdmin && <span className="badge badge-warning badge-xs ml-2 font-black shadow-sm shadow-warning/30">ADMIN</span>}</div>
                                        <div className="text-xs opacity-60 font-medium">@{u.username}</div>
                                    </div>
                                </div>
                            </td>
                            <td><span className="text-sm font-medium opacity-80">{u.email}</span></td>
                            <td>
                                {u.isBlocked ? (
                                    <span className="badge badge-error badge-sm font-bold shadow-sm shadow-error/20">SUSPENDED</span>
                                ) : (
                                    <span className="badge badge-success badge-sm font-bold shadow-sm shadow-success/20 text-success-content">ACTIVE</span>
                                )}
                            </td>
                            <td className="text-sm font-semibold opacity-70">
                                {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </td>
                            <td className="text-right pr-6">
                                {!u.isAdmin && (
                                    <button 
                                        onClick={() => handleToggleBlock(u._id)}
                                        className={`btn btn-sm ${u.isBlocked ? 'btn-success text-success-content' : 'btn-error text-error-content'} shadow-sm min-w-28`}
                                    >
                                        {u.isBlocked ? (
                                            <><IoShieldCheckmarkOutline size={16} /> Unban User</>
                                        ) : (
                                            <><IoBan size={16} /> Ban User</>
                                        )}
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    {users.length === 0 && (
                        <tr>
                            <td colSpan="5" className="text-center py-12 opacity-50 font-bold text-lg">No users found on the platform.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            )}
            </div>
        </div>

      </div>
    </div>
  )
}

export default AdminDashboard;
