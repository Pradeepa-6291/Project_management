import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const COLORS = ["#8b5cf6", "#3b82f6", "#ec4899"];

export function ImpactPie({ data }) {
  return (
    <div className="glass h-72 rounded-2xl p-4">
      <h3 className="mb-3 font-semibold">Projects by status</h3>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value">
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ActivityBar({ data }) {
  return (
    <div className="glass h-72 rounded-2xl p-4">
      <h3 className="mb-3 font-semibold">Donations trend (6 months)</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="impact" fill="#6366f1" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
