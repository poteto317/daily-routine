"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Routine } from "@/types/routine";
import { SwipeableRoutineItem } from "@/components/SwipeableRoutineItem";
import { useCurrentMinute } from "@/hooks/useCurrentMinute";
import { RoutineCardContent } from "./RoutineCardContent";
import { getRoutineItemCardClassName } from "./routineItemModel";
import { RoutineItemActionButtons } from "./RoutineItemActionButtons";

type SortableRoutineEditModeItemProps = {
  routine: Routine;
  onEditAction: () => void;
  onDeleteAction: () => void;
  onSwipeAction: () => void;
  swipeActionType: "delete" | "edit";
};

export const SortableRoutineEditModeItem = ({
  routine,
  onEditAction,
  onDeleteAction,
  onSwipeAction,
  swipeActionType,
}: SortableRoutineEditModeItemProps) => {
  const nowMinute = useCurrentMinute();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: routine.id });

  return (
    <SwipeableRoutineItem
      onSwipeAction={onSwipeAction}
      swipeActionType={swipeActionType}
      isEditMode={true}
    >
      <div
        ref={setNodeRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
          opacity: isDragging ? 0.5 : 1,
          // ハンドル以外の領域でスクロールを許可する
          touchAction: "pan-y",
        }}
        className={getRoutineItemCardClassName({
          routine,
          isEditMode: true,
          isDraggable: true,
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
          // capture フェーズで伝播を止めることで、祖先の SwipeableRoutineItem に
          // touchstart / mousedown が届かないようにする。
          // onPointerDownCapture は追加しない（{...listeners} の onPointerDown を
          // 潰すと PointerSensor が起動しなくなるため）。
          onTouchStartCapture={(e) => e.stopPropagation()}
          onMouseDownCapture={(e) => e.stopPropagation()}
        >
          ⠿
        </button>
        <RoutineCardContent routine={routine} showDuration />
        <RoutineItemActionButtons
          onEditAction={onEditAction}
          onDeleteAction={onDeleteAction}
        />
      </div>
    </SwipeableRoutineItem>
  );
};
