import { LayoutDashboard, FolderKanban, Users, CalendarDays, HandCoins, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const allItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["Admin", "Volunteer", "Donor"] },
  { to: "/projects", label: "Projects", icon: FolderKanban, roles: ["Admin", "Volunteer"] },
  { to: "/volunteers", label: "Volunteers", icon: Users, roles: ["Admin", "Volunteer"] },
  { to: "/events", label: "Events", icon: CalendarDays, roles: ["Admin", "Volunteer", "Donor"] },
  { to: "/donations", label: "Donations", icon: HandCoins, roles: ["Admin", "Volunteer", "Donor"] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || "Volunteer";
  const items = allItems.filter((item) => item.roles.includes(role));

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="glass w-full rounded-2xl p-4 lg:w-64">
      <h1 className="mb-2 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-xl font-extrabold text-transparent">
        Social Impact PMS
      </h1>
      <p className="mb-4 text-xs text-slate-600 dark:text-slate-400">NGOs</p>
      <nav className="space-y-2">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-3 py-2 transition ${
                isActive
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                  : "text-slate-700 hover:bg-white/60 dark:text-slate-200 dark:hover:bg-slate-800/70"
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-6 rounded-2xl bg-white/50 p-3 text-sm dark:bg-slate-800/50">
        <p className="font-medium">{user?.name}</p>
        <p className="text-xs text-slate-500">{role}</p>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 py-2 text-sm font-medium transition hover:bg-white/60 dark:border-slate-600 dark:hover:bg-slate-800/70"
      >
        <LogOut size={16} />
        Logout
      </button>
    </aside>
  );
}
