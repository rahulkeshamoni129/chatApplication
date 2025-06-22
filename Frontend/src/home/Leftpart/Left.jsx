import React from 'react'
import Search from './Search';
import Logout from './Logout';
import Users from './Users';
function Left() {
  return (
    <div className="w-full h-screen bg-black text-gray-50 flex flex-col">
      <Search />
      <div className="hide-scroll overflow-y-auto"
        style={{minHeight:"calc(84vh - 10vh)"}}>
        <Users />
      </div>
      <Logout />
    </div>
  );
}


export default Left;