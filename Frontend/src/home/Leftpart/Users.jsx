import React, { useState } from 'react'
import User from './User'
import userGetAllUsers from '../../context/userGetAllUsers'
import useGetGroups from '../../context/useGetGroups'
import useConversation from '../../zustand/useConversation.js'
import CreateGroup from '../../components/CreateGroup'

function Users() {
  const [allUsers, loadingUsers] = userGetAllUsers()
  const [allGroups, loadingGroups] = useGetGroups()
  const { pinnedChats, sidebarSearch, unreads, lastMessageAt } = useConversation();
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [mainTab, setMainTab] = useState("chats"); // chats, explore

  const combinedList = [
    ...allGroups.map(g => ({ ...g, isGroup: true, fullname: g.groupName, _id: g._id })),
    ...allUsers
  ].filter(item => {
    const matchesSearch = item.fullname?.toLowerCase().includes(sidebarSearch.toLowerCase());
    if (!matchesSearch) return false;

    // First level: Tab filtering
    if (mainTab === "chats") {
      // Show if it's a group, pinned, has unreads, or has message history
      const hasHistory = lastMessageAt[item._id] || unreads[item._id] > 0 || pinnedChats.includes(item._id) || item.isGroup;
      if (!hasHistory) return false;
    }

    // Second level: Sub-filters
    if (activeFilter === "unread") return unreads[item._id] > 0;
    if (activeFilter === "groups") return item.isGroup;
    if (activeFilter === "pinned") return pinnedChats.includes(item._id);
    return true;
  });

  const sortedList = [...combinedList].sort((a, b) => {
    if (mainTab === "explore") {
      return (a.fullname || "").localeCompare(b.fullname || "");
    }
    const aPinned = pinnedChats.includes(a._id);
    const bPinned = pinnedChats.includes(b._id);
    // Pinned chats always come first
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    // Then sort by most recent activity
    const aTime = lastMessageAt[a._id] || 0;
    const bTime = lastMessageAt[b._id] || 0;
    return bTime - aTime;
  });

  const FilterBtn = ({ id, label }) => (
    <button 
      onClick={() => setActiveFilter(id)}
      className={`px-4 py-1.5 rounded-xl text-[10px] font-semibold uppercase tracking-widest transition-all ${activeFilter === id ? 'bg-primary text-primary-content shadow-lg shadow-primary/20 scale-105' : 'bg-base-200/50 text-base-content/40 hover:bg-base-200 hover:text-base-content/60'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="px-2">
      <div className="flex flex-col gap-3 px-4 mb-4">
        {/* Main Tabs */}
        <div className="flex bg-base-200/50 p-1 rounded-2xl gap-1">
            <button 
                onClick={() => setMainTab("chats")}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${mainTab === "chats" ? 'bg-primary text-primary-content shadow-lg' : 'opacity-40 hover:opacity-100'}`}
            >
                Messages
            </button>
            <button 
                onClick={() => setMainTab("explore")}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${mainTab === "explore" ? 'bg-primary text-primary-content shadow-lg' : 'opacity-40 hover:opacity-100'}`}
            >
                Explore
            </button>
        </div>

        <div className="flex items-center justify-between">
            <h1 className='text-base-content font-bold text-[10px] uppercase tracking-widest opacity-40'>
            {mainTab === "chats" ? "Your Circles" : "Global People"}
            </h1>
            <button
            onClick={() => setShowCreateGroup(true)}
            className="btn btn-xs btn-ghost btn-outline text-[10px] rounded-lg h-6 min-h-6 font-bold"
            >
            + New Group
            </button>
        </div>

        {mainTab === "chats" && (
            <div className="flex items-center gap-2 pt-1 animate-in fade-in slide-in-from-top-2 duration-300">
                <FilterBtn id="all" label="All" />
                <FilterBtn id="unread" label="Unread" />
                <FilterBtn id="groups" label="Groups" />
            </div>
        )}
      </div>

      {showCreateGroup && <CreateGroup onClose={() => setShowCreateGroup(false)} />}

      <div className="flex flex-col gap-1 pb-4 animate-fade-in">
        {loadingUsers || loadingGroups ? (
          <div className="flex justify-center py-4"><span className="loading loading-spinner text-primary"></span></div>
        ) : (
          sortedList.map((item, index) => {
            return <User key={index} user={item} />
          })
        )}
      </div>
    </div>
  )
}

export default Users