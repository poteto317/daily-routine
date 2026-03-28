import type { Routine } from "@/types/routine";
import {
  createSwipeHandler,
  getRoutineCardStyle,
  isRoutinePast,
} from "../helpers";

type RoutineItemCallbacks = {
  onToggle: (id: string) => void;
  onEdit: (routine: Routine) => void;
  onDelete: (id: string) => void;
};

type RoutineItemCardClassParams = {
  routine: Routine;
  isEditMode: boolean;
  isDraggable: boolean;
};

const BASE_CARD_CLASS =
  "flex items-center gap-3 p-4 rounded-lg border transition-all";

export const createRoutineItemHandlers = (
  routine: Routine,
  { onToggle, onEdit, onDelete }: RoutineItemCallbacks,
  isEditMode: boolean,
) => {
  return {
    handleCardClick: () => {
      if (!isEditMode) {
        onToggle(routine.id);
      }
    },
    handleEditClick: () => onEdit(routine),
    handleDeleteClick: () => onDelete(routine.id),
    handleSwipeAction: createSwipeHandler(onEdit, onDelete),
  };
};

export const getRoutineItemCardClassName = ({
  routine,
  isEditMode,
  isDraggable,
}: RoutineItemCardClassParams): string => {
  const isPast = isRoutinePast(routine);
  const cardStyle = getRoutineCardStyle(routine, isPast);

  if (isDraggable)
    return `${BASE_CARD_CLASS} cursor-grab active:cursor-grabbing ${cardStyle}`;

  if (!isEditMode)
    return `${BASE_CARD_CLASS} cursor-pointer hover:shadow-md ${cardStyle}`;

  return `${BASE_CARD_CLASS} ${cardStyle}`;
};
