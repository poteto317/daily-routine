export const formatDate = (date: Date) => date.toISOString().split("T")[0];

export const buildDateString = (year: number, month: number, day: number) =>
  `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

export const calculateRate = (completed: number, total: number) =>
  total > 0 ? (completed / total) * 100 : 0;

export const getWeekStart = (startDate: Date) => {
  const weekStart = new Date(startDate);
  weekStart.setDate(startDate.getDate() - startDate.getDay() + 1);
  return weekStart;
};

export const getWeekEnd = (weekStart: Date) => {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
};
