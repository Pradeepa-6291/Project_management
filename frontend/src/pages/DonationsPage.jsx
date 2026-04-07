import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const emptyForm = { donor: "", amount: "", date: "", note: "" };

function formatMoney(n) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n || 0);
}

export default function DonationsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const [donations, setDonations] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setError("");
    try {
      const params = search.trim() ? { q: search.trim() } : {};
      const { data } = await api.get("/api/donations", { params });
      setDonations(data.donations || []);
      setTotal(data.total ?? 0);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load donations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = (d) => {
    setEditingId(d._id);
    setForm({
      donor: d.donor,
      amount: String(d.amount),
      date: d.date ? d.date.slice(0, 10) : "",
      note: d.note || "",
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (editingId && !isAdmin) {
      window.alert("Only admins can edit donations.");
      return;
    }
    const payload = {
      donor: form.donor,
      amount: Number(form.amount),
      date: form.date || undefined,
      note: form.note,
    };
    try {
      if (editingId) {
        await api.put(`/api/donations/${editingId}`, payload);
        window.alert("Donation updated.");
      } else {
        await api.post("/api/donations", payload);
        window.alert("Donation recorded.");
      }
      resetForm();
      await load();
    } catch (err) {
      window.alert(err.response?.data?.message || "Save failed.");
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this donation record?")) return;
    try {
      await api.delete(`/api/donations/${id}`);
      window.alert("Donation deleted.");
      await load();
    } catch (err) {
      window.alert(err.response?.data?.message || "Delete failed.");
    }
  };

  const chartData = donations.slice(0, 12).map((d) => ({
    label: d.donor.length > 12 ? `${d.donor.slice(0, 12)}…` : d.donor,
    amount: d.amount,
  }));

  return (
    <section className="space-y-4">
      <div className="glass rounded-2xl p-4">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium">Search donors</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 dark:border-slate-600 dark:bg-slate-800/80"
            />
          </div>
          <button type="button" className="gradient-btn text-sm" onClick={() => { setLoading(true); load(); }}>
            Apply
          </button>
        </div>
        <p className="text-lg font-bold">
          Total raised: <span className="text-purple-600 dark:text-purple-400">{formatMoney(total)}</span>
        </p>
      </div>

      <form onSubmit={onSubmit} className="glass space-y-3 rounded-2xl p-4">
        <h3 className="font-semibold">{editingId ? "Edit donation" : "Add donation"}</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            required
            placeholder="Donor name"
            value={form.donor}
            onChange={(e) => setForm((f) => ({ ...f, donor: e.target.value }))}
            className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-600 dark:bg-slate-800/80"
          />
          <input
            required
            type="number"
            min={0}
            step="0.01"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-600 dark:bg-slate-800/80"
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-600 dark:bg-slate-800/80"
          />
          <input
            placeholder="Note (optional)"
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-600 dark:bg-slate-800/80"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="gradient-btn text-sm">
            {editingId ? "Update" : "Add"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="rounded-2xl border px-4 py-2 text-sm">
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="glass h-72 rounded-2xl p-4">
          <h3 className="mb-3 font-semibold">Donations chart</h3>
          {loading ? (
            <p>Loading…</p>
          ) : (
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={chartData.length ? chartData : [{ label: "—", amount: 0 }]}>
                <XAxis dataKey="label" hide />
                <YAxis />
                <Tooltip formatter={(v) => formatMoney(v)} />
                <Bar dataKey="amount" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="glass rounded-2xl p-4">
          <h3 className="mb-3 font-semibold">Donation list</h3>
          {loading ? (
            <p>Loading…</p>
          ) : (
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {donations.map((d) => (
                <div key={d._id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/70 p-3 dark:bg-slate-800/70">
                  <div>
                    <p className="font-semibold">{d.donor}</p>
                    <p className="text-sm">{formatMoney(d.amount)}</p>
                    <p className="text-xs text-slate-500">{new Date(d.date).toLocaleDateString()}</p>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <button type="button" onClick={() => startEdit(d)} className="rounded-lg border px-2 py-1 text-xs">
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(d._id)}
                        className="rounded-lg border border-red-300 px-2 py-1 text-xs text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {donations.length === 0 && <p className="text-slate-500">No donations yet.</p>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
