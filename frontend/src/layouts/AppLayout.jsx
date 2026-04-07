import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function AppLayout({ darkMode, setDarkMode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 lg:grid-cols-[16rem_1fr]">
        <Sidebar />
        <main className="min-w-0">
          <Topbar darkMode={darkMode} setDarkMode={setDarkMode} />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
