import TasksFilters from "./TasksFilters";
import TasksTable from "./TasksTable";

const TasksSection = ({
  searchText,
  statusFilter,
  priorityFilter,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  tasks,
  totalTasks,
  sortKey,
  sortDirection,
  onSort,
}) => {
  return (
    <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-sm font-semibold text-slate-200">Tasks Table</h2>
        <TasksFilters
          searchText={searchText}
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          onSearchChange={onSearchChange}
          onStatusChange={onStatusChange}
          onPriorityChange={onPriorityChange}
        />
      </div>

      <TasksTable tasks={tasks} sortKey={sortKey} sortDirection={sortDirection} onSort={onSort} />

      <p className="mt-3 text-xs text-slate-500">Showing {tasks.length} of {totalTasks} tasks.</p>
    </section>
  );
};

export default TasksSection;
