import type { Routine } from "@/types/routine";
import { buildReorderedRoutineState } from "./routineReorderStateModel";
import { hasReorderedRoutineTimeConflict } from "./routineReorderConflictValidation";
import {
  hasInvalidReorderTargets,
  hasStaleReorderSchedule,
} from "./routineReorderRequestValidation";

export const reorderRoutineState = (
  routines: Routine[],
  reorderedRoutines: Routine[],
  sourceRoutines: Routine[],
): Routine[] | null => {
  if (
    hasInvalidReorderTargets(routines, reorderedRoutines, sourceRoutines) ||
    hasStaleReorderSchedule(routines, sourceRoutines)
  ) {
    return null;
  }

  const reorderedState = buildReorderedRoutineState(
    routines,
    reorderedRoutines,
  );

  if (hasReorderedRoutineTimeConflict(reorderedState, reorderedRoutines)) {
    return null;
  }

  return reorderedState;
};
