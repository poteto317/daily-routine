"use client";

import type { Routine } from "@/types/routine";
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
  if (!routine) return null;

  return (
    <div
      className={
        getRoutineItemCardClassName({
          routine,
          isEditMode: false,
          isDraggable: false,
        }) + " shadow-xl opacity-95"
      }
    >
      <RoutineCardContent routine={routine} showDuration />
    </div>
  );
};
