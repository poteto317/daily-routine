import type { Routine, RoutinePreset } from "@/types/routine";
import {
  addPreset,
  createPresetFromRoutines,
  createRoutinesFromPreset,
  deletePreset,
  getPresets,
  updatePreset,
} from "@/features/preset/storage";
import {
  canApplyPreset,
  canCreatePreset,
  findPresetById,
  getSelectedRoutinesForPreset,
  toggleSetSelection,
} from "@/features/preset/presetStateHelpers";
import {
  PRESET_EDIT_ALERT_MISSING_NAME,
  PRESET_EDIT_SAVED_MESSAGE,
  PRESET_MANAGER_MESSAGES,
} from "./helpers";
import { buildUpdatedPreset } from "./presetTemplateBuilder";
import { resolveCreateFilterSelection } from "./presetCreateFilterSelection";
import { resolveEditSelectedRoutineIds } from "./presetEditSelectionResolver";

export const loadPresetList = (): RoutinePreset[] => {
  return getPresets();
};

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

export const applyPresetSelection = (params: {
  presets: RoutinePreset[];
  selectedPresetId: string | null;
  selectedDays: Set<number>;
  onApplyPreset: (
    routines: Omit<Routine, "id" | "sortOrder" | "createdAt" | "updatedAt">[],
    targetDays: number[],
  ) => void;
  alertFn?: (message?: string) => void;
}): { applied: boolean; presetName: string | null } => {
  const {
    presets,
    selectedPresetId,
    selectedDays,
    onApplyPreset,
    alertFn = window.alert,
  } = params;

  if (!canApplyPreset(selectedPresetId, selectedDays)) {
    alertFn(PRESET_MANAGER_MESSAGES.alertNoSelectionForApply);
    return { applied: false, presetName: null };
  }

  const preset = findPresetById(presets, selectedPresetId);
  if (!preset) {
    return { applied: false, presetName: null };
  }

  const days = Array.from(selectedDays);
  const routines = createRoutinesFromPreset(preset, days);
  onApplyPreset(routines, days);
  alertFn(PRESET_MANAGER_MESSAGES.alertPresetApplied(preset.name));

  return { applied: true, presetName: preset.name };
};

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
    // プリセットに含まれるルーティンを選択済みにして開く。
    // 未選択で開くと、1件チェックしただけで既存内容が全置換されてしまう。
    editSelectedRoutines: resolveEditSelectedRoutineIds(
      preset.routineTemplates,
      currentRoutines,
    ),
  };
};

export const cancelPresetEdit = () => {
  return {
    editingPresetId: null,
    editPresetName: "",
    editPresetDescription: "",
    editSelectedRoutines: new Set<string>(),
  };
};

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
  if (!preset) {
    return { presets, saved: false };
  }

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

export const togglePresetSelection = <T>(current: Set<T>, value: T): Set<T> => {
  return toggleSetSelection(current, value);
};

export { resolveCreateFilterSelection };
