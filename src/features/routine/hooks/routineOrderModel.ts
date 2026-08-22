import type { Routine } from "@/types/routine";

export const getMaxSortOrder = (routines: Routine[]): number => {
  return routines.length > 0
    ? Math.max(...routines.map((routine) => routine.sortOrder || 0))
    : -1;
};

export const sortRoutinesByOrder = (routines: Routine[]): Routine[] => {
  return [...routines].sort(
    (left, right) => (left.sortOrder || 0) - (right.sortOrder || 0),
  );
};

export const assignSortOrder = (routines: Routine[]): Routine[] => {
  return routines.map((routine, index) => ({ ...routine, sortOrder: index }));
};
