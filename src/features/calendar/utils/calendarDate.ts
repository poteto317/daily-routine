export const toMonthDate = (year: number, month: number): Date => {
  return new Date(year, month - 1, 1);
};

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};

export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month - 1, 1).getDay();
};

export const buildDateString = (
  year: number,
  month: number,
  day: number,
): string => {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

export const shiftMonth = (
  year: number,
  month: number,
  offset: number,
): Date => {
  return new Date(year, month - 1 + offset, 1);
};
