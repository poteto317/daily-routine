"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Routine } from "@/types/routine";
import { RoutineCardContent } from "./RoutineCardContent";
import { getRoutineItemCardClassName } from "./routineItemModel";

type Props = {
  routine: Routine;
  onToggleAction: (id: string) => void;
  /** ドラッグ中（いずれかのアイテムがドラッグ中）か否か */
  isDragActive: boolean;
};

/**
 * 通常表示モードのソート可能ルーティンアイテム
 * ロングプレスでドラッグ並び替えを開始し、タップで完了トグルを行う
 */
export const SortableRoutineNormalDragItem = ({
  routine,
  onToggleAction,
  isDragActive,
}: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: routine.id });

  const handleClick = () => {
    // ドラッグ操作後の誤タップを防ぐ
    if (isDragActive) return;
    onToggleAction(routine.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        // ドラッグ中にスクロールと競合しないようにする
        touchAction: "pan-y",
      }}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={getRoutineItemCardClassName({
        routine,
        isEditMode: false,
        isDraggable: false,
      })}
    >
      <RoutineCardContent routine={routine} showDuration />
    </div>
  );
};
