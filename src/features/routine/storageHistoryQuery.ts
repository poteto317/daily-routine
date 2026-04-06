import type { DailyHistory, MonthlyHistory } from "@/types/routine";
import { getStorageItem, setStorageItem } from "@/lib/storage/core";

const STORAGE_KEY_HISTORY = "daily-history";

export const getMonthlyHistory = (): MonthlyHistory => {
  return getStorageItem<MonthlyHistory>(STORAGE_KEY_HISTORY, {});
};

export const saveMonthlyHistory = (
  history: MonthlyHistory,
  options?: { skipLocalDataUpdatedAt?: boolean },
): void => {
  setStorageItem(STORAGE_KEY_HISTORY, history, options);
};

export const getDailyHistory = (date: string): DailyHistory | null => {
  const history = getMonthlyHistory();
  return history[date] || null;
};

export const getHistoryForMonth = (
  year: number,
  month: number,
): MonthlyHistory => {
  const allHistory = getMonthlyHistory();
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  const filtered: MonthlyHistory = {};

  Object.keys(allHistory).forEach((date) => {
    if (date.startsWith(monthKey)) {
      filtered[date] = allHistory[date];
    }
  });

  return filtered;
};
