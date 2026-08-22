import type { Routine, RoutinePreset } from "@/types/routine";
import { updatePreset } from "./storage";
import {
  findPresetById,
  getSelectedRoutinesForPreset,
} from "./presetStateHelpers";
import {
  PRESET_EDIT_ALERT_MISSING_NAME,
  PRESET_EDIT_SAVED_MESSAGE,
} from "./presetEditPresentation";
import { resolveEditSelectedRoutineIds } from "./presetEditSelectionResolver";
import { buildUpdatedPreset } from "./presetTemplateBuilder";
import { loadPresetList } from "./presetCrudStateActions";

export const startPresetEdit = (
  presets: RoutinePreset[],
  presetId: string,
  currentRoutines: Routine[],
): {
  editingPresetId: string | null;
  editPresetName: string;
  editPresetDescription: string;
  editSelectedRoutines: Set<string>;
} => {
  const preset = findPresetById(presets, presetId);
  if (!preset) {
    return {
      editingPresetId: null,
      editPresetName: "",
      editPresetDescription: "",
      editSelectedRoutines: new Set(),
    };
  }

  return {
    editingPresetId: presetId,
    editPresetName: preset.name,
    editPresetDescription: preset.description ?? "",
    editSelectedRoutines: resolveEditSelectedRoutineIds(
      preset.routineTemplates,
      currentRoutines,
    ),
  };
};

export const cancelPresetEdit = () => ({
  editingPresetId: null,
  editPresetName: "",
  editPresetDescription: "",
  editSelectedRoutines: new Set<string>(),
});

export const savePresetEditAndReload = (params: {
  presets: RoutinePreset[];
  editingPresetId: string | null;
  editPresetName: string;
  editPresetDescription: string;
  editSelectedRoutines: Set<string>;
  currentRoutines: Routine[];
  alertFn?: (message?: string) => void;
}): { presets: RoutinePreset[]; saved: boolean } => {
  const {
    presets,
    editingPresetId,
    editPresetName,
    editPresetDescription,
    editSelectedRoutines,
    currentRoutines,
    alertFn = window.alert,
  } = params;

  if (!editPresetName.trim()) {
    alertFn(PRESET_EDIT_ALERT_MISSING_NAME);
    return { presets, saved: false };
  }

  const preset = findPresetById(presets, editingPresetId);
  if (!preset) return { presets, saved: false };

  const routinesToSave = getSelectedRoutinesForPreset(
    currentRoutines,
    editSelectedRoutines,
  );
  updatePreset(
    buildUpdatedPreset({
      preset,
      name: editPresetName,
      description: editPresetDescription,
      routinesToSave,
      currentRoutines,
    }),
  );
  alertFn(PRESET_EDIT_SAVED_MESSAGE);

  return { presets: loadPresetList(), saved: true };
};
