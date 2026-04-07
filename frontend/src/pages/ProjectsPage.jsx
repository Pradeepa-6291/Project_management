import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import api, { apiBaseUrl } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const statusTone = {
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
  Ongoing: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200",
  Completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200",
};

const emptyForm = {
  title: "",
  description: "",
  status: "Pending",
  deadline: "",
  assignedVolunteers: [],
};

export default function ProjectsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const [projects, setProjects] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);

  const load = async () => {
    setError("");
    try {
      const params = {};
      if (search.trim()) params.q = search.trim();
      if (statusFilter) params.status = statusFilter;
      const [pRes, vRes] = await Promise.all([api.get("/api/projects", { params }), api.get("/api/volunteers")]);
      setProjects(pRes.data);
      setVolunteers(vRes.data);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional debounce via button
  }, []);

  if (user?.role === "Donor") {
    return <Navigate to="/dashboard" replace />;
  }

  const startEdit = (proj) => {
    setEditingId(proj._id);
    setForm({
      title: proj.title,
      description: proj.description || "",
      status: proj.status,
      deadline: proj.deadline ? proj.deadline.slice(0, 10) : "",
      assignedVolunteers: (proj.assignedVolunteers || []).map((v) => v._id || v),
    });
    setImageFile(null);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("status", form.status);
    if (form.deadline) fd.append("deadline", new Date(form.deadline).toISOString());
    fd.append("assignedVolunteers", JSON.stringify(form.assignedVolunteers));
    if (imageFile) fd.append("image", imageFile);
    return fd;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      if (editingId) {
        await api.put(`/api/projects/${editingId}`, buildFormData());
        window.alert("Project updated.");
      } else {
        await api.post("/api/projects", buildFormData());
        window.alert("Project created.");
      }
      resetForm();
      await load();
    } catch (err) {
      window.alert(err.response?.data?.message || "Save failed.");
    }
  };

  const onDelete = async (id) => {
    if (!isAdmin || !window.confirm("Delete this project?")) return;
    try {
      await api.delete(`/api/projects/${id}`);
      window.alert("Project deleted.");
      await load();
    } catch (err) {
      window.alert(err.response?.data?.message || "Delete failed.");
    }
  };

  const toggleVolunteer = (id) => {
    const sid = typeof id === "string" ? id : id.toString();
    setForm((f) => {
      const set = new Set((f.assignedVolunteers || []).map(String));
      if (set.has(sid)) set.delete(sid);
      else set.add(sid);
      return { ...f, assignedVolunteers: [...set] };
    });
  };

  const volunteerMap = useMemo(() => Object.fromEntries(volunteers.map((v) => [v._id, v])), [volunteers]);

  return (
    <section className="space-y-4">
      <div className="glass rounded-2xl p-4">
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Search</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Title or description"
              className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 dark:border-slate-600 dark:bg-slate-800/80"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 dark:border-slate-600 dark:bg-slate-800/80"
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <button type="button" onClick={() => { setLoading(true); load(); }} className="gradient-btn self-end text-sm">
            Apply filters
          </button>
        </div>

        {isAdmin && (
          <form onSubmit={onSubmit} className="mb-6 space-y-3 rounded-2xl bg-white/50 p-4 dark:bg-slate-800/50">
            <h3 className="font-semibold">{editingId ? "Edit project" : "Add project"}</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                required
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-600 dark:bg-slate-900/50"
              />
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-600 dark:bg-slate-900/50"
              >
                <option value="Pending">Pending</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-600 dark:bg-slate-900/50"
              rows={2}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-600 dark:bg-slate-900/50"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="text-sm text-slate-600 file:mr-2 file:rounded-lg file:border-0 file:bg-purple-500 file:px-3 file:py-1 file:text-white"
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Assign volunteers</p>
              <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto rounded-xl border border-slate-200 p-2 dark:border-slate-600">
                {volunteers.length === 0 ? (
                  <span className="text-sm text-slate-500">No volunteers yet.</span>
                ) : (
                  volunteers.map((v) => (
                    <label key={v._id} className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.assignedVolunteers.map(String).includes(v._id)}
                        onChange={() => toggleVolunteer(v._id)}
                      />
                      {v.name}
                    </label>
                  ))
                )}
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
          <p className="text-slate-600 dark:text-slate-300">Loading…</p>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project._id} className="rounded-2xl bg-white/70 p-4 dark:bg-slate-800/70">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{project.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{project.description}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : "—"}
                    </p>
                    {project.imageUrl ? (
                      <img
                        src={`${apiBaseUrl}${project.imageUrl}`}
                        alt=""
                        className="mt-2 h-24 max-w-xs rounded-lg object-cover"
                      />
                    ) : null}
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Volunteers: </span>
                      {(project.assignedVolunteers || [])
                        .map((v) => (typeof v === "object" ? v.name : volunteerMap[v]?.name || v))
                        .join(", ") || "—"}
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[project.status]}`}>
                    {project.status}
                  </span>
                </div>
                {isAdmin && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => startEdit(project)} className="rounded-xl border px-3 py-1 text-sm">
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(project._id)}
                      className="rounded-xl border border-red-300 px-3 py-1 text-sm text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
            {projects.length === 0 && <p className="text-slate-500">No projects match your filters.</p>}
          </div>
        )}
      </div>
    </section>
  );
}
