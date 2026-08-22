import type { Routine } from "@/types/routine";

import { getMaxSortOrder } from "./routineOrderModel";

export type RoutineCreateInput = Omit<
  Routine,
  "id" | "createdAt" | "updatedAt"
>;

export type RoutineBatchCreateInput = Omit<
  Routine,
  "id" | "sortOrder" | "createdAt" | "updatedAt"
>;

export const createRoutinesForSingleInput = (
  previousRoutines: Routine[],
  routine: RoutineCreateInput,
): Routine[] => {
  const maxSortOrder = getMaxSortOrder(previousRoutines);
  const now = new Date().toISOString();
  const groupId = crypto.randomUUID();

  return routine.daysOfWeek.map((day, index) => ({
    ...routine,
    id: crypto.randomUUID(),
    groupId,
    daysOfWeek: [day],
    sortOrder: maxSortOrder + 1 + index,
    isCompleted: false,
    createdAt: now,
    updatedAt: now,
  }));
};

export const createRoutinesForBatchInput = (
  previousRoutines: Routine[],
  routines: RoutineBatchCreateInput[],
): Routine[] => {
  let sortOrder = getMaxSortOrder(previousRoutines) + 1;
  const now = new Date().toISOString();

  return routines.flatMap((routine) => {
    const daysToCreate =
      routine.daysOfWeek.length > 0 ? routine.daysOfWeek : [1, 2, 3, 4, 5];
    const groupId = crypto.randomUUID();
    const created = daysToCreate.map((day, index) => ({
      ...routine,
      id: crypto.randomUUID(),
      groupId,
      daysOfWeek: [day],
      sortOrder: sortOrder + index,
      isCompleted: false,
      createdAt: now,
      updatedAt: now,
    }));
    sortOrder += created.length;
    return created;
  });
};
