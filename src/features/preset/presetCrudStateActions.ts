import type { Routine, RoutinePreset } from "@/types/routine";
import {
  addPreset,
  createPresetFromRoutines,
  deletePreset,
  duplicatePreset,
  getPresets,
} from "./storage";
import {
  canCreatePreset,
  findPresetById,
  getSelectedRoutinesForPreset,
} from "./presetStateHelpers";
import { PRESET_MANAGER_MESSAGES } from "./presetManagerPresentation";

export const loadPresetList = (): RoutinePreset[] => getPresets();

export const createPresetAndReload = (params: {
  currentRoutines: Routine[];
  newPresetName: string;
  newPresetDescription: string;
  selectedRoutines: Set<string>;
  alertFn?: (message?: string) => void;
}): { presets: RoutinePreset[]; created: boolean } => {
  const {
    currentRoutines,
    newPresetName,
    newPresetDescription,
    selectedRoutines,
    alertFn = window.alert,
  } = params;

  if (!canCreatePreset(newPresetName, selectedRoutines)) {
    alertFn(PRESET_MANAGER_MESSAGES.alertMissingFields);
    return { presets: loadPresetList(), created: false };
  }

  const routinesToSave = getSelectedRoutinesForPreset(
    currentRoutines,
    selectedRoutines,
  );
  const preset = createPresetFromRoutines(
    newPresetName,
    routinesToSave,
    newPresetDescription || undefined,
  );

  addPreset(preset);
  return { presets: loadPresetList(), created: true };
};

export const deletePresetAndReload = (
  presetId: string,
  confirmFn: (message?: string) => boolean = window.confirm,
): { presets: RoutinePreset[]; deleted: boolean } => {
  if (!confirmFn(PRESET_MANAGER_MESSAGES.confirmDeletePreset)) {
    return { presets: loadPresetList(), deleted: false };
  }

  deletePreset(presetId);
  return { presets: loadPresetList(), deleted: true };
};

export const duplicatePresetAndReload = (
  presets: RoutinePreset[],
  presetId: string,
): { presets: RoutinePreset[]; duplicated: boolean } => {
  const preset = findPresetById(presets, presetId);
  if (!preset) {
    return { presets: loadPresetList(), duplicated: false };
  }

  addPreset(duplicatePreset(preset));
  return { presets: loadPresetList(), duplicated: true };
};
