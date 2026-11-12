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
  /** ドラッグ中（このアイテム自身がドラッグされている）か否か */
  isDragging?: boolean;
  /** 表示に使う現在時刻（分単位の epoch ミリ秒）。useCurrentMinute() の値を渡す */
  nowMinute: number;
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
  isDragging = false,
  nowMinute,
}: RoutineItemCardClassParams): string => {
  const isPast = isRoutinePast(routine, nowMinute);

  // ドラッグ中のプレースホルダーは背景を維持しつつ枠線をハイライト
  if (isDragging) {
    const bgClass = routine.isCompleted
      ? "bg-green-50 dark:bg-green-100"
      : isPast
        ? "bg-yellow-50 dark:bg-yellow-100"
        : "bg-white dark:bg-slate-100";
    return `${BASE_CARD_CLASS} ${bgClass} border-blue-400 dark:border-blue-500 shadow-md`;
  }

  const cardStyle = getRoutineCardStyle(routine, isPast);

  if (isDraggable)
    return `${BASE_CARD_CLASS} cursor-grab active:cursor-grabbing ${cardStyle}`;

  if (!isEditMode)
    return `${BASE_CARD_CLASS} cursor-pointer hover:shadow-md ${cardStyle}`;

  return `${BASE_CARD_CLASS} ${cardStyle}`;
};
