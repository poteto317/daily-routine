import { toJstDateKey } from "@/lib/storage/core";

const DAY_MS = 24 * 60 * 60 * 1000;

export const addDaysToDateKey = (dateKey: string, days: number): string => {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  return new Date(date.getTime() + days * DAY_MS).toISOString().slice(0, 10);
};

export const getWeekStartKeyFromDateKey = (dateKey: string): string => {
  const day = new Date(`${dateKey}T00:00:00.000Z`).getUTCDay();
  return addDaysToDateKey(dateKey, -((day + 6) % 7));
};

export const getWeekStartKey = (date: Date): string =>
  getWeekStartKeyFromDateKey(toJstDateKey(date));

export const buildWeekStartKeys = (
  firstWeekStartKey: string,
  lastWeekStartKey: string,
): string[] => {
  const keys: string[] = [];

  for (
    let weekStartKey = firstWeekStartKey;
    weekStartKey <= lastWeekStartKey;
    weekStartKey = addDaysToDateKey(weekStartKey, 7)
  ) {
    keys.push(weekStartKey);
  }

  return keys;
};
