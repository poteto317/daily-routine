import type { Routine } from "@/types/routine";
import { ROUTINE_CATEGORIES } from "@/types/routine";
import { getCurrentTime, timeToMinutes } from "@/lib/storage/core";
import { getSettings } from "@/features/settings/storage";

export const isRoutinePast = (routine: Routine): boolean => {
  const currentTime = getCurrentTime();
  const today = new Date().getDay();
  const isTodayRoutine = routine.daysOfWeek.includes(today);
  return (
    isTodayRoutine &&
    timeToMinutes(currentTime) > timeToMinutes(routine.startTime)
  );
};

export const getCategoryInfo = (routine: Pick<Routine, "category">) => {
  return (
    ROUTINE_CATEGORIES.find((cat) => cat.value === routine.category) ||
    ROUTINE_CATEGORIES[5]
  );
};

export const getRoutineCardStyle = (
  routine: Routine,
  isPast: boolean,
): string => {
  if (routine.isCompleted)
    return "bg-green-50 border-green-300 dark:bg-green-100 dark:border-green-400";
  if (isPast && !routine.isCompleted)
    return "bg-yellow-50 border-yellow-200 dark:bg-yellow-100 dark:border-yellow-300";
  return "bg-white border-gray-200 dark:bg-slate-100 dark:border-gray-300";
};

export const createSwipeHandler = (
  onEdit: (routine: Routine) => void,
  onDelete: (id: string) => void,
) => {
  return (routine: Routine) => {
    const settings = getSettings();
    if (settings.swipeAction === "delete") {
      onDelete(routine.id);
    } else {
      onEdit(routine);
    }
  };
};
