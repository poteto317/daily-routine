"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Routine } from "@/types/routine";
import { useCurrentMinute } from "@/hooks/useCurrentMinute";
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
 * 左端のドラッグハンドル（⠿）をタップして並び替えを開始し、カード本体のタップで完了トグルを行う
 */
export const SortableRoutineNormalDragItem = ({
  routine,
  onToggleAction,
  isDragActive,
}: Props) => {
  const nowMinute = useCurrentMinute();
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
        // ハンドル以外の領域でスクロールを許可する
        touchAction: "pan-y",
      }}
      onClick={handleClick}
      className={getRoutineItemCardClassName({
        routine,
        isEditMode: false,
        isDraggable: false,
        isDragging,
        nowMinute,
      })}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        style={{ touchAction: "none" }}
        className="shrink-0 cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-500 hover:text-gray-400 dark:hover:text-gray-400 select-none"
        aria-label="並び替え"
        onClick={(e) => e.stopPropagation()}
      >
        ⠿
      </button>
      <RoutineCardContent routine={routine} showDuration />
    </div>
  );
};
