import type { Routine, RoutinePreset } from "@/types/routine";
import { addPreset, createPresetFromRoutines, getPresets } from "./storage";
import { selectRoutinesForPresetSourceDay } from "./presetSourceRoutineSelection";
import { isPresetSourceSaveDisabled } from "./presetSaveValidation";

type CreatePresetWorkflowParams = {
  currentRoutines: Routine[];
  newPresetName: string;
  newPresetDescription: string;
  sourceDay: number | null;
};

export type PresetCreateFailureReason = "invalid-input" | "storage-failure";

export const createPresetAndReload = ({
  currentRoutines,
  newPresetName,
  newPresetDescription,
  sourceDay,
}: CreatePresetWorkflowParams): {
  presets: RoutinePreset[];
  created: boolean;
  failureReason: PresetCreateFailureReason | null;
} => {
  const routinesToSave = selectRoutinesForPresetSourceDay(
    currentRoutines,
    sourceDay,
  );

  if (isPresetSourceSaveDisabled(newPresetName, routinesToSave.length)) {
    return {
      presets: getPresets(),
      created: false,
      failureReason: "invalid-input",
    };
  }

  const preset = createPresetFromRoutines(
    newPresetName,
    routinesToSave,
    newPresetDescription || undefined,
  );
  if (!addPreset(preset)) {
    return {
      presets: getPresets(),
      created: false,
      failureReason: "storage-failure",
    };
  }

  return { presets: getPresets(), created: true, failureReason: null };
};
