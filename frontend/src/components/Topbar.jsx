import { Search, Bell, Menu, X } from "lucide-react";

export default function Topbar({ onMenuToggle, isSidebarOpen }) {
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
            placeholder="Search trainees, reports..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:bg-white transition-all duration-150"
            style={{ "--tw-ring-color": "#6C5CE7" }}
            onFocus={(e) => {
              e.target.style.ringColor = "#6C5CE7";
              e.target.style.borderColor = "#6C5CE7";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "";
            }}
          />
        </div>
      </div>

      {/* Right: Notification Bell + Avatar */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Notification Bell */}
        <button
          className="relative flex items-center justify-center w-9 h-9 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={19} />
          {/* Badge */}
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white"
            style={{ backgroundColor: "#6C5CE7" }}
          />
        </button>

        {/* Avatar */}
        <button
          className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 transition-colors"
          aria-label="User profile"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: "#6C5CE7" }}
          >
            A
          </div>
          <span className="hidden sm:block text-sm font-semibold text-gray-700">
            Admin
          </span>
        </button>
      </div>
    </header>
  );
}
