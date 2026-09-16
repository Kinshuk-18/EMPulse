import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  Zap,
  LogOut,
  ShieldCheck,
  Building2,
  MapPin,
  Headphones,
  Network,
  TicketCheck,
  Activity,
} from "lucide-react";

// Role-aware nav config — each role sees only what's relevant to their scope.
// Admin gets full management suite; Nodal and Institute get scoped operational views.
function getNavLinks(role) {
  if (role === "admin") {
    return [
      { to: "/dashboard",       label: "Dashboard",           icon: LayoutDashboard, end: true },
      { to: "/trainees",        label: "Trainees",            icon: Users },
      { to: "/analytics",       label: "Analytics",           icon: BarChart3 },
      { to: "/remedial-actions",label: "Remedial Center",     icon: Activity },
      { to: "/nodal-officers",  label: "Nodal Officers",      icon: Network },
      { to: "/institutes",      label: "Institutes",          icon: Building2 },
      { to: "/support-tickets", label: "Support Tickets",     icon: TicketCheck },
      { to: "/settings",        label: "Settings",            icon: Settings },
    ];
  }

  if (role === "nodal") {
    return [
      { to: "/dashboard", label: "Dashboard",      icon: LayoutDashboard, end: true },
      { to: "/trainees",  label: "Trainees",       icon: Users },
      { to: "/analytics", label: "Analytics",      icon: BarChart3 },
      { to: "/contact",   label: "Help & Support", icon: Headphones },
      { to: "/settings",  label: "Settings",       icon: Settings },
    ];
  }

  // Institute role — same shape as Nodal but scoped to their center
  return [
    { to: "/dashboard", label: "Dashboard",      icon: LayoutDashboard, end: true },
    { to: "/trainees",  label: "Trainees",       icon: Users },
    { to: "/analytics", label: "Analytics",      icon: BarChart3 },
    { to: "/contact",   label: "Help & Support", icon: Headphones },
    { to: "/settings",  label: "Settings",       icon: Settings },
  ];
}

export default function Sidebar({ isOpen, onClose }) {
  const { user, role, scope, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const navLinks = getNavLinks(role);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const initial = user
    ? user.charAt(0).toUpperCase()
    : role
    ? role.charAt(0).toUpperCase()
    : "E";

  let displayName = "System Admin";
  let RoleIcon = ShieldCheck;
  if (role === "nodal") {
    displayName = "Nodal Officer";
    RoleIcon = MapPin;
  } else if (role === "institute") {
    displayName = "Institute Admin";
    RoleIcon = Building2;
  }

  // Strip any legacy .io suffix from the stored user email
  const cleanUserDisplay = user
    ? user.replace(".io", "")
    : `${role || "user"}@empulse`;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-full w-64 bg-white border-r border-gray-100 shadow-lg
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:shadow-sm lg:z-auto
        `}
      >
        {/* Logo Area */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-xl shadow-md"
            style={{ backgroundColor: "#6C5CE7" }}
          >
            <Zap className="w-5 h-5 text-white" fill="white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              EM<span style={{ color: "#6C5CE7" }}>Pulse</span>
            </span>
            <span className="block text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              Govt Scheme Portal
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-0.5 overflow-y-auto">
          <div className="px-3 mb-3 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Navigation Menu
            </p>
            <span className="text-[10px] font-semibold bg-indigo-50 text-[#6c5ce7] px-2 py-0.5 rounded capitalize">
              {role || "admin"}
            </span>
          </div>

          {navLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? "text-white shadow-md shadow-[#6c5ce7]/20"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
              style={({ isActive }) =>
                isActive ? { backgroundColor: "#6C5CE7" } : {}
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`flex-shrink-0 transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-gray-600"
                    }`}
                    size={18}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Scope Info Card */}
        <div className="px-4 py-3 mx-3 mb-2 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <RoleIcon size={12} className="text-[#6c5ce7]" /> Active Access Scope
          </div>
          <div className="text-xs font-bold text-slate-800 truncate mt-0.5">
            {scope || "Global Access"}
          </div>
        </div>

        {/* Bottom User Info & Logout */}
        <div className="px-4 py-4 border-t border-gray-100 space-y-2">
          <div className="flex items-center justify-between px-2 py-2 rounded-xl bg-gray-50">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: "#6C5CE7" }}
              >
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-gray-400 truncate">{cleanUserDisplay}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out to Portal Home"
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
