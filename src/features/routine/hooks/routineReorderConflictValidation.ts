import type { Routine } from "@/types/routine";
import { hasTimeConflict } from "../storageTimeConflict";

export const hasReorderedRoutineTimeConflict = (
  routines: Routine[],
  reorderedRoutines: Routine[],
): boolean => {
  const reorderedIds = new Set(reorderedRoutines.map((routine) => routine.id));

  return routines.some(
    (routine) =>
      reorderedIds.has(routine.id) &&
      hasTimeConflict(
        routine.startTime,
        routine.duration,
        routines,
        routine.id,
        routine.daysOfWeek,
      ).hasConflict,
  );
};
