"use client";

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  type SetStateAction,
  type Dispatch,
} from "react";
import { type Routine } from "@/types/routine";
import { initializeRoutineStateWithMeta } from "./routineLifecycleState";
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
} from "@/features/settings/storage";
import { setLocalDataUpdatedAt } from "@/lib/storage/core";

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
  // 初期化時に migrate/repair が発生したかを useState で保持（setter は使用しない）
  // useRef に render 中に書き込む形を避けるため、lazy initializer で両値を取得する
  const [
    { routines: initRoutines, didRepairOrMigrate: initDidRepairOrMigrate },
  ] = useState(() => initializeRoutineStateWithMeta());
  const [routinesState, setRoutinesState] = useState<Routine[]>(
    () => initRoutines,
  );
  const [isLoaded] = useState(true);
  const [backgroundRefreshIntervalMs, setBackgroundRefreshIntervalMs] =
    useState(readBackgroundRefreshIntervalMs);

  // routinesRef は常に最新の routines を保持する。
  // setRoutines をラッパーにすることで、呼び出し元が誰であれ（sync/mutations/reorder）
  // 必ず routinesRef.current が即時更新され、同一 tick 内の連続操作でも stale state を参照しない。
  const routinesRef = useRef<Routine[]>(routinesState);
  const setRoutines: Dispatch<SetStateAction<Routine[]>> = useCallback(
    (action) => {
      const next =
        typeof action === "function" ? action(routinesRef.current) : action;
      routinesRef.current = next;
      setRoutinesState(next);
    },
    [],
  );

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

  // migrate/repair が発生した場合、skipLocalDataUpdatedAt: true で保存したため
  // タイムスタンプが未更新のまま。マウント後に1回だけ更新して sync 側に変更を伝える。
  useEffect(() => {
    if (initDidRepairOrMigrate) {
      setLocalDataUpdatedAt(Date.now());
    }
  }, [initDidRepairOrMigrate]);

  useRoutineStateSync(
    isLoaded,
    setRoutines,
    routinesState,
    backgroundRefreshIntervalMs,
  );

  // 通知はService Workerに一元化（クライアント側での直接送信は行わない）

  /**
   * ルーティンを保存してFirebaseに同期する共通処理
   */
  const saveAndSync = useCallback((updated: Routine[]) => {
    saveAndSyncRoutines(updated, process.env.NEXT_PUBLIC_FUNCTIONS_URL);
  }, []);

  const mutations = useRoutineMutations(setRoutines, saveAndSync, routinesRef);
  const queries = useRoutineQueries(routinesState);

  const updateServiceWorkerSchedules = useCallback(
    async (routinesToSchedule?: Routine[]) => {
      const targetRoutines = routinesToSchedule || routinesState;
      return updateNotificationSchedules(targetRoutines);
    },
    [routinesState],
  );

  return createUseRoutinesResult({
    isLoaded,
    mutations,
    queries,
    routines: routinesState,
    schedules: {
      updateServiceWorkerSchedules,
    },
  });
};
