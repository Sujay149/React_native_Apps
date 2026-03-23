import { STATUS_COLORS, TABLE_COLUMNS } from "./constants";

const TasksTable = ({ tasks, sortKey, sortDirection, onSort }) => {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-[0.08em] text-slate-400">
            {TABLE_COLUMNS.map((column) => (
              <th key={column} className="px-3 py-3">
                <button
                  type="button"
                  onClick={() => onSort(column)}
                  className="inline-flex items-center gap-2 text-left hover:text-slate-200"
                >
                  {column}
                  {sortKey === column ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-b border-slate-800/80 text-slate-200 hover:bg-slate-800/30">
              <td className="px-3 py-3">{task.id}</td>
              <td className="px-3 py-3 font-medium">{task.title}</td>
              <td className="px-3 py-3">
                <span
                  className="rounded-full px-2 py-1 text-xs font-semibold"
                  style={{
                    color: STATUS_COLORS[task.status] ?? "#e2e8f0",
                    backgroundColor: "rgba(255,255,255,0.06)",
                  }}
                >
                  {task.status}
                </span>
              </td>
              <td className="px-3 py-3">{task.priority}</td>
              <td className="px-3 py-3">{task.createdAt}</td>
              <td className="px-3 py-3">{task.completedAt ?? "-"}</td>
              <td className="px-3 py-3">{task.timeTaken}h</td>
              <td className="px-3 py-3">{task.image ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TasksTable;
