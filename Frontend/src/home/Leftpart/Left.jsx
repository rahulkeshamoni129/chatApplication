import React from 'react'
import Search from './Search';
import Logout from './Logout';
import Users from './Users';
function Left() {
  return (
    <div className="w-full h-screen bg-base-100 text-base-content flex flex-col border-r border-base-200 shadow-[10px_0_15px_-3px_rgba(0,0,0,0.1)] z-10 relative">
      <Search />
      <div className="flex-1 hide-scroll overflow-y-auto w-full pt-2">
        <Users />
      </div>
      <Logout />
    </div>
  );
}


export default Left;