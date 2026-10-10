export const toPositiveNumber = (value: string): number | null => {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const num = Number(trimmed);
  if (!Number.isFinite(num) || num <= 0) return null;
  return num;
};

export const isWorkoutDate = (value: string): boolean => {
  const parsedDate = new Date(0);
  const [year, month, day] = value.split("-").map(Number);
  parsedDate.setUTCFullYear(year, month - 1, day);
  return !(
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  );
};
