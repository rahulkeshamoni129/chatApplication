import React, { useState } from 'react'
import User from './User'
import userGetAllUsers from '../../context/userGetAllUsers'
import useGetGroups from '../../context/useGetGroups'
import useConversation from '../../zustand/useConversation.js'
import CreateGroup from '../../components/CreateGroup'

function Users() {
  const [allUsers, loadingUsers] = userGetAllUsers()
  const [allGroups, loadingGroups] = useGetGroups()
  const { pinnedChats } = useConversation();
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const combinedList = [
    ...allGroups.map(g => ({ ...g, isGroup: true, fullname: g.groupName, _id: g._id })),
    ...allUsers
  ];

  const sortedList = combinedList.sort((a, b) => {
    const aPinned = pinnedChats.includes(a._id);
    const bPinned = pinnedChats.includes(b._id);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return 0;
  });

  return (
    <div className="px-2">
      <div className="flex items-center justify-between px-4 py-3 bg-base-200/50 rounded-xl mb-2 mx-4 border border-base-200 shadow-sm">
        <h1 className='text-base-content font-bold text-sm tracking-wide'>
          Contacts
        </h1>
        <button
          onClick={() => setShowCreateGroup(true)}
          className="btn btn-xs btn-primary btn-outline rounded-lg"
        >
          New Group
        </button>
      </div>

      {showCreateGroup && <CreateGroup onClose={() => setShowCreateGroup(false)} />}

      <div className="flex flex-col gap-1 pb-4">
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