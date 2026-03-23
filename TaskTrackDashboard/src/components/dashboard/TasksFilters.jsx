const TasksFilters = ({
  searchText,
  statusFilter,
  priorityFilter,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
}) => {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <input
        type="text"
        value={searchText}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search by title, status..."
        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400"
      />
      <select
        value={statusFilter}
        onChange={(event) => onStatusChange(event.target.value)}
        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400"
      >
        <option value="all">All Statuses</option>
        <option value="completed">Completed</option>
        <option value="pending">Pending</option>
        <option value="in-progress">In Progress</option>
      </select>
      <select
        value={priorityFilter}
        onChange={(event) => onPriorityChange(event.target.value)}
        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400"
      >
        <option value="all">All Priorities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
    </div>
  );
};

export default TasksFilters;
