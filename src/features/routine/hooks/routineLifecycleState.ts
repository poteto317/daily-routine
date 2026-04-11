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
  repairCorruptedGroupRoutines,
  stripCompletionState,
} from "./routineStateModel";

const shouldMigrateMultiDayRoutines = (routines: Routine[]): boolean => {
  // groupId 付きルーティンの daysOfWeek.length > 1 は汚染データであり、
  // レガシーフォーマット（未移行）ではないため除外する
  return routines.some(
    (routine) => routine.daysOfWeek.length > 1 && !routine.groupId,
  );
};

export const initializeRoutineState = (): Routine[] => {
  if (typeof window === "undefined") return [];

  let loadedRoutines = getRoutines();

  if (shouldMigrateMultiDayRoutines(loadedRoutines)) {
    loadedRoutines = migrateMultiDayRoutinesWithGroup(loadedRoutines);
    saveRoutines(stripCompletionState(loadedRoutines), {
      skipLocalDataUpdatedAt: true,
    });
  }

  const repaired = repairCorruptedGroupRoutines(loadedRoutines);
  if (repaired !== loadedRoutines) {
    loadedRoutines = repaired;
    saveRoutines(stripCompletionState(loadedRoutines), {
      skipLocalDataUpdatedAt: true,
    });
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
  // この関数は setRoutines の updater（React render フェーズ）内から呼ばれるため、
  // 同期イベント発火を抑止して他コンポーネントの setState を防ぐ。
  // isCompleted は一時的な状態であり sync status 更新は不要。
  saveRoutines(updated, { skipLocalDataUpdatedAt: true });

  return updated;
};
