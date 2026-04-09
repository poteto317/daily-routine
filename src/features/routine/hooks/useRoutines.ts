"use client";

import { useState, useCallback } from "react";
import { type Routine } from "@/types/routine";
import { initializeRoutineState } from "./routineLifecycleState";
import {
  saveAndSyncRoutines,
  updateNotificationSchedules,
} from "./routinePersistenceSync";
import { useRoutineStateSync } from "./useRoutineStateSync";
import { useRoutineMutations } from "./useRoutineMutations";
import { useRoutineQueries } from "./useRoutineQueries";
import type { UseRoutinesResult } from "./routineHookContract";
import { createUseRoutinesResult } from "./useRoutinesResult";
import { getSettings } from "@/features/settings/storage";

const initializeBackgroundRefreshIntervalMs = (): number =>
  (getSettings().backgroundRefreshIntervalMinutes ?? 30) * 60 * 1000;

export const useRoutines = (): UseRoutinesResult => {
  const [routines, setRoutines] = useState<Routine[]>(initializeRoutineState);
  const [isLoaded] = useState(true);
  const [backgroundRefreshIntervalMs] = useState(
    initializeBackgroundRefreshIntervalMs,
  );

  useRoutineStateSync(
    isLoaded,
    setRoutines,
    routines,
    backgroundRefreshIntervalMs,
  );

  // 通知はService Workerに一元化（クライアント側での直接送信は行わない）

  /**
   * ルーティンを保存してFirebaseに同期する共通処理
   */
  const saveAndSync = useCallback((updated: Routine[]) => {
    saveAndSyncRoutines(updated, process.env.NEXT_PUBLIC_FUNCTIONS_URL);
  }, []);

  const mutations = useRoutineMutations(setRoutines, saveAndSync);
  const queries = useRoutineQueries(routines);

  const updateServiceWorkerSchedules = useCallback(
    async (routinesToSchedule?: Routine[]) => {
      const targetRoutines = routinesToSchedule || routines;
      return updateNotificationSchedules(targetRoutines);
    },
    [routines],
  );

  return createUseRoutinesResult({
    isLoaded,
    mutations,
    queries,
    routines,
    schedules: {
      updateServiceWorkerSchedules,
    },
  });
};
