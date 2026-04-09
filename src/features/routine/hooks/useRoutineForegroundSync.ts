import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import type { Routine } from "@/types/routine";
import { refreshRoutineState } from "./routineStateSync";
import { useRoutineLastUpdateTracker } from "./useRoutineLastUpdateTracker";
import { useRoutineFallbackTimer } from "./useRoutineFallbackTimer";

type SetRoutines = Dispatch<SetStateAction<Routine[]>>;

/**
 * フォアグラウンド復帰検知フック
 *
 * visibilitychange / pageshow / focus の3イベントを購読し、
 * 同一 tick 内の複数発火を setTimeout(0) + ref によって1回の
 * refreshRoutineState 呼び出しに束ねる（coalesce）。
 * フォールバックタイマーを使ってイベント見逃しを補完する。
 *
 * @param backgroundRefreshIntervalMs フォールバックタイマーの間隔（ミリ秒）。0 の場合は無効。
 */
export const useRoutineForegroundSync = (
  isLoaded: boolean,
  setRoutines: SetRoutines,
  routines: Routine[],
  backgroundRefreshIntervalMs: number,
): void => {
  const pendingIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastBackgroundRefreshAtRef = useRef<number>(0);

  const lastRoutineUpdateAtRef = useRoutineLastUpdateTracker(routines);
  const { start: startFallbackTimer, stop: stopFallbackTimer } =
    useRoutineFallbackTimer(backgroundRefreshIntervalMs);

  useEffect(() => {
    if (!isLoaded) return;

    const clearPendingRefresh = () => {
      if (pendingIdRef.current !== null) {
        clearTimeout(pendingIdRef.current);
        pendingIdRef.current = null;
      }
    };

    const shouldSkipFallbackRefresh = (): boolean => {
      const now = Date.now();
      return (
        now - lastRoutineUpdateAtRef.current < backgroundRefreshIntervalMs ||
        now - lastBackgroundRefreshAtRef.current < backgroundRefreshIntervalMs
      );
    };

    const runRefresh = (force: boolean) => {
      if (document.visibilityState !== "visible") return;
      if (!force && shouldSkipFallbackRefresh()) return;
      refreshRoutineState(setRoutines);
      lastBackgroundRefreshAtRef.current = Date.now();
    };

    const scheduleRefresh = () => {
      clearPendingRefresh();
      pendingIdRef.current = setTimeout(() => {
        pendingIdRef.current = null;
        runRefresh(true);
      }, 0);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        scheduleRefresh();
        startFallbackTimer(() => runRefresh(false));
        return;
      }
      clearPendingRefresh();
      stopFallbackTimer();
    };

    const handlePageShow = () => {
      scheduleRefresh();
      startFallbackTimer(() => runRefresh(false));
    };

    const handleFocus = () => {
      scheduleRefresh();
      startFallbackTimer(() => runRefresh(false));
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("focus", handleFocus);
    startFallbackTimer(() => runRefresh(false));

    return () => {
      clearPendingRefresh();
      stopFallbackTimer();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("focus", handleFocus);
    };
  }, [
    isLoaded,
    setRoutines,
    backgroundRefreshIntervalMs,
    lastRoutineUpdateAtRef,
    startFallbackTimer,
    stopFallbackTimer,
  ]);
};
