import type { Routine } from "@/types/routine";
import { assignSortOrder } from "./routineOrderModel";

const hasInvalidReorderTargets = (
  routines: Routine[],
  reorderedRoutines: Routine[],
  sourceRoutines: Routine[],
): boolean => {
  const currentIds = new Set(routines.map((routine) => routine.id));
  const reorderedIds = new Set(reorderedRoutines.map((routine) => routine.id));
  const sourceIds = new Set(sourceRoutines.map((routine) => routine.id));

  return (
    reorderedIds.size !== reorderedRoutines.length ||
    sourceIds.size !== sourceRoutines.length ||
    sourceRoutines.length !== reorderedRoutines.length ||
    reorderedRoutines.some(
      (routine) => !currentIds.has(routine.id) || !sourceIds.has(routine.id),
    ) ||
    sourceRoutines.some(
      (routine) => !currentIds.has(routine.id) || !reorderedIds.has(routine.id),
    )
  );
};

const hasStaleReorderStartTimes = (
  routines: Routine[],
  sourceRoutines: Routine[],
): boolean => {
  const currentRoutinesById = new Map(
    routines.map((routine) => [routine.id, routine]),
  );

  return sourceRoutines.some(
    (routine) =>
      currentRoutinesById.get(routine.id)?.startTime !== routine.startTime,
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
  sourceRoutines: Routine[],
): Routine[] => {
  if (
    hasInvalidReorderTargets(routines, reorderedRoutines, sourceRoutines) ||
    hasStaleReorderStartTimes(routines, sourceRoutines)
  ) {
    return routines;
  }

  return assignSortOrder(
    mergeReorderedRoutineSlots(routines, reorderedRoutines),
  );
};
