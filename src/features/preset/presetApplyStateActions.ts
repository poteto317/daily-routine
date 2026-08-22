import type { Routine, RoutinePreset } from "@/types/routine";
import { createRoutinesFromPreset } from "./storage";
import { canApplyPreset, findPresetById } from "./presetStateHelpers";
import { PRESET_MANAGER_MESSAGES } from "./presetManagerPresentation";

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
  if (!preset) return { applied: false, presetName: null };

  const days = Array.from(selectedDays);
  const routines = createRoutinesFromPreset(preset, days);
  onApplyPreset(routines, days);
  alertFn(PRESET_MANAGER_MESSAGES.alertPresetApplied(preset.name));

  return { applied: true, presetName: preset.name };
};
