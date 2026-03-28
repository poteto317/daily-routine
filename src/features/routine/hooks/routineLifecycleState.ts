import type { Routine } from "@/types/routine";
import {
  getDailyProgress,
  getRoutines,
  saveDailyProgressSilently,
  saveRoutines,
} from "@/features/routine/storage";
import { getTodayString } from "@/lib/storage/core";
import {
  applyDailyProgressToRoutines,
  createDailyResetProgress,
  migrateMultiDayRoutinesWithGroup,
  stripCompletionState,
} from "./routineStateModel";

const shouldMigrateMultiDayRoutines = (routines: Routine[]): boolean => {
  return routines.some((routine) => routine.daysOfWeek.length > 1);
};

export const initializeRoutineState = (): Routine[] => {
  if (typeof window === "undefined") return [];

  let loadedRoutines = getRoutines();

  if (shouldMigrateMultiDayRoutines(loadedRoutines)) {
    loadedRoutines = migrateMultiDayRoutinesWithGroup(loadedRoutines);
    saveRoutines(stripCompletionState(loadedRoutines));
  }

  const today = getTodayString();
  const progress = getDailyProgress();

  if (!progress || progress.date !== today) {
    saveDailyProgressSilently(createDailyResetProgress(today));
    return stripCompletionState(loadedRoutines);
  }

  return applyDailyProgressToRoutines(
    loadedRoutines,
    progress.completedRoutineIds,
  );
};

export const resetRoutinesWhenDateChanged = (
  currentRoutines: Routine[],
): Routine[] | null => {
  const today = getTodayString();
  const progress = getDailyProgress();

  if (progress && progress.date === today) return null;

  saveDailyProgressSilently(createDailyResetProgress(today));
  const updated = stripCompletionState(currentRoutines);
  saveRoutines(updated);

  return updated;
};
