import type { Routine } from "@/types/routine";

export type RoutineCreateInput = Omit<
  Routine,
  "id" | "createdAt" | "updatedAt"
>;

export type RoutineBatchCreateInput = Omit<
  Routine,
  "id" | "sortOrder" | "createdAt" | "updatedAt"
>;

const getMaxSortOrder = (routines: Routine[]): number => {
  return routines.length > 0
    ? Math.max(...routines.map((routine) => routine.sortOrder || 0))
    : -1;
};

export const sortRoutinesByOrder = (routines: Routine[]): Routine[] => {
  return [...routines].sort(
    (left, right) => (left.sortOrder || 0) - (right.sortOrder || 0),
  );
};

export const migrateMultiDayRoutinesWithGroup = (
  routines: Routine[],
): Routine[] => {
  const migratedRoutines: Routine[] = [];
  let maxSortOrder = Math.max(
    ...routines.map((routine) => routine.sortOrder || 0),
    0,
  );

  routines.forEach((routine) => {
    const groupId = routine.groupId || routine.id;
    if (routine.daysOfWeek.length <= 1) {
      migratedRoutines.push({ ...routine, groupId });
      return;
    }

    routine.daysOfWeek.forEach((day, index) => {
      migratedRoutines.push({
        ...routine,
        id: index === 0 ? routine.id : crypto.randomUUID(),
        groupId,
        daysOfWeek: [day],
        sortOrder: index === 0 ? routine.sortOrder : ++maxSortOrder,
        isCompleted: false,
      });
    });
  });

  return migratedRoutines;
};

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

export const buildUpdatedRoutine = (
  routine: Routine,
  updates: Partial<Routine>,
  now: string,
): Routine => ({ ...routine, ...updates, updatedAt: now });

export const assignSortOrder = (routines: Routine[]): Routine[] => {
  return routines.map((routine, index) => ({ ...routine, sortOrder: index }));
};
