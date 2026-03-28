import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Routine } from "@/types/routine";
import { SwipeableRoutineItem } from "@/components/SwipeableRoutineItem";
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
        }}
        {...attributes}
        {...listeners}
        className={getRoutineItemCardClassName({
          routine,
          isEditMode: true,
          isDraggable: true,
        })}
      >
        <RoutineCardContent routine={routine} showDuration />
        <RoutineItemActionButtons
          onEditAction={onEditAction}
          onDeleteAction={onDeleteAction}
        />
      </div>
    </SwipeableRoutineItem>
  );
};
