export const getTodayString = (): string => {
  const now = new Date();
  const jstOffsetMinutes = 9 * 60;
  const jstDate = new Date(now.getTime() + jstOffsetMinutes * 60 * 1000);
  return jstDate.toISOString().split("T")[0];
};

export const getCurrentTime = (): string => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

export const isTimePassed = (
  targetTime: string,
  minutesAfter: number = 0,
): boolean => {
  const now = new Date();
  const [hours, minutes] = targetTime.split(":").map(Number);
  const target = new Date();
  target.setHours(hours, minutes + minutesAfter, 0, 0);
  return now >= target;
};
