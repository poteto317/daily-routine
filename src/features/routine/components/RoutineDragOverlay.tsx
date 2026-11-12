"use client";

import type { Routine } from "@/types/routine";
import { useCurrentMinute } from "@/hooks/useCurrentMinute";
import { RoutineCardContent } from "./RoutineCardContent";
import { getRoutineItemCardClassName } from "./routineItemModel";

type Props = {
  routine: Routine | null;
};

/**
 * ドラッグ中に表示するオーバーレイカード
 * ドラッグ中のルーティンを視覚的に表現する
 */
export const RoutineDragOverlay = ({ routine }: Props) => {
  const nowMinute = useCurrentMinute();
  if (!routine) return null;

  return (
    <div
      className={
        getRoutineItemCardClassName({
          routine,
          isEditMode: false,
          isDraggable: false,
          nowMinute,
        }) + " shadow-xl opacity-95 ring-2 ring-blue-400 dark:ring-blue-500"
      }
    >
      <RoutineCardContent routine={routine} showDuration />
    </div>
  );
};
