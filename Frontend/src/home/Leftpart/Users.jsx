import React from 'react'
import User from './User'
import userGetAllUsers from '../../context/userGetAllUsers'

function Users() {
  const [allUsers,loading]=userGetAllUsers()
  console.log(allUsers)
  return (
    <div>
      <h1 className='px-8 py-2 text-white font-semibold bg-slate-800 rounded-md'>Messages</h1>
      <div  style={{maxHeight:"calc(84vh - 10vh)"}}>
      {allUsers.map((user,index)=>{
        return <User key={index} user={user}/>
      })}
      </div>
    </div>
  )
}

export default Users