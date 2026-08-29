import type { Routine } from "@/types/routine";
import { assignSortOrder } from "./routineOrderModel";

export const buildReorderedRoutineState = (
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

  const mergedRoutines = routines.map((routine) =>
    reorderedIds.has(routine.id)
      ? reorderedCurrentRoutines[reorderedIndex++]
      : routine,
  );

  return assignSortOrder(mergedRoutines);
};
