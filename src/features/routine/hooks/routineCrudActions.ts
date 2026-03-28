import type { Routine } from "@/types/routine";
import {
  buildUpdatedRoutine,
  createRoutinesForBatchInput,
  createRoutinesForSingleInput,
  sortRoutinesByOrder,
  type RoutineBatchCreateInput,
  type RoutineCreateInput,
} from "./routineStateModel";
import type { UpdateRoutineGroupInput } from "./routineHookContract";

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
  return routines.map((routine) =>
    routine.id === id ? buildUpdatedRoutine(routine, updates, now) : routine,
  );
};

export const updateRoutineGroupInState = (
  routines: Routine[],
  groupId: string,
  updates: UpdateRoutineGroupInput,
  now: string,
): Routine[] => {
  return routines.map((routine) =>
    routine.groupId === groupId
      ? buildUpdatedRoutine(routine, updates, now)
      : routine,
  );
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
