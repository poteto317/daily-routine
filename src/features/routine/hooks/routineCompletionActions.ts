import type { Routine } from "@/types/routine";
import type { DailyProgressState } from "./routineStateProgressModel";
import {
  assignSortOrder,
  buildDailyProgressFromRoutines,
} from "./routineStateModel";

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

export const buildDailyProgressForToggle = (
  routines: Routine[],
  today: string,
  currentProgress?: DailyProgressState | null,
): DailyProgressState => {
  return buildDailyProgressFromRoutines(routines, today, currentProgress);
};

export const reorderRoutineState = (routines: Routine[]): Routine[] => {
  return assignSortOrder(routines);
};
