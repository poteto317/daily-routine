import type { Routine } from "@/types/routine";

export type DailyProgressState = {
  date: string;
  completedRoutineIds: string[];
  lastResetTime: string;
};

export const stripCompletionState = (routines: Routine[]): Routine[] => {
  return routines.map((routine) => ({ ...routine, isCompleted: false }));
};

export const createDailyResetProgress = (today: string): DailyProgressState => {
  return {
    date: today,
    completedRoutineIds: [],
    lastResetTime: new Date().toISOString(),
  };
};

export const applyDailyProgressToRoutines = (
  routines: Routine[],
  completedRoutineIds: string[],
): Routine[] => {
  if (completedRoutineIds.length === 0) return stripCompletionState(routines);

  return routines.map((routine) => ({
    ...routine,
    isCompleted: completedRoutineIds.includes(routine.id),
  }));
};

export const buildDailyProgressFromRoutines = (
  routines: Routine[],
  today: string,
  currentProgress?: DailyProgressState | null,
): DailyProgressState => {
  return {
    date: today,
    completedRoutineIds: routines
      .filter((routine) => routine.isCompleted)
      .map((routine) => routine.id),
    lastResetTime: currentProgress?.lastResetTime || new Date().toISOString(),
  };
};
