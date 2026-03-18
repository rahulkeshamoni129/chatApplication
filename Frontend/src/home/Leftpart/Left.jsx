import React from 'react'
import Search from './Search';
import Logout from './Logout';
import Users from './Users';
import SidebarRail from './SidebarRail';

function Left() {
  return (
    <div className="h-full bg-base-100 text-base-content flex border-r border-base-200 shadow-[10px_0_15px_-3px_rgba(0,0,0,0.1)] z-10 relative overflow-hidden">
      {/* Rail Sidebar (New) */}
      <SidebarRail />

      {/* Main Sidebar Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Search />
        <div className="flex-1 hide-scroll overflow-y-auto w-full pt-2">
          <Users />
        </div>
        <Logout />
      </div>
    </div>
  );
}


export default Left;