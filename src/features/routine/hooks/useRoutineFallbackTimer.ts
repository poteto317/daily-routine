import { useCallback, useEffect, useRef } from "react";

type FallbackTimerControls = {
  /** visible 状態のときのみ setInterval を開始する。intervalMs が 0 なら何もしない。 */
  start: (onTick: () => void) => void;
  /** 実行中のタイマーを停止する。 */
  stop: () => void;
};

/**
 * フォールバックタイマーのライフサイクルを管理するフック
 *
 * - start(onTick) を呼ぶと visible 状態のときのみ setInterval を開始する
 * - stop() を呼ぶと実行中のタイマーを停止する
 * - intervalMs が 0 の場合は start を呼んでもタイマーは開始しない
 * - アンマウント時にタイマーを自動停止する
 */
export const useRoutineFallbackTimer = (
  intervalMs: number,
): FallbackTimerControls => {
  const idRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (idRef.current !== null) {
      clearInterval(idRef.current);
      idRef.current = null;
    }
  }, []);

  const start = useCallback(
    (onTick: () => void) => {
      stop();
      if (intervalMs === 0) return;
      if (document.visibilityState !== "visible") return;
      idRef.current = setInterval(onTick, intervalMs);
    },
    [stop, intervalMs],
  );

  useEffect(() => {
    stop();
  }, [intervalMs, stop]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { start, stop };
};
