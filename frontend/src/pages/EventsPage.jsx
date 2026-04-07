import { useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const emptyForm = { title: "", date: "", location: "", description: "" };

export default function EventsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setError("");
    try {
      const params = search.trim() ? { q: search.trim() } : {};
      const { data } = await api.get("/api/events", { params });
      setEvents(data);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = (ev) => {
    setEditingId(ev._id);
    setForm({
      title: ev.title,
      date: ev.date ? ev.date.slice(0, 16) : "",
      location: ev.location,
      description: ev.description || "",
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    const payload = {
      ...form,
      date: new Date(form.date).toISOString(),
    };
    try {
      if (editingId) {
        await api.put(`/api/events/${editingId}`, payload);
        window.alert("Event updated.");
      } else {
        await api.post("/api/events", payload);
        window.alert("Event created.");
      }
      resetForm();
      await load();
    } catch (err) {
      window.alert(err.response?.data?.message || "Save failed.");
    }
  };

  const onDelete = async (id) => {
    if (!isAdmin || !window.confirm("Delete this event?")) return;
    try {
      await api.delete(`/api/events/${id}`);
      window.alert("Event deleted.");
      await load();
    } catch (err) {
      window.alert(err.response?.data?.message || "Delete failed.");
    }
  };

  return (
    <section className="glass rounded-2xl p-4">
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium">Search</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 dark:border-slate-600 dark:bg-slate-800/80"
          />
        </div>
        <button type="button" className="gradient-btn text-sm" onClick={() => { setLoading(true); load(); }}>
          Filter
        </button>
      </div>

      {isAdmin && (
        <form onSubmit={onSubmit} className="mb-6 space-y-3 rounded-2xl bg-white/50 p-4 dark:bg-slate-800/50">
          <h3 className="font-semibold">{editingId ? "Edit event" : "Create event"}</h3>
          <input
            required
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-600 dark:bg-slate-900/50"
          />
          <div className="grid gap-3 md:grid-cols-2">
            <input
              required
              type="datetime-local"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-600 dark:bg-slate-900/50"
            />
            <input
              required
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-600 dark:bg-slate-900/50"
            />
          </div>
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-600 dark:bg-slate-900/50"
            rows={2}
          />
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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {events.map((ev) => (
            <article key={ev._id} className="rounded-2xl bg-white/70 p-4 dark:bg-slate-800/70">
              <p className="mb-2 text-xs text-slate-500">{new Date(ev.date).toLocaleString()}</p>
              <h3 className="font-semibold">{ev.title}</h3>
              <p className="text-sm">📍 {ev.location}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{ev.description}</p>
              {isAdmin && (
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => startEdit(ev)} className="rounded-lg border px-2 py-1 text-xs">
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(ev._id)}
                    className="rounded-lg border border-red-300 px-2 py-1 text-xs text-red-600"
                  >
                    Delete
                  </button>
                </div>
              )}
            </article>
          ))}
          {events.length === 0 && <p className="text-slate-500">No events found.</p>}
        </div>
      )}
    </section>
  );
}
