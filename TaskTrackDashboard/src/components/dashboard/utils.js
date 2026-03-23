export const formatShortDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

export const compareValues = (a, b, key) => {
  const left = a[key];
  const right = b[key];

  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  if (key === "image") {
    return Number(Boolean(left)) - Number(Boolean(right));
  }

  return String(left ?? "").localeCompare(String(right ?? ""));
};
