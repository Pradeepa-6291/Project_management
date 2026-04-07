import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HeartHandshake } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) navigate("/dashboard", { replace: true });
  }, [token, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 p-4">
      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-white/20 bg-white/25 p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="mb-6 flex items-center gap-2">
          <HeartHandshake className="text-white" />
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
        </div>
        <p className="mb-6 text-sm text-white/90">Social Impact Project Management System for NGOs</p>
        {error && (
          <div className="mb-4 rounded-xl bg-red-500/90 px-3 py-2 text-sm text-white" role="alert">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label htmlFor="login-email" className="mb-1 block text-sm text-white">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-white/30 bg-white/80 p-3 text-slate-900 outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="login-password" className="mb-1 block text-sm text-white">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-white/30 bg-white/80 p-3 text-slate-900 outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 py-3 font-semibold text-white transition hover:scale-[1.02] disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Login"}
        </button>
        <p className="mt-4 text-center text-sm text-white/90">
          New User?{" "}
          <Link to="/register" className="font-semibold underline decoration-2 underline-offset-2">
            Register
          </Link>
        </p>
      </motion.form>
    </div>
  );
}
