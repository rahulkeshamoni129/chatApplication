import React from 'react'
import User from './User'
import userGetAllUsers from '../../context/userGetAllUsers'

function Users() {
  const [allUsers, loading] = userGetAllUsers()
  console.log(allUsers)
  return (
    <div className="px-2">
      <h1 className='px-4 py-3 text-base-content font-bold bg-base-200/50 rounded-xl mb-2 mx-4 text-sm tracking-wide shadow-sm border border-base-200'>
        Contacts
      </h1>
      <div className="flex flex-col gap-1 pb-4">
        {allUsers.map((user, index) => {
          return <User key={index} user={user} />
        })}
      </div>
    </div>
  )
}

export default Users