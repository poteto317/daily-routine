import type { Routine } from "@/types/routine";

export const toggleRoutineCompletionInState = (
  routines: Routine[],
  id: string,
): Routine[] => {
  return routines.map((routine) =>
    routine.id === id
      ? { ...routine, isCompleted: !routine.isCompleted }
      : routine,
  );
};
