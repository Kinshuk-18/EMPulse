import { useContext } from "react";
import { Search, Bell, Menu, X, ShieldCheck } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

export default function Topbar({ onMenuToggle, isSidebarOpen }) {
  const { user, role, scope } = useContext(AuthContext);
  const initial = user ? user.charAt(0).toUpperCase() : (role ? role.charAt(0).toUpperCase() : "A");

  let roleDisplay = "Admin";
  if (role === "nodal") roleDisplay = "Nodal Officer";
  else if (role === "institute") roleDisplay = "Institute Admin";
  else if (role === "admin") roleDisplay = "Admin";

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 px-4 sm:px-6 py-3.5 bg-white border-b border-gray-100 shadow-sm">
      {/* Left: Hamburger (mobile only) */}
      <button
        onClick={onMenuToggle}
        className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors lg:hidden flex-shrink-0"
        aria-label="Toggle sidebar"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-md mx-auto">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search trainees, reports, institutes..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:bg-white focus:border-indigo-400 transition-all duration-150"
          />
        </div>
      </div>

      {/* Right: Notification Bell + Scope Badge + Avatar */}
      <div className="flex items-center gap-3 flex-shrink-0">
        
        {/* Active Scope Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
          <ShieldCheck size={14} className="text-[#6c5ce7]" />
          <span>{scope || "Global Access"}</span>
        </div>

        {/* Notification Bell */}
        <button
          className="relative flex items-center justify-center w-9 h-9 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={19} />
          {/* Badge */}
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white bg-[#6c5ce7]"
          />
        </button>

        {/* Avatar */}
        <div
          className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl"
          aria-label="User profile"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
            style={{ backgroundColor: "#6C5CE7" }}
          >
            {initial}
          </div>
          <span className="hidden sm:block text-sm font-semibold text-gray-700">
            {roleDisplay}
          </span>
        </div>
      </div>
    </header>
  );
}
