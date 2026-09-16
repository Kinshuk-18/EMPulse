import { useContext, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Bell, Menu, X, ShieldCheck, MapPin, Building2,
  LogOut, ChevronDown, User, Lock,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { useSearch } from "../context/SearchContext";

// Finally wired up the navbar search — it was a dead input before this commit.
// It now writes to SearchContext and navigates to /trainees so the table actually filters.
export default function Topbar({ onMenuToggle, isSidebarOpen }) {
  const { user, role, scope, logout } = useContext(AuthContext);
  const { globalSearch, setGlobalSearch } = useSearch();
  const navigate = useNavigate();

  // Dropdown open/close state — using booleans so only one can be open at a time
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Refs for click-outside detection — closes menus when user clicks elsewhere on the page
  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  // Click-outside handler — close whichever dropdown is open
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle helpers — closing the other menu when one opens keeps the UX clean
  const toggleProfile = () => {
    setIsProfileOpen((prev) => !prev);
    setIsNotificationOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationOpen((prev) => !prev);
    setIsProfileOpen(false);
  };

  // Derive display strings from role
  const initial = user ? user.charAt(0).toUpperCase() : (role ? role.charAt(0).toUpperCase() : "A");
  const cleanUser = user ? user.replace(".io", "") : `${role || "user"}@empulse`;

  let roleDisplay = "Admin";
  let RoleIcon = ShieldCheck;
  let roleBadgeColor = "bg-violet-100 text-violet-700 border-violet-200";
  if (role === "nodal") {
    roleDisplay = "Nodal Officer";
    RoleIcon = MapPin;
    roleBadgeColor = "bg-blue-100 text-blue-700 border-blue-200";
  } else if (role === "institute") {
    roleDisplay = "Institute Admin";
    RoleIcon = Building2;
    roleBadgeColor = "bg-emerald-100 text-emerald-700 border-emerald-200";
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Handler for the search input — writes to global context and navigates
  // to the Trainees page so the user immediately sees filtered results.
  // Entering nothing clears the filter so the full table re-appears.
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setGlobalSearch(val);
    // Only navigate on the first keystroke — pushing the same route every
    // character would pollute the browser history stack badly.
    if (val.trim() && window.location.pathname !== "/trainees") {
      navigate("/trainees");
    }
  };

  const handleSearchKeyDown = (e) => {
    // Enter key: explicit navigate even if already on /trainees — feels snappier
    if (e.key === "Enter" && globalSearch.trim()) {
      navigate("/trainees");
    }
    // Escape clears the search and returns focus
    if (e.key === "Escape") {
      setGlobalSearch("");
    }
  };

  // Dummy system alerts — in production this would come from a WebSocket or SSE stream
  const notifications = [
    {
      id: 1,
      icon: "🔔",
      title: "3-Month Check-In Due",
      body: "14 trainees in Bhopal district have pending 3-month outcome verifications.",
      time: "2 hrs ago",
      unread: true,
    },
    {
      id: 2,
      icon: "✅",
      title: "Batch Upload Successful",
      body: "Government ITI Indore uploaded 47 new trainee records. Data validated.",
      time: "Yesterday",
      unread: true,
    },
    {
      id: 3,
      icon: "⚠️",
      title: "EPFO API Rate Limit",
      body: "The EPFO verification service hit its daily cap. Resets at midnight IST.",
      time: "12 hrs ago",
      unread: false,
    },
    {
      id: 4,
      icon: "📊",
      title: "Monthly Report Generated",
      body: "September 2026 national skilling outcomes report is ready for download.",
      time: "2 days ago",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

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

      {/* Center: Global Search Bar — now actually connected to SearchContext */}
      <div className="flex-1 max-w-md mx-auto">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            id="topbar-search"
            value={globalSearch}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search trainees by name, district, institute..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6c5ce7]/40 focus:bg-white focus:border-[#6c5ce7] transition-all duration-150"
            aria-label="Global trainee search"
          />
          {/* Clear button — only visible when there's a query, so it doesn't clutter empty state */}
          {globalSearch && (
            <button
              onClick={() => setGlobalSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
              aria-label="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Right: Scope Badge + Notification Bell + Avatar/Profile */}
      <div className="flex items-center gap-2 flex-shrink-0">

        {/* Active Scope Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
          <ShieldCheck size={14} className="text-[#6c5ce7]" />
          <span>{scope || "Global Access"}</span>
        </div>

        {/* ── Notification Bell Dropdown ─────────────────────────────── */}
        <div ref={notificationRef} className="relative">
          <button
            id="topbar-notifications-btn"
            onClick={toggleNotifications}
            className="relative flex items-center justify-center w-9 h-9 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Notifications"
            aria-expanded={isNotificationOpen}
            aria-haspopup="true"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex items-center justify-center w-4 h-4 rounded-full border-2 border-white bg-[#6c5ce7] text-[9px] font-bold text-white leading-none">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Panel */}
          {isNotificationOpen && (
            <div
              id="topbar-notifications-panel"
              className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/60 overflow-hidden z-50"
              role="menu"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/80">
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  System Alerts
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#6c5ce7]/10 text-[#6c5ce7]">
                  {unreadCount} Unread
                </span>
              </div>

              <ul className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`flex gap-3 px-4 py-3 text-xs hover:bg-gray-50 transition-colors cursor-default ${
                      n.unread ? "bg-indigo-50/40" : ""
                    }`}
                    role="menuitem"
                  >
                    <span className="text-base flex-shrink-0 mt-0.5">{n.icon}</span>
                    <div className="min-w-0">
                      <p className={`font-semibold text-gray-800 ${n.unread ? "text-[#6c5ce7]" : ""}`}>
                        {n.title}
                      </p>
                      <p className="text-gray-500 leading-snug mt-0.5 truncate">{n.body}</p>
                      <p className="text-gray-400 mt-1 text-[10px]">{n.time}</p>
                    </div>
                    {n.unread && (
                      <span className="flex-shrink-0 w-2 h-2 rounded-full bg-[#6c5ce7] mt-1.5" />
                    )}
                  </li>
                ))}
              </ul>

              <div className="px-4 py-2.5 border-t border-gray-100 text-center">
                <button className="text-xs font-semibold text-[#6c5ce7] hover:underline">
                  View All Alerts →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Profile / Avatar Dropdown ─────────────────────────────────── */}
        <div ref={profileRef} className="relative">
          <button
            id="topbar-profile-btn"
            onClick={toggleProfile}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="User profile menu"
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0"
              style={{ backgroundColor: "#6C5CE7" }}
            >
              {initial}
            </div>
            <div className="hidden sm:flex flex-col items-start leading-tight">
              <span className="text-xs font-bold text-gray-800">{roleDisplay}</span>
              <span className="text-[10px] text-gray-400 truncate max-w-[110px]">{cleanUser}</span>
            </div>
            <ChevronDown
              size={14}
              className={`hidden sm:block text-gray-400 transition-transform duration-200 ${
                isProfileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Profile Dropdown Panel */}
          {isProfileOpen && (
            <div
              id="topbar-profile-panel"
              className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/60 overflow-hidden z-50"
              role="menu"
            >
              {/* User Info Header */}
              <div className="px-4 py-4 bg-gradient-to-br from-[#6c5ce7]/5 to-indigo-50/60 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0"
                    style={{ backgroundColor: "#6C5CE7" }}
                  >
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{roleDisplay}</p>
                    <p className="text-[11px] text-gray-500 truncate">{cleanUser}</p>
                  </div>
                </div>

                {/* Role & Scope pills */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleBadgeColor}`}>
                    <RoleIcon size={10} />
                    {roleDisplay}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    <Lock size={10} />
                    {scope || "Global"}
                  </span>
                </div>
              </div>

              {/* Menu Items */}
              <ul className="py-1.5" role="menu">
                <li role="menuitem">
                  <a
                    href="/settings"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User size={14} className="text-gray-400" />
                    Account &amp; Settings
                  </a>
                </li>
              </ul>

              {/* Logout */}
              <div className="px-3 pb-3 pt-1 border-t border-gray-100">
                <button
                  id="topbar-logout-btn"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors cursor-pointer border border-red-100"
                >
                  <LogOut size={13} />
                  Sign Out of Portal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
