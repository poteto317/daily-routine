import { useCallback, useEffect, useRef } from "react";
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";
import { hasExceededMoveTolerance } from "./longPressMoveTolerance";

type UseLongPressParams = {
  onLongPress: () => void;
  onClick?: () => void;
  delay?: number;
  moveTolerance?: number;
  /** trueの間は長押し・タップとも無効化し、保留中のタイマーもキャンセルする。 */
  disabled?: boolean;
};

const DEFAULT_DELAY = 500;
const DEFAULT_MOVE_TOLERANCE = 10;

/**
 * タップと長押しを判別するPointer Eventsベースの汎用フック。
 * 長押しが成立した場合、それに続くclickイベントは握りつぶしonClickを呼ばない。
 */
export const useLongPress = ({
  onLongPress,
  onClick,
  delay = DEFAULT_DELAY,
  moveTolerance = DEFAULT_MOVE_TOLERANCE,
  disabled = false,
}: UseLongPressParams) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPositionRef = useRef<{ x: number; y: number } | null>(null);
  const triggeredRef = useRef(false);
  // "mouse"をデフォルトにし、pointerDown未発生時にコンテキストメニューを
  // 誤って抑止しない（=右クリックメニューを保つ）ようにする。
  const lastPointerTypeRef = useRef<string>("mouse");

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    // 押下中に対象が無効化された場合（例: 別アイテムのドラッグが始まった）、
    // 保留中の長押しタイマーが disabled 化後に発火しないようキャンセルする。
    if (disabled) {
      clearTimer();
      triggeredRef.current = false;
    }
  }, [clearTimer, disabled]);

  useEffect(() => {
    // 押下中に対象がアンマウントされた場合（同期・Undo等で対象アイテムが
    // 削除された等）、保留中のタイマーがアンマウント後に発火しないようにする。
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (disabled) return;
      startPositionRef.current = { x: e.clientX, y: e.clientY };
      lastPointerTypeRef.current = e.pointerType;
      triggeredRef.current = false;
      clearTimer();
      timerRef.current = setTimeout(() => {
        triggeredRef.current = true;
        onLongPress();
      }, delay);
    },
    [clearTimer, delay, disabled, onLongPress],
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const start = startPositionRef.current;
      if (!start) return;
      if (hasExceededMoveTolerance(start, { x: e.clientX, y: e.clientY }, moveTolerance)) {
        clearTimer();
      }
    },
    [clearTimer, moveTolerance],
  );

  const handlePointerUp = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  const handlePointerCancel = useCallback(() => {
    clearTimer();
    triggeredRef.current = false;
  }, [clearTimer]);

  const handleClick = useCallback(() => {
    if (triggeredRef.current) {
      triggeredRef.current = false;
      return;
    }
    onClick?.();
  }, [onClick]);

  const handleContextMenu = useCallback((e: ReactMouseEvent<HTMLElement>) => {
    // タッチ/ペン由来の長押し（モバイルのコールアウトメニュー）のみ抑止する。
    // マウスの右クリックメニューはそのまま許可する。
    // triggeredRef（自前タイマーの成立有無）で判定すると、ブラウザのネイティブ
    // 長押しジェスチャー認識とJSタイマーの発火順序に依存する競合状態になるため使わない。
    if (lastPointerTypeRef.current !== "mouse") {
      e.preventDefault();
    }
  }, []);

  return {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerLeave: handlePointerCancel,
    onPointerCancel: handlePointerCancel,
    onClick: handleClick,
    onContextMenu: handleContextMenu,
  };
};
