import type { DailyProgress } from "@/types/routine";
import type { SetStorageItemOptions } from "@/lib/storage/core";
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
  saveDailyHistory(progress.date, progress.completedRoutineIds, {
    skipLocalDataUpdatedAt: true,
  });
};

export const saveDailyHistory = (
  date: string,
  completedRoutineIds: string[],
  options?: SetStorageItemOptions,
): void => {
  const routines = getRoutines();
  const history = getMonthlyHistory();
  // getMonthlyHistory は JSON.parse で毎回新オブジェクトを返すため in-place 更新しても副作用なし
  history[date] = buildDailyHistoryEntry(date, completedRoutineIds, routines);
  saveMonthlyHistory(history, options);
};

export const saveDailyProgress = (progress: DailyProgress): void => {
  setStorageItem(STORAGE_KEY_PROGRESS, progress);
  saveDailyHistory(progress.date, progress.completedRoutineIds);
};
