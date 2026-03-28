import type { Routine } from "@/types/routine";
import type { RoutineData } from "../pages/types";

export type RoutineSubmitPlan =
  | { type: "add-new" }
  | { type: "update-single"; routineId: string }
  | { type: "update-group"; groupId: string }
  | { type: "replace-group"; groupId: string };

const hasDaysChanged = (
  nextDays: number[],
  previousDays: number[],
): boolean => {
  if (nextDays.length !== previousDays.length) return true;

  return !nextDays.every((day) => previousDays.includes(day));
};

export const createRoutineSubmitPlan = (
  editingRoutine: Routine | undefined,
  routineData: RoutineData,
  originalGroupDays?: number[],
): RoutineSubmitPlan => {
  if (!editingRoutine) return { type: "add-new" };

  if (!editingRoutine.groupId)
    return { type: "update-single", routineId: editingRoutine.id };

  const previousDays = originalGroupDays ?? [];
  const nextDays = routineData.daysOfWeek;

  if (hasDaysChanged(nextDays, previousDays)) {
    return { type: "replace-group", groupId: editingRoutine.groupId };
  }

  return { type: "update-group", groupId: editingRoutine.groupId };
};
