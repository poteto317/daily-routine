import type { Routine, RoutinePreset } from "@/types/routine";
import { getPresets, updatePreset } from "./storage";
import { findPresetById } from "./presetLookup";
import { buildUpdatedPreset } from "./presetTemplateBuilder";
import { selectRoutinesForPresetSourceDay } from "./presetSourceRoutineSelection";
import { isPresetSourceSaveDisabled } from "./presetSaveValidation";

type SavePresetEditWorkflowParams = {
  presets: RoutinePreset[];
  editingPresetId: string | null;
  editingPresetUpdatedAt: string | null;
  editPresetName: string;
  editPresetDescription: string;
  sourceDay: number | null;
  currentRoutines: Routine[];
};

export type PresetEditFailureReason =
  | "invalid-input"
  | "preset-not-found"
  | "preset-conflict"
  | "storage-failure";

export const savePresetEditAndReload = ({
  presets,
  editingPresetId,
  editingPresetUpdatedAt,
  editPresetName,
  editPresetDescription,
  sourceDay,
  currentRoutines,
}: SavePresetEditWorkflowParams): {
  presets: RoutinePreset[];
  saved: boolean;
  failureReason: PresetEditFailureReason | null;
} => {
  const routinesToSave = selectRoutinesForPresetSourceDay(
    currentRoutines,
    sourceDay,
  );

  if (isPresetSourceSaveDisabled(editPresetName, routinesToSave.length)) {
    return { presets, saved: false, failureReason: "invalid-input" };
  }

  const preset = findPresetById(presets, editingPresetId);
  if (!preset || editingPresetUpdatedAt === null) {
    return { presets, saved: false, failureReason: "preset-not-found" };
  }

  const updateResult = updatePreset(
    buildUpdatedPreset({
      preset,
      name: editPresetName,
      description: editPresetDescription,
      routinesToSave,
    }),
    editingPresetUpdatedAt,
  );
  if (updateResult !== "updated") {
    return {
      presets: getPresets(),
      saved: false,
      failureReason: updateResult,
    };
  }
  return { presets: getPresets(), saved: true, failureReason: null };
};
