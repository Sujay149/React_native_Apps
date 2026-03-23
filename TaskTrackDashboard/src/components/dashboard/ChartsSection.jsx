import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatShortDate } from "./utils";

const ChartsSection = ({ statusPieData, priorityBarData, createdVsCompleted, cumulativeData }) => {
  return (
    <section className="mt-6 grid gap-4 lg:grid-cols-2">
      <article className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="text-sm font-semibold text-slate-200">Tasks by Status</h2>
        <div className="mt-3 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="text-sm font-semibold text-slate-200">Tasks by Priority</h2>
        <div className="mt-3 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priorityBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="priority" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Tasks">
                {priorityBarData.map((entry) => (
                  <Cell key={entry.priority} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="text-sm font-semibold text-slate-200">Created vs Completed Over Time</h2>
        <div className="mt-3 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={createdVsCompleted}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tickFormatter={formatShortDate} stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" allowDecimals={false} />
              <Tooltip labelFormatter={formatShortDate} />
              <Legend />
              <Line type="monotone" dataKey="created" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="completed" stroke="#34d399" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="text-sm font-semibold text-slate-200">Cumulative Created vs Completed</h2>
        <div className="mt-3 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cumulativeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tickFormatter={formatShortDate} stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" allowDecimals={false} />
              <Tooltip labelFormatter={formatShortDate} />
              <Legend />
              <Area type="monotone" dataKey="createdCumulative" stackId="1" stroke="#38bdf8" fill="#0ea5e9" fillOpacity={0.35} />
              <Area type="monotone" dataKey="completedCumulative" stackId="2" stroke="#34d399" fill="#10b981" fillOpacity={0.35} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );
};

export default ChartsSection;
