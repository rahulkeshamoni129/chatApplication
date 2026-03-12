import React from 'react';
import { useTranslation } from '../../context/TranslationContext';
import { useAuth } from '../../context/Authprovider';

function Logout() {
  const { lang, setLang } = useTranslation();
  const [authUser] = useAuth();

  return (
    <div className='mt-auto p-4 bg-base-200/50 border-t border-base-300'>
      {/* User Info Section */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="avatar">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-semibold ring ring-primary/20 ring-offset-base-100 ring-offset-2 overflow-hidden shadow-sm">
              <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${authUser?.user?.fullname}`} alt="avatar" />
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold truncate text-base-content leading-tight">{authUser?.user?.fullname}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_5px_rgba(34,197,94,0.5)]"></span>
              <p className="text-[9px] font-semibold opacity-40 uppercase tracking-widest">Online</p>
            </div>
          </div>
        </div>
        
        {/* Language Selector - More compact and separated */}
        <div className="flex flex-col items-end gap-0.5">
            <div className="text-[8px] font-bold opacity-30 uppercase tracking-tighter">Lang</div>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="select select-ghost select-xs text-[10px] font-bold px-1 h-6 min-h-6 bg-base-300/30 rounded border-none focus:outline-none appearance-none cursor-pointer"
            >
              <option value="en">EN</option>
              <option value="hi">HI</option>
              <option value="es">ES</option>
            </select>
        </div>
      </div>
    </div>
  )
}

export default Logout;