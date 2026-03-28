"use client";

import { getSwipeActionMeta } from "./swipeable/getSwipeActionMeta";
import { useSwipeGesture } from "./swipeable/useSwipeGesture";

interface SwipeableRoutineItemProps {
  /** スワイプ完了時に呼ばれるコールバック。routineへの依存を持たない汎用シグネチャ */
  onSwipeAction: () => void;
  swipeActionType?: "delete" | "edit" | "indent";
  isEditMode?: boolean;
  children: React.ReactNode;
}

/**
 * スワイプ操作可能なラッパーコンポーネント
 * 右から左へのスワイプで任意のアクションを実行可能にする
 * タッチデバイスとマウス操作の両方をサポート
 */
export const SwipeableRoutineItem = ({
  onSwipeAction,
  swipeActionType = "delete",
  isEditMode = false,
  children,
}: SwipeableRoutineItemProps) => {
  const {
    translateX,
    isDragging,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
  } = useSwipeGesture({ isEditMode, onSwipeAction });

  const { actionColor, actionIcon } = getSwipeActionMeta(swipeActionType);

  return (
    <div
      className="relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      {/* 背景のアクションボタン */}
      <div
        className={`absolute inset-y-0 right-0 ${actionColor} flex items-center justify-center transition-all`}
        style={{ width: `${translateX}px` }}
      >
        <div className="text-white px-6">{actionIcon}</div>
      </div>

      {/* メインコンテンツ */}
      <div
        style={{
          transform: `translateX(-${translateX}px)`,
          transition: isDragging ? "none" : "transform 0.3s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
};
