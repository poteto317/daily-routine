"use client";

import { useState, useCallback, useEffect } from "react";
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
import {
  DEFAULT_SETTINGS,
  getSettings,
  SETTINGS_UPDATED_EVENT,
} from "@/features/settings";

const BG_REFRESH_MIN_MS = 0;
const BG_REFRESH_MAX_MS = 60 * 60 * 1000; // 60分
const BG_REFRESH_DEFAULT_MS =
  (DEFAULT_SETTINGS.backgroundRefreshIntervalMinutes ?? 30) * 60 * 1000;

/**
 * localStorage から読んだ値は型崩れ（string/null/NaN）している可能性があるため
 * null/undefined・非有限数・負値を明示的にデフォルトへフォールバックし、
 * 上限をクランプして安全な ms 値に変換する。
 */
const resolveBackgroundRefreshIntervalMs = (raw: unknown): number => {
  if (raw == null) return BG_REFRESH_DEFAULT_MS;
  const minutes = Number(raw);
  if (!Number.isFinite(minutes) || minutes < 0) {
    return BG_REFRESH_DEFAULT_MS;
  }
  const ms = minutes * 60 * 1000;
  return Math.min(Math.max(ms, BG_REFRESH_MIN_MS), BG_REFRESH_MAX_MS);
};

const readBackgroundRefreshIntervalMs = (): number =>
  resolveBackgroundRefreshIntervalMs(
    getSettings().backgroundRefreshIntervalMinutes,
  );

export const useRoutines = (): UseRoutinesResult => {
  const [routines, setRoutines] = useState<Routine[]>(initializeRoutineState);
  const [isLoaded] = useState(true);
  const [backgroundRefreshIntervalMs, setBackgroundRefreshIntervalMs] =
    useState(readBackgroundRefreshIntervalMs);

  // SETTINGS_UPDATED_EVENT は saveSettings が呼ばれたときのみ発火する。
  // ルーティン保存など高頻度な操作では発火されないため、不要な getSettings() 呼び出しを防ぐ。
  useEffect(() => {
    const handleSettingsChange = () => {
      setBackgroundRefreshIntervalMs(readBackgroundRefreshIntervalMs());
    };
    window.addEventListener(SETTINGS_UPDATED_EVENT, handleSettingsChange);
    return () => {
      window.removeEventListener(SETTINGS_UPDATED_EVENT, handleSettingsChange);
    };
  }, []);

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
