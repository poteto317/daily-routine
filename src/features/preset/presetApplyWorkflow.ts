import type { Routine, RoutinePreset } from "@/types/routine";
import { createRoutinesFromPreset } from "./storage";
import { canApplyPreset } from "./presetApplySelectionValidation";
import { findPresetById } from "./presetLookup";

export type PresetApplyFailureReason =
  | "invalid-selection"
  | "preset-not-found"
  | "empty-preset";

export type PresetApplyResult =
  | { applied: true; presetName: string; failureReason: null }
  | {
      applied: false;
      presetName: null;
      failureReason: PresetApplyFailureReason;
    };

export const applyPresetSelection = (params: {
  presets: RoutinePreset[];
  selectedPresetId: string | null;
  selectedDays: Set<number>;
  onApplyPreset: (
    routines: Omit<Routine, "id" | "sortOrder" | "createdAt" | "updatedAt">[],
    targetDays: number[],
  ) => void;
}): PresetApplyResult => {
  const { presets, selectedPresetId, selectedDays, onApplyPreset } = params;

  if (!canApplyPreset(selectedPresetId, selectedDays)) {
    return {
      applied: false,
      presetName: null,
      failureReason: "invalid-selection",
    };
  }

  const preset = findPresetById(presets, selectedPresetId);
  if (!preset) {
    return {
      applied: false,
      presetName: null,
      failureReason: "preset-not-found",
    };
  }
  if (preset.routineTemplates.length === 0) {
    return { applied: false, presetName: null, failureReason: "empty-preset" };
  }

  const days = Array.from(selectedDays);
  onApplyPreset(createRoutinesFromPreset(preset, days), days);

  return { applied: true, presetName: preset.name, failureReason: null };
};
