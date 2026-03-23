export const STATUS_COLORS = {
  completed: "#10b981",
  pending: "#f59e0b",
  "in-progress": "#06b6d4",
};

export const PRIORITY_COLORS = {
  high: "#f43f5e",
  medium: "#f59e0b",
  low: "#22c55e",
};

export const TABLE_COLUMNS = [
  "id",
  "title",
  "status",
  "priority",
  "createdAt",
  "completedAt",
  "timeTaken",
  "image",
];

export const SORTABLE_COLUMNS = new Set(TABLE_COLUMNS);
