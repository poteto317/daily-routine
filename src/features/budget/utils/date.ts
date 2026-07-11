export const toMonthKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

export const shiftMonth = (date: Date, offset: number): Date => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + offset);
  return next;
};

export const isCurrentMonthDate = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth()
  );
};

export const daysInMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

export const toDateKey = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const getDefaultExpenseDate = (targetMonth: Date): string => {
  if (isCurrentMonthDate(targetMonth)) {
    return toDateKey(new Date());
  }
  return `${toMonthKey(targetMonth)}-01`;
};

export const formatExpenseDate = (date: string): string => {
  return new Date(`${date}T00:00:00`).toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
  });
};
