import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { IoClose, IoPersonAddOutline, IoTrashOutline } from 'react-icons/io5';
import axios from 'axios';
import toast from 'react-hot-toast';
import userGetAllUsers from '../context/userGetAllUsers';

function GroupSettings({ group, onClose, onUpdate }) {
    const [allUsers] = userGetAllUsers();
    const [loading, setLoading] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);

    const authUser = JSON.parse(localStorage.getItem('chatApp'));
    const isAdmin = group.groupAdmin === authUser.user._id;

    const handleAddMember = async (userId) => {
        try {
            setLoading(true);
            const res = await axios.put('/api/users/add-member', { groupId: group._id, memberId: userId });
            toast.success(res.data.message);
            onUpdate(res.data.group);
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to add member");
        } finally {
            setLoading(false);
            setShowAddMember(false);
        }
    };

    const handleRemoveMember = async (userId) => {
        try {
            setLoading(true);
            const res = await axios.put('/api/users/remove-member', { groupId: group._id, memberId: userId });
            toast.success(res.data.message);
            onUpdate(res.data.group);
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to remove member");
        } finally {
            setLoading(false);
        }
    };

    // Filter users who are NOT in the group
    const potentialNewMembers = allUsers.filter(user => !group.members.includes(user._id));

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-base-100 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-base-200 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-primary/10 border-b border-base-200 p-5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl overflow-hidden border border-primary/20">
                            <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${group.groupName}`} alt="group" />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-bold">{group.groupName}</h2>
                            <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest">{group.members.length} members</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="btn btn-circle btn-sm btn-ghost">
                        <IoClose size={20} />
                    </button>
                </div>

                <div className="p-5">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-[9px] font-black uppercase tracking-widest opacity-30">Members</h3>
                        {isAdmin && (
                            <button
                                onClick={() => setShowAddMember(!showAddMember)}
                                className="btn btn-xs btn-primary rounded-xl font-bold"
                            >
                                {showAddMember ? 'Cancel' : '+ Add Member'}
                            </button>
                        )}
                    </div>

                    {showAddMember ? (
                        <div className="max-h-60 overflow-y-auto space-y-1 animate-in slide-in-from-top-2 duration-200">
                            <p className="text-[10px] opacity-40 px-2 font-bold mb-2 uppercase tracking-wider">Select user to add</p>
                            {potentialNewMembers.length > 0 ? potentialNewMembers.map(user => (
                                <div key={user._id} className="flex justify-between items-center p-2.5 hover:bg-base-200 rounded-2xl transition-colors">
                                    <div className="flex items-center gap-3">
                                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.fullname}`} className="w-9 h-9 rounded-xl" alt="" />
                                        <span className="text-sm font-semibold">{user.fullname}</span>
                                    </div>
                                    <button onClick={() => handleAddMember(user._id)} className="btn btn-xs btn-ghost btn-circle text-primary hover:bg-primary/10">
                                        <IoPersonAddOutline size={18} />
                                    </button>
                                </div>
                            )) : <p className="text-center py-4 text-xs opacity-40 font-medium">No new users available</p>}
                        </div>
                    ) : (
                        <div className="max-h-60 overflow-y-auto space-y-1">
                            {allUsers.filter(u => group.members.includes(u._id)).map(member => (
                                <div key={member._id} className="flex justify-between items-center p-2.5 hover:bg-base-200 rounded-2xl transition-colors">
                                    <div className="flex items-center gap-3">
                                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.fullname}`} className="w-9 h-9 rounded-xl" alt="" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold">{member.fullname}</span>
                                            {group.groupAdmin === member._id && <span className="text-[8px] text-primary font-black uppercase tracking-widest">Admin</span>}
                                        </div>
                                    </div>
                                    {isAdmin && member._id !== authUser.user._id && (
                                        <button onClick={() => handleRemoveMember(member._id)} className="btn btn-xs btn-ghost btn-circle text-error hover:bg-error/10">
                                            <IoTrashOutline size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}

export default GroupSettings;
