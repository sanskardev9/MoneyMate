export const getMonthBounds = (date = new Date()) => {
  const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
  const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);

  return {
    startDate,
    endDate,
    startIso: startDate.toISOString(),
    endIso: endDate.toISOString(),
    monthKey: `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}`,
  };
};

export const getMonthBoundsFromKey = (monthKey) => {
  const [year, month] = monthKey.split("-").map(Number);
  return getMonthBounds(new Date(year, month - 1, 1));
};

export const shiftMonth = (date, delta) =>
  new Date(date.getFullYear(), date.getMonth() + delta, 1);

export const getMonthKey = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

export const isSameMonth = (value, referenceDate = new Date()) => {
  return getMonthKey(value) === getMonthKey(referenceDate);
};

export const formatMonthLabel = (monthKey) => {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
};

export const filterCurrentMonthRecords = (items, field = "created_at") =>
  items.filter((item) => isSameMonth(item[field]));
