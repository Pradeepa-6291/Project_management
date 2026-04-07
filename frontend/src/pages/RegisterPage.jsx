import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HeartHandshake } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLES = ["Admin", "Volunteer", "Donor"];

export default function RegisterPage() {
  const { register, token } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Volunteer");
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
      await register({ name, email, password, role });
      window.alert("Account created. You are now logged in.");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
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
          <h1 className="text-2xl font-bold text-white">Create account</h1>
        </div>
        <p className="mb-6 text-sm text-white/90">Join the NGO platform</p>
        {error && (
          <div className="mb-4 rounded-xl bg-red-500/90 px-3 py-2 text-sm text-white" role="alert">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label htmlFor="reg-name" className="mb-1 block text-sm text-white">
            Name
          </label>
          <input
            id="reg-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl border border-white/30 bg-white/80 p-3 text-slate-900 outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="reg-email" className="mb-1 block text-sm text-white">
            Email
          </label>
          <input
            id="reg-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-white/30 bg-white/80 p-3 text-slate-900 outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="reg-password" className="mb-1 block text-sm text-white">
            Password
          </label>
          <input
            id="reg-password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-white/30 bg-white/80 p-3 text-slate-900 outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="reg-role" className="mb-1 block text-sm text-white">
            Role
          </label>
          <select
            id="reg-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-2xl border border-white/30 bg-white/80 p-3 text-slate-900 outline-none focus:ring-2 focus:ring-purple-300"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 py-3 font-semibold text-white transition hover:scale-[1.02] disabled:opacity-60"
        >
          {loading ? "Creating…" : "Register"}
        </button>
        <p className="mt-4 text-center text-sm text-white/90">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold underline decoration-2 underline-offset-2">
            Login
          </Link>
        </p>
      </motion.form>
    </div>
  );
}
