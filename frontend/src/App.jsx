import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectsPage from "./pages/ProjectsPage";
import VolunteersPage from "./pages/VolunteersPage";
import EventsPage from "./pages/EventsPage";
import DonationsPage from "./pages/DonationsPage";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AppLayout darkMode={darkMode} setDarkMode={setDarkMode} />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route
            path="dashboard"
            element={
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-0">
                <DashboardPage />
              </motion.div>
            }
          />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="volunteers" element={<VolunteersPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="donations" element={<DonationsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
