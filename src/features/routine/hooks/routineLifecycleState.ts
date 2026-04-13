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

type InitializeRoutineStateResult = {
  routines: Routine[];
  /** migrate/repair によるローカル変更が行われた場合は true。
   *  呼び出し元はマウント後に setLocalDataUpdatedAt を呼ぶこと。 */
  didRepairOrMigrate: boolean;
};

export const initializeRoutineStateWithMeta =
  (): InitializeRoutineStateResult => {
    if (typeof window === "undefined") {
      return { routines: [], didRepairOrMigrate: false };
    }

    let loadedRoutines = getRoutines();
    let didRepairOrMigrate = false;

    if (shouldMigrateMultiDayRoutines(loadedRoutines)) {
      loadedRoutines = migrateMultiDayRoutinesWithGroup(loadedRoutines);
      saveRoutines(stripCompletionState(loadedRoutines), {
        skipLocalDataUpdatedAt: true,
      });
      didRepairOrMigrate = true;
    }

    const today = getTodayString();
    const progress = getDailyProgress();

    // 今日の進捗のみ completedRoutineIds を repair に渡す。
    // 古い日付の progress だと昨日以前の完了状態で優先判定が行われてしまうため除外する。
    const completedRoutineIds =
      progress?.date === today ? progress.completedRoutineIds : undefined;

    const repaired = repairCorruptedGroupRoutines(
      loadedRoutines,
      completedRoutineIds,
    );
    if (repaired !== loadedRoutines) {
      loadedRoutines = repaired;
      saveRoutines(stripCompletionState(loadedRoutines), {
        skipLocalDataUpdatedAt: true,
      });
      didRepairOrMigrate = true;
    }

    if (!progress || progress.date !== today) {
      saveDailyProgressSilently(createDailyResetProgress(today));
      return { routines: stripCompletionState(loadedRoutines), didRepairOrMigrate };
    }

    return {
      routines: applyDailyProgressToRoutines(
        loadedRoutines,
        progress.completedRoutineIds,
      ),
      didRepairOrMigrate,
    };
  };

export const initializeRoutineState = (): Routine[] =>
  initializeRoutineStateWithMeta().routines;

export const resetRoutinesWhenDateChanged = (
  currentRoutines: Routine[],
): Routine[] | null => {
  const today = getTodayString();
  const progress = getDailyProgress();

  if (progress && progress.date === today) return null;

  saveDailyProgressSilently(createDailyResetProgress(today));
  const updated = stripCompletionState(currentRoutines);
  // 日付変更による isCompleted リセットは一時状態の揮発であり、
  // ユーザー主導のデータ変更ではないため local-data-updated-at は更新しない。
  saveRoutines(updated, { skipLocalDataUpdatedAt: true });

  return updated;
};
