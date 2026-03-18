import { useAuth } from '../../context/Authprovider';

function Logout() {
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
      </div>
    </div>
  )
}

export default Logout;