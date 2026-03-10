import React, { useState } from 'react'
import useGetAllUsers from '../context/userGetAllUsers'
import axios from 'axios'
import toast from 'react-hot-toast'

function CreateGroup({ onClose }) {
    const [allUsers] = useGetAllUsers()
    const [groupName, setGroupName] = useState("")
    const [selectedMembers, setSelectedMembers] = useState([])
    const [loading, setLoading] = useState(false)

    const toggleMember = (id) => {
        setSelectedMembers(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        )
    }

    const handleCreate = async () => {
        if (!groupName.trim() || selectedMembers.length < 2) {
            return toast.error("Please enter group name and select at least 2 members")
        }
        setLoading(true)
        try {
            await axios.post('/api/users/create-group', { groupName, members: selectedMembers })
            toast.success("Group created successfully!")
            onClose()
            window.location.reload() // Simple way to refresh lists
        } catch (error) {
            console.log("Error creating group:", error)
            toast.error(error.response?.data?.error || "Failed to create group")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <div className="bg-base-100 w-full max-w-md rounded-2xl shadow-2xl p-6 border border-base-200 animate-in fade-in zoom-in duration-200">
                <h2 className="text-xl font-bold mb-4">Create New Group</h2>

                <div className="form-control w-full mb-4">
                    <label className="label"><span className="label-text font-semibold">Group Name</span></label>
                    <input
                        type="text"
                        placeholder="Awesome Team"
                        className="input input-bordered w-full"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                    />
                </div>

                <div className="mb-4">
                    <label className="label"><span className="label-text font-semibold">Select Members ({selectedMembers.length})</span></label>
                    <div className="max-h-48 overflow-y-auto border border-base-200 rounded-lg p-2 space-y-1">
                        {allUsers.map(user => (
                            <div
                                key={user._id}
                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-base-200 transition-colors ${selectedMembers.includes(user._id) ? 'bg-primary/20 border border-primary/30' : ''}`}
                                onClick={() => toggleMember(user._id)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="avatar">
                                        <div className="w-8 rounded-full">
                                            <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.fullname}`} alt="" />
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium">{user.fullname}</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={selectedMembers.includes(user._id)}
                                    className="checkbox checkbox-primary checkbox-sm"
                                    readOnly
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                    <button
                        className="btn btn-primary"
                        onClick={handleCreate}
                        disabled={loading}
                    >
                        {loading ? <span className="loading loading-spinner"></span> : "Create Group"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CreateGroup
