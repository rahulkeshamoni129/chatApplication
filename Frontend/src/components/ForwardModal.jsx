import React, { useState } from 'react';
import { IoClose, IoSend } from 'react-icons/io5';
import axios from 'axios';
import toast from 'react-hot-toast';
import userGetAllUsers from '../context/userGetAllUsers';

function ForwardModal({ message, onClose }) {
    const [allUsers] = userGetAllUsers();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const toggleSelection = (id) => {
        setSelectedUsers(prev =>
            prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
        );
    };

    const handleForward = async () => {
        if (selectedUsers.length === 0) return toast.error("Select at least one contact");
        try {
            setLoading(true);
            const res = await axios.post('/api/message/forward', {
                messageId: message._id,
                targetIds: selectedUsers
            });
            toast.success(res.data.message);
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to forward message");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-base-100 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-base-200 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-primary p-4 text-primary-content flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold">Forward Message</h2>
                        <p className="text-[10px] opacity-70 truncate max-w-[200px]">"{message.message}"</p>
                    </div>
                    <button onClick={onClose} className="btn btn-circle btn-sm btn-ghost hover:bg-white/20">
                        <IoClose size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    <p className="text-[10px] opacity-50 uppercase font-bold tracking-widest mb-3">Recent Contacts</p>
                    <div className="max-h-72 overflow-y-auto space-y-1 mb-4">
                        {allUsers.map(user => (
                            <div
                                key={user._id}
                                onClick={() => toggleSelection(user._id)}
                                className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all duration-200 ${selectedUsers.includes(user._id) ? 'bg-primary/10 ring-1 ring-primary' : 'hover:bg-base-200'}`}
                            >
                                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.fullname}`} alt="" className="w-8 h-8 rounded-full" />
                                <span className="text-sm font-medium flex-1">{user.fullname}</span>
                                <input type="checkbox" checked={selectedUsers.includes(user._id)} readOnly className="checkbox checkbox-primary checkbox-xs" />
                            </div>
                        ))}
                    </div>

                    <button
                        disabled={loading || selectedUsers.length === 0}
                        onClick={handleForward}
                        className="btn btn-primary w-full shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    >
                        {loading ? <span className="loading loading-spinner loading-xs"></span> : <IoSend size={18} />}
                        Forward to {selectedUsers.length} contact(s)
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ForwardModal;
