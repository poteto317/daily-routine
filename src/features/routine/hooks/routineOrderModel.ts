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

/** sortOrder の昇順、同じなら id の昇順で比較する（並びを安定させるため） */
export const compareBySortOrderThenId = (
  left: Routine,
  right: Routine,
): number => {
  const sortOrderDiff = (left.sortOrder || 0) - (right.sortOrder || 0);
  if (sortOrderDiff !== 0) return sortOrderDiff;
  return left.id.localeCompare(right.id);
};

export const assignSortOrder = (routines: Routine[]): Routine[] => {
  return routines.map((routine, index) => ({ ...routine, sortOrder: index }));
};
