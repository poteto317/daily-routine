import type { DailyProgress } from "@/types/routine";
import { getStorageItem, setStorageItem } from "@/lib/storage/core";
import {
  getHistoryForMonth,
  getDailyHistory,
  getMonthlyHistory,
  saveMonthlyHistory,
} from "./storageHistoryQuery";
import { getRoutines, saveRoutines } from "./storageRoutinesCore";
import {
  filterRoutinesByDayOfWeek,
  shouldShowRoutineForDate,
  shouldShowRoutineToday,
} from "./storageVisibility";
import { findNextAvailableTime, hasTimeConflict } from "./storageTimeConflict";
import { buildDailyHistoryEntry } from "./storageDailyHistory";

const STORAGE_KEY_PROGRESS = "daily-progress";

export { getRoutines, saveRoutines };
export {
  getMonthlyHistory,
  saveMonthlyHistory,
  getDailyHistory,
  getHistoryForMonth,
};
export {
  shouldShowRoutineForDate,
  shouldShowRoutineToday,
  filterRoutinesByDayOfWeek,
};
export { hasTimeConflict, findNextAvailableTime };

export const getDailyProgress = (): DailyProgress | null => {
  return getStorageItem<DailyProgress | null>(STORAGE_KEY_PROGRESS, null);
};

export const saveDailyProgressForSync = (progress: DailyProgress): void => {
  setStorageItem(STORAGE_KEY_PROGRESS, progress, {
    skipLocalDataUpdatedAt: true,
  });
};

export const saveDailyProgressSilently = (progress: DailyProgress): void => {
  setStorageItem(STORAGE_KEY_PROGRESS, progress, {
    skipLocalDataUpdatedAt: true,
  });
  saveDailyHistory(progress.date, progress.completedRoutineIds);
};

export const saveDailyHistory = (
  date: string,
  completedRoutineIds: string[],
): void => {
  const routines = getRoutines();
  const history = getMonthlyHistory();
  history[date] = buildDailyHistoryEntry(date, completedRoutineIds, routines);
  saveMonthlyHistory(history);
};

export const saveDailyProgress = (progress: DailyProgress): void => {
  setStorageItem(STORAGE_KEY_PROGRESS, progress);
  saveDailyHistory(progress.date, progress.completedRoutineIds);
};
