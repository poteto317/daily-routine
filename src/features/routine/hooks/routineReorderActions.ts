import type { Routine } from "@/types/routine";
import { assignSortOrder } from "./routineOrderModel";

const hasInvalidReorderTargets = (
  routines: Routine[],
  reorderedRoutines: Routine[],
): boolean => {
  const currentIds = new Set(routines.map((routine) => routine.id));
  const reorderedIds = new Set(reorderedRoutines.map((routine) => routine.id));

  return (
    reorderedIds.size !== reorderedRoutines.length ||
    reorderedRoutines.some((routine) => !currentIds.has(routine.id))
  );
};

const hasStaleReorderStartTimes = (
  routines: Routine[],
  reorderedRoutines: Routine[],
): boolean => {
  const reorderedIds = new Set(reorderedRoutines.map((routine) => routine.id));
  const currentStartTimes = routines
    .filter((routine) => reorderedIds.has(routine.id))
    .map((routine) => routine.startTime)
    .sort();
  const reorderedStartTimes = reorderedRoutines
    .map((routine) => routine.startTime)
    .sort();

  return currentStartTimes.some(
    (startTime, index) => startTime !== reorderedStartTimes[index],
  );
};

const mergeReorderedRoutineSlots = (
  routines: Routine[],
  reorderedRoutines: Routine[],
): Routine[] => {
  const reorderedIds = new Set(reorderedRoutines.map((routine) => routine.id));
  const currentRoutinesById = new Map(
    routines.map((routine) => [routine.id, routine]),
  );
  const reorderedCurrentRoutines = reorderedRoutines.map((routine) => ({
    ...currentRoutinesById.get(routine.id)!,
    startTime: routine.startTime,
  }));
  let reorderedIndex = 0;

  return routines.map((routine) =>
    reorderedIds.has(routine.id)
      ? reorderedCurrentRoutines[reorderedIndex++]
      : routine,
  );
};

export const reorderRoutineState = (
  routines: Routine[],
  reorderedRoutines: Routine[],
): Routine[] => {
  if (
    hasInvalidReorderTargets(routines, reorderedRoutines) ||
    hasStaleReorderStartTimes(routines, reorderedRoutines)
  ) {
    return routines;
  }

  return assignSortOrder(
    mergeReorderedRoutineSlots(routines, reorderedRoutines),
  );
};
