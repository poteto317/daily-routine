import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import type { Routine } from "@/types/routine";
import {
  refreshRoutineState,
  shouldRefreshOnPageShow,
  shouldRefreshOnVisibilityChange,
} from "./routineStateSync";

type SetRoutines = Dispatch<SetStateAction<Routine[]>>;

/**
 * フォアグラウンド復帰検知フック
 *
 * visibilitychange / pageshow / focus の3イベントを1つのフックで購読し、
 * 同一 tick 内の複数発火を setTimeout(0) + ref によって1回の
 * refreshRoutineState 呼び出しに束ねる（coalesce）。
 */
export const useRoutineForegroundSync = (
  isLoaded: boolean,
  setRoutines: SetRoutines,
): void => {
  const pendingIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    const scheduleRefresh = () => {
      if (pendingIdRef.current !== null) {
        clearTimeout(pendingIdRef.current);
      }
      pendingIdRef.current = setTimeout(() => {
        pendingIdRef.current = null;
        // タイマー実行時点で hidden に戻っていた場合はスキップする
        if (document.visibilityState !== "visible") return;
        refreshRoutineState(setRoutines);
      }, 0);
    };

    const handleVisibilityChange = () => {
      if (shouldRefreshOnVisibilityChange(document.visibilityState)) {
        scheduleRefresh();
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (shouldRefreshOnPageShow(event.persisted, document.visibilityState)) {
        scheduleRefresh();
      }
    };

    const handleFocus = () => {
      scheduleRefresh();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("focus", handleFocus);

    return () => {
      if (pendingIdRef.current !== null) {
        clearTimeout(pendingIdRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("focus", handleFocus);
    };
  }, [isLoaded, setRoutines]);
};
