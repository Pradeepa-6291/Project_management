import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  name: "",
  email: "",
  skills: "",
  participationHours: 0,
  projectIds: [],
};

export default function VolunteersPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const [volunteers, setVolunteers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setError("");
    try {
      const params = search.trim() ? { q: search.trim() } : {};
      const [vRes, pRes] = await Promise.all([api.get("/api/volunteers", { params }), api.get("/api/projects")]);
      setVolunteers(vRes.data);
      setProjects(pRes.data);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load volunteers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (user?.role === "Donor") {
    return <Navigate to="/dashboard" replace />;
  }

  const startEdit = (v) => {
    setEditingId(v._id);
    setForm({
      name: v.name,
      email: v.email,
      skills: Array.isArray(v.skills) ? v.skills.join(", ") : "",
      participationHours: v.participationHours ?? 0,
      projectIds: (v.projects || []).map((p) => p._id || p),
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const toggleProject = (id) => {
    const sid = String(id);
    setForm((f) => {
      const set = new Set((f.projectIds || []).map(String));
      if (set.has(sid)) set.delete(sid);
      else set.add(sid);
      return { ...f, projectIds: [...set] };
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    const payload = {
      name: form.name,
      email: form.email,
      skills: form.skills,
      participationHours: Number(form.participationHours),
      projectIds: form.projectIds,
    };
    try {
      if (editingId) {
        await api.put(`/api/volunteers/${editingId}`, payload);
        window.alert("Volunteer updated.");
      } else {
        await api.post("/api/volunteers", payload);
        window.alert("Volunteer added.");
      }
      resetForm();
      await load();
    } catch (err) {
      window.alert(err.response?.data?.message || "Save failed.");
    }
  };

  const onDelete = async (id) => {
    if (!isAdmin || !window.confirm("Delete this volunteer?")) return;
    try {
      await api.delete(`/api/volunteers/${id}`);
      window.alert("Volunteer deleted.");
      await load();
    } catch (err) {
      window.alert(err.response?.data?.message || "Delete failed.");
    }
  };

  return (
    <section className="space-y-4">
      <div className="glass rounded-2xl p-4">
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium">Search</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name or email"
              className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 dark:border-slate-600 dark:bg-slate-800/80"
            />
          </div>
          <button type="button" className="gradient-btn text-sm" onClick={() => { setLoading(true); load(); }}>
            Search
          </button>
        </div>

        {isAdmin && (
          <form onSubmit={onSubmit} className="mb-6 space-y-3 rounded-2xl bg-white/50 p-4 dark:bg-slate-800/50">
            <h3 className="font-semibold">{editingId ? "Edit volunteer" : "Add volunteer"}</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                required
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-600 dark:bg-slate-900/50"
              />
              <input
                required
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-600 dark:bg-slate-900/50"
              />
            </div>
            <input
              placeholder="Skills (comma-separated)"
              value={form.skills}
              onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-600 dark:bg-slate-900/50"
            />
            <div>
              <label className="mb-1 block text-sm">Participation hours</label>
              <input
                type="number"
                min={0}
                value={form.participationHours}
                onChange={(e) => setForm((f) => ({ ...f, participationHours: e.target.value }))}
                className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-600 dark:bg-slate-900/50"
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Assign to projects</p>
              <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto rounded-xl border border-slate-200 p-2 dark:border-slate-600">
                {projects.map((p) => (
                  <label key={p._id} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.projectIds.map(String).includes(p._id)}
                      onChange={() => toggleProject(p._id)}
                    />
                    {p.title}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="submit" className="gradient-btn text-sm">
                {editingId ? "Update" : "Create"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="rounded-2xl border px-4 py-2 text-sm">
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        {error && (
          <p className="mb-3 text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p>Loading…</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {volunteers.map((v) => (
              <article key={v._id} className="glass rounded-2xl p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-sm font-bold text-white">
                    {v.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h3 className="font-semibold">{v.name}</h3>
                    <p className="text-sm text-slate-500">{v.email}</p>
                  </div>
                </div>
                <p className="text-sm">
                  <span className="font-medium">Skills: </span>
                  {(v.skills || []).join(", ") || "—"}
                </p>
                <p className="text-sm">Participation hours: {v.participationHours ?? 0}</p>
                <p className="mt-2 text-sm">
                  <span className="font-medium">Projects: </span>
                  {(v.projects || []).map((p) => (typeof p === "object" ? p.title : p)).join(", ") || "—"}
                </p>
                <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                    style={{ width: `${Math.min(Number(v.participationHours) || 0, 100)}%` }}
                  />
                </div>
                {isAdmin && (
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => startEdit(v)} className="rounded-lg border px-2 py-1 text-xs">
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(v._id)}
                      className="rounded-lg border border-red-300 px-2 py-1 text-xs text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </article>
            ))}
            {volunteers.length === 0 && <p className="text-slate-500">No volunteers found.</p>}
          </div>
        )}
      </div>
    </section>
  );
}
