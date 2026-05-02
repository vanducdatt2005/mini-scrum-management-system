import { useState, useEffect } from "react";
import { useSidebar } from "../context/SidebarContext";
import { useNavigate } from "react-router-dom";
import { getInvitations, respondToInvitation } from "../services/api";
import NotificationBell from "./NotificationBell";
import useNotifications from '../hooks/useNotifications.jsx';
import ThemeToggle from "./ThemeToggle";

export default function TopBar() {
  const { toggle } = useSidebar();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [invitations, setInvitations] = useState([]);
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 60000);
    return () => clearInterval(timer);
  }, [window.location.search]);

  const fetchData = async () => {
    try {
      const invRes = await getInvitations();
      setInvitations(invRes.data);
    } catch (err) {
      console.error("Lỗi lấy thông báo:", err);
    }
  };

  const handleRespond = async (id, action) => {
    try {
      await respondToInvitation(id, action);
      await fetchData();
      if (action === "ACCEPT") {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      alert("Lỗi khi xử lý lời mời");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="flex justify-between items-center w-full px-3 md:px-8 h-14 md:h-16 sticky top-0 bg-surface/80 backdrop-blur-xl z-30 border-b border-outline-variant/10">
      {/* Search + Menu */}
      <div className="flex items-center gap-2 md:gap-6 w-full max-w-sm md:max-w-none">
        <button 
          onClick={toggle}
          className="p-1.5 md:p-2 -ml-1.5 md:-ml-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors md:hidden"
        >
          <span className="material-symbols-outlined text-[20px] md:text-[24px]">menu</span>
        </button>

        <div className="relative flex-1 md:flex-none">
          <span className="material-symbols-outlined absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 text-outline text-xs md:text-base">
            search
          </span>
          <input
            type="text"
            placeholder="Search tasks..."
            className="pl-8 md:pl-9 pr-3 md:pr-4 py-1.5 md:py-2 bg-surface-container-low border-none rounded-full text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 w-full md:w-64 text-on-surface transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        <ThemeToggle />
        
        <button className="hidden sm:block p-1.5 md:p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors">
          <span className="material-symbols-outlined text-[20px] md:text-[24px]">timer</span>
        </button>

        <NotificationBell invitations={invitations} onRespondInvite={handleRespond} />

        <div className="h-6 md:h-8 w-[1px] bg-outline-variant mx-1"></div>

        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="group flex items-center gap-1.5 md:gap-2 p-1 pr-2 md:pr-3 rounded-full border border-outline-variant/10 hover:bg-surface-container-high transition-all"
          >
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-[10px] md:text-xs shadow-sm">
              {currentUser.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="hidden md:block text-xs font-bold text-on-surface opacity-80">{currentUser.fullName}</span>
            <span className="material-symbols-outlined text-xs md:text-sm text-on-surface-variant group-hover:rotate-180 transition-transform">expand_more</span>
          </button>

          {/* User Menu Dropdown */}
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
              <div className="absolute right-0 mt-3 w-56 bg-surface-container-lowest rounded-2xl md:rounded-3xl shadow-2xl border border-outline-variant/10 py-2 md:py-3 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                <div className="px-5 md:px-6 py-3 md:py-4 border-b border-outline-variant/10 mb-2">
                  <div className="text-sm font-bold text-on-surface">{currentUser.fullName}</div>
                  <div className="text-[10px] font-medium text-on-surface-variant opacity-60">ID: {currentUser.id?.slice(-8)}</div>
                </div>
                
                <button 
                  onClick={() => navigate('/settings')}
                  className="w-full flex items-center gap-3 md:gap-4 px-5 md:px-6 py-2.5 md:py-3 text-xs md:text-sm font-medium text-on-surface-variant hover:bg-primary/5 hover:text-primary transition-all text-left"
                >
                  <span className="material-symbols-outlined text-base md:text-lg">settings</span>
                  <span>Cài đặt cá nhân</span>
                </button>

                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 md:gap-4 px-5 md:px-6 py-2.5 md:py-3 text-xs md:text-sm font-bold text-error hover:bg-error/5 transition-all text-left mt-1 md:mt-2"
                >
                  <span className="material-symbols-outlined text-base md:text-lg">logout</span>
                  <span>Đăng xuất</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
