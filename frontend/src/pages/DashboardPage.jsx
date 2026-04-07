import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import { ActivityBar, ImpactPie } from "../components/Charts";
import api from "../utils/api";

function formatMoney(n) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const { data: res } = await api.get("/api/dashboard/summary");
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || "Could not load dashboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="glass rounded-2xl p-8 text-center text-slate-600 dark:text-slate-300">
        Loading dashboard…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-100 px-4 py-3 text-red-800 dark:bg-red-900/40 dark:text-red-200" role="alert">
        {error}
      </div>
    );
  }

  const totals = data?.totals || { projects: 0, volunteers: 0, donations: 0 };
  const projectStatus = data?.charts?.projectStatus || [{ name: "None", value: 0 }];
  const donationTrend = data?.charts?.donationTrend || [{ name: "—", impact: 0 }];
  const recent = data?.recentDonations || [];

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Total Projects" value={totals.projects} tone="from-purple-500 to-pink-500" />
        <StatCard label="Total Volunteers" value={totals.volunteers} tone="from-blue-500 to-cyan-500" />
        <StatCard label="Total Donations" value={formatMoney(totals.donations)} tone="from-fuchsia-500 to-violet-500" />
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ImpactPie data={projectStatus} />
        <ActivityBar data={donationTrend} />
      </div>
      <div className="glass rounded-2xl p-4">
        <h3 className="mb-3 text-lg font-semibold">Recent donations</h3>
        {recent.length === 0 ? (
          <p className="text-sm text-slate-500">No donations yet.</p>
        ) : (
          <ul className="space-y-2">
            {recent.map((d) => (
              <li
                key={d._id}
                className="flex justify-between rounded-xl bg-white/60 px-3 py-2 text-sm dark:bg-slate-800/70"
              >
                <span>{d.donor}</span>
                <span className="font-medium">{formatMoney(d.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
