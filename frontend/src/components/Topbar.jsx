import { Bell, CalendarDays, Moon, Sun, UserCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Topbar({ darkMode, setDarkMode }) {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="glass mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
      <div>
        <h2 className="text-lg font-bold">Impact Dashboard</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">{today}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-slate-600 sm:inline dark:text-slate-300">{user?.name}</span>
        <button type="button" title="Notifications" className="rounded-xl p-2 transition hover:bg-white/60 dark:hover:bg-slate-800/70">
          <Bell size={18} />
        </button>
        <button type="button" className="rounded-xl p-2 transition hover:bg-white/60 dark:hover:bg-slate-800/70">
          <CalendarDays size={18} />
        </button>
        <button
          type="button"
          onClick={() => setDarkMode((prev) => !prev)}
          className="rounded-xl p-2 transition hover:bg-white/60 dark:hover:bg-slate-800/70"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <span title="Profile" className="rounded-xl p-2">
          <UserCircle2 size={20} />
        </span>
      </div>
    </header>
  );
}
