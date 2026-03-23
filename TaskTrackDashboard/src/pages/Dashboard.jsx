import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatsCards from "../components/dashboard/StatsCards";
import ChartsSection from "../components/dashboard/ChartsSection";
import TasksSection from "../components/dashboard/TasksSection";
import { PRIORITY_COLORS, SORTABLE_COLUMNS, STATUS_COLORS } from "../components/dashboard/constants";
import { compareValues } from "../components/dashboard/utils";

const TASKS_API_URL = "http://localhost:4000/tasks";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [tasksError, setTasksError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    let isMounted = true;

    const fetchTasks = async () => {
      setIsLoadingTasks(true);
      setTasksError("");

      try {
        const response = await axios.get(TASKS_API_URL);
        if (!isMounted) return;

        const payload = Array.isArray(response.data) ? response.data : [];
        setTasks(payload);
      } catch {
        if (!isMounted) return;
        setTasksError("Unable to load tasks from json-server. Start it with: npm run json-server");
      } finally {
        if (isMounted) {
          setIsLoadingTasks(false);
        }
      }
    };

    void fetchTasks();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  const completionPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const completedTimeSource = tasks
    .filter((task) => task.status === "completed" && typeof task.timeTaken === "number")
    .map((task) => task.timeTaken);

  const averageTimeHours =
    completedTimeSource.length > 0
      ? completedTimeSource.reduce((sum, hours) => sum + hours, 0) / completedTimeSource.length
      : 0;

  const totalPhotoCount = tasks.reduce((sum, task) => sum + (task.image ? 1 : 0), 0);

  const statusPieData = useMemo(() => {
    const statusMap = new Map();
    tasks.forEach((task) => {
      const key = task.status ?? "unknown";
      statusMap.set(key, (statusMap.get(key) ?? 0) + 1);
    });

    return [...statusMap.entries()].map(([name, value]) => ({
      name,
      value,
      fill: STATUS_COLORS[name] ?? "#64748b",
    }));
  }, [tasks]);

  const priorityBarData = useMemo(() => {
    const priorityMap = new Map();
    tasks.forEach((task) => {
      const key = task.priority ?? "unknown";
      priorityMap.set(key, (priorityMap.get(key) ?? 0) + 1);
    });

    return [...priorityMap.entries()].map(([priority, count]) => ({
      priority,
      count,
      fill: PRIORITY_COLORS[priority] ?? "#64748b",
    }));
  }, [tasks]);

  const createdVsCompleted = useMemo(() => {
    const timeline = new Map();
    tasks.forEach((task) => {
      if (task.createdAt) {
        const bucket = timeline.get(task.createdAt) ?? { date: task.createdAt, created: 0, completed: 0 };
        bucket.created += 1;
        timeline.set(task.createdAt, bucket);
      }

      if (task.completedAt) {
        const bucket = timeline.get(task.completedAt) ?? { date: task.completedAt, created: 0, completed: 0 };
        bucket.completed += 1;
        timeline.set(task.completedAt, bucket);
      }
    });

    return [...timeline.values()].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [tasks]);

  const cumulativeData = useMemo(() => {
    return createdVsCompleted.reduce((acc, point) => {
      const previous = acc[acc.length - 1] ?? { createdCumulative: 0, completedCumulative: 0 };
      return [
        ...acc,
        {
          ...point,
          createdCumulative: previous.createdCumulative + point.created,
          completedCumulative: previous.completedCumulative + point.completed,
        },
      ];
    }, []);
  }, [createdVsCompleted]);

  const filteredAndSortedTasks = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    const filtered = tasks.filter((task) => {
      if (statusFilter !== "all" && task.status !== statusFilter) return false;
      if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
      if (!query) return true;

      return [task.title, task.status, task.priority, String(task.id)]
        .some((value) => String(value ?? "").toLowerCase().includes(query));
    });

    if (!SORTABLE_COLUMNS.has(sortKey)) {
      return filtered;
    }

    const sorted = [...filtered].sort((a, b) => compareValues(a, b, sortKey));
    return sortDirection === "asc" ? sorted : sorted.reverse();
  }, [priorityFilter, searchText, sortDirection, sortKey, statusFilter, tasks]);

  const stats = [
    {
      title: "Total Tasks",
      value: totalTasks,
      subtext: "From tasks.json dataset",
      accent: "from-cyan-400 to-blue-500",
    },
    {
      title: "Completion %",
      value: `${completionPercent.toFixed(1)}%`,
      subtext: `${completedTasks} completed`,
      accent: "from-emerald-400 to-teal-500",
    },
    {
      title: "Avg Time",
      value: `${averageTimeHours.toFixed(1)}h`,
      subtext: "Avg time for completed tasks",
      accent: "from-amber-400 to-orange-500",
    },
    {
      title: "Photo Count",
      value: totalPhotoCount,
      subtext: "Tasks with images",
      accent: "from-fuchsia-400 to-pink-500",
    },
  ];

  const handleSort = (key) => {
    if (!SORTABLE_COLUMNS.has(key)) return;

    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-7xl">
        <DashboardHeader sourceUrl={TASKS_API_URL} />

        {isLoadingTasks ? (
          <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
            Loading tasks from json-server...
          </div>
        ) : null}

        {tasksError ? (
          <div className="mb-6 rounded-xl border border-rose-500/40 bg-rose-950/30 px-4 py-3 text-sm text-rose-200">
            {tasksError}
          </div>
        ) : null}

        <StatsCards stats={stats} />

        <ChartsSection
          statusPieData={statusPieData}
          priorityBarData={priorityBarData}
          createdVsCompleted={createdVsCompleted}
          cumulativeData={cumulativeData}
        />

        <TasksSection
          searchText={searchText}
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          onSearchChange={setSearchText}
          onStatusChange={setStatusFilter}
          onPriorityChange={setPriorityFilter}
          tasks={filteredAndSortedTasks}
          totalTasks={tasks.length}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      </div>
    </div>
  );
};

export default Dashboard;