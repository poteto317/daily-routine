import type { Routine } from "@/types/routine";
import {
  buildUpdatedRoutine,
  createRoutinesForBatchInput,
  createRoutinesForSingleInput,
  sortRoutinesByOrder,
  type RoutineBatchCreateInput,
  type RoutineCreateInput,
} from "./routineStateModel";

export const addRoutineToState = (
  routines: Routine[],
  routine: RoutineCreateInput,
): Routine[] => {
  return sortRoutinesByOrder([
    ...routines,
    ...createRoutinesForSingleInput(routines, routine),
  ]);
};

export const addRoutinesToState = (
  routines: Routine[],
  newRoutines: RoutineBatchCreateInput[],
): Routine[] => {
  return sortRoutinesByOrder([
    ...routines,
    ...createRoutinesForBatchInput(routines, newRoutines),
  ]);
};

export const updateRoutineInState = (
  routines: Routine[],
  id: string,
  updates: Partial<Routine>,
  now: string,
): Routine[] => {
  const target = routines.find((routine) => routine.id === id);
  const hasWeeklyGoalUpdate = Object.prototype.hasOwnProperty.call(
    updates,
    "weeklyGoal",
  );

  return routines.map((routine) => {
    if (routine.id === id) {
      return buildUpdatedRoutine(routine, updates, now);
    }

    if (
      hasWeeklyGoalUpdate &&
      target?.groupId &&
      routine.groupId === target.groupId
    ) {
      return buildUpdatedRoutine(
        routine,
        { weeklyGoal: updates.weeklyGoal },
        now,
      );
    }

    return routine;
  });
};

export const deleteRoutineFromState = (
  routines: Routine[],
  id: string,
): Routine[] => {
  return routines.filter((routine) => routine.id !== id);
};

export const deleteRoutineGroupFromState = (
  routines: Routine[],
  groupId: string,
): Routine[] => {
  return routines.filter((routine) => routine.groupId !== groupId);
};

export const replaceRoutinesForDaysInState = (
  routines: Routine[],
  targetDays: number[],
  newRoutineInputs: RoutineBatchCreateInput[],
): Routine[] => {
  const keptRoutines = routines.filter(
    (routine) => !routine.daysOfWeek.some((day) => targetDays.includes(day)),
  );

  return sortRoutinesByOrder([
    ...keptRoutines,
    ...createRoutinesForBatchInput(keptRoutines, newRoutineInputs),
  ]);
};
