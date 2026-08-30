import type { Routine, RoutinePreset } from "@/types/routine";
import { normalizePresetMetadata } from "./presetMetadataNormalization";
import { buildRoutineTemplatesFromRoutines } from "./presetTemplateConverter";

export const buildUpdatedPreset = (params: {
  preset: RoutinePreset;
  name: string;
  description: string;
  routinesToSave: Routine[];
}): RoutinePreset => {
  const { preset, name, description, routinesToSave } = params;
  const metadata = normalizePresetMetadata(name, description);

  return {
    ...preset,
    ...metadata,
    routineTemplates: buildRoutineTemplatesFromRoutines(routinesToSave),
  };
};
