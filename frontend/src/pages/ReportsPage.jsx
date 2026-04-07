export default function ReportsPage() {
  return (
    <section className="glass rounded-2xl p-6">
      <h2 className="mb-2 text-xl font-bold">Reports</h2>
      <p className="text-sm text-slate-600 dark:text-slate-300">Generate and export impact reports with filter-based analytics.</p>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <input placeholder="Search reports..." className="rounded-2xl border border-slate-200 bg-white/80 p-3 dark:border-slate-700 dark:bg-slate-800/80" />
        <select className="rounded-2xl border border-slate-200 bg-white/80 p-3 dark:border-slate-700 dark:bg-slate-800/80">
          <option>All Projects</option>
          <option>Education</option>
          <option>Health</option>
          <option>Environment</option>
        </select>
        <button className="gradient-btn">Export PDF</button>
      </div>
    </section>
  );
}
