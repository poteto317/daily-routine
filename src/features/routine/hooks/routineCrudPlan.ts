import type { Routine } from "@/types/routine";

export type RoutineSubmitPlan =
  | { type: "add-new" }
  | { type: "update-single"; routineId: string };

export const createRoutineSubmitPlan = (
  editingRoutine: Routine | undefined,
): RoutineSubmitPlan => {
  if (!editingRoutine) return { type: "add-new" };

  return { type: "update-single", routineId: editingRoutine.id };
};
