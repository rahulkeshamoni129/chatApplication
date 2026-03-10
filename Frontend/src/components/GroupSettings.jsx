import React, { useState } from 'react';
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

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-base-100 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-base-200 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-primary p-6 text-primary-content flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">Group Info</h2>
                        <p className="text-xs opacity-70">{group.groupName} • {group.members.length} members</p>
                    </div>
                    <button onClick={onClose} className="btn btn-circle btn-sm btn-ghost hover:bg-white/20">
                        <IoClose size={24} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-sm uppercase tracking-widest opacity-60">Members</h3>
                        {isAdmin && (
                            <button
                                onClick={() => setShowAddMember(!showAddMember)}
                                className="btn btn-xs btn-primary rounded-lg"
                            >
                                {showAddMember ? 'Cancel' : 'Add Member'}
                            </button>
                        )}
                    </div>

                    {showAddMember ? (
                        <div className="max-h-60 overflow-y-auto space-y-2 animate-in slide-in-from-top-2 duration-200">
                            <p className="text-[10px] opacity-50 px-2 font-bold mb-1">Select user to add</p>
                            {potentialNewMembers.length > 0 ? potentialNewMembers.map(user => (
                                <div key={user._id} className="flex justify-between items-center p-2 hover:bg-base-200 rounded-xl transition-colors">
                                    <div className="flex items-center gap-2">
                                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.fullname}`} className="w-8 h-8 rounded-full" alt="" />
                                        <span className="text-sm font-medium">{user.fullname}</span>
                                    </div>
                                    <button onClick={() => handleAddMember(user._id)} className="btn btn-xs btn-ghost btn-circle text-primary">
                                        <IoPersonAddOutline size={18} />
                                    </button>
                                </div>
                            )) : <p className="text-center py-4 text-xs opacity-50">No new users available</p>}
                        </div>
                    ) : (
                        <div className="max-h-60 overflow-y-auto space-y-2">
                            {allUsers.filter(u => group.members.includes(u._id)).map(member => (
                                <div key={member._id} className="flex justify-between items-center p-2 hover:bg-base-200 rounded-xl transition-colors">
                                    <div className="flex items-center gap-2">
                                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.fullname}`} className="w-8 h-8 rounded-full" alt="" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{member.fullname}</span>
                                            {group.groupAdmin === member._id && <span className="text-[8px] text-primary font-bold uppercase">Group Admin</span>}
                                        </div>
                                    </div>
                                    {isAdmin && member._id !== authUser.user._id && (
                                        <button onClick={() => handleRemoveMember(member._id)} className="btn btn-xs btn-ghost btn-circle text-error">
                                            <IoTrashOutline size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {/* Also check if authUser is in members list but not in allUsers (unlikely but safe) */}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default GroupSettings;
