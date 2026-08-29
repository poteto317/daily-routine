import type { Routine } from "@/types/routine";

export const hasInvalidReorderTargets = (
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

export const hasStaleReorderSchedule = (
  routines: Routine[],
  sourceRoutines: Routine[],
): boolean => {
  const currentRoutinesById = new Map(
    routines.map((routine) => [routine.id, routine]),
  );

  return sourceRoutines.some((routine) => {
    const currentRoutine = currentRoutinesById.get(routine.id);
    return (
      currentRoutine?.startTime !== routine.startTime ||
      currentRoutine.duration !== routine.duration
    );
  });
};
