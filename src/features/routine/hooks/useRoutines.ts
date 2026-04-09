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
import { DEFAULT_SETTINGS, getSettings } from "@/features/settings";
import { LOCAL_DATA_UPDATED_AT_EVENT } from "@/lib/storage/core";

const BG_REFRESH_MIN_MS = 0;
const BG_REFRESH_MAX_MS = 60 * 60 * 1000; // 60分

/**
 * localStorage から読んだ値は型崩れ（string/null/NaN）している可能性があるため
 * Number.isFinite + 範囲クランプで安全な ms 値に変換する。
 */
const resolveBackgroundRefreshIntervalMs = (raw: unknown): number => {
  const minutes = Number(raw);
  if (!Number.isFinite(minutes)) {
    return DEFAULT_SETTINGS.backgroundRefreshIntervalMinutes! * 60 * 1000;
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

  // 設定画面で backgroundRefreshIntervalMinutes が変更されたとき
  // LOCAL_DATA_UPDATED_AT_EVENT が発火するので、そのタイミングで再読み込みする
  useEffect(() => {
    const handleSettingsChange = () => {
      setBackgroundRefreshIntervalMs(readBackgroundRefreshIntervalMs());
    };
    window.addEventListener(LOCAL_DATA_UPDATED_AT_EVENT, handleSettingsChange);
    return () => {
      window.removeEventListener(
        LOCAL_DATA_UPDATED_AT_EVENT,
        handleSettingsChange,
      );
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
