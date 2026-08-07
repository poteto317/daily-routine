import type { Routine, RoutinePreset } from "@/types/routine";
import { resolveUpdatedRoutineTemplates } from "./presetTemplateMergePolicy";

export const buildUpdatedPreset = (params: {
  preset: RoutinePreset;
  name: string;
  description: string;
  routinesToSave: Routine[];
  currentRoutines: Routine[];
}): RoutinePreset => {
  const { preset, name, description, routinesToSave, currentRoutines } = params;

  return {
    ...preset,
    name: name.trim(),
    description: description.trim() || undefined,
    routineTemplates: resolveUpdatedRoutineTemplates({
      preset,
      routinesToSave,
      currentRoutines,
    }),
  };
};
