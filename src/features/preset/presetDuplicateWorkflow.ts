import type { RoutinePreset } from "@/types/routine";
import { addPreset, duplicatePreset, getPresets } from "./storage";
import { findPresetById } from "./presetLookup";

export type PresetDuplicateFailureReason =
  | "preset-not-found"
  | "storage-failure";

export const duplicatePresetAndReload = (
  presets: RoutinePreset[],
  presetId: string,
): {
  presets: RoutinePreset[];
  duplicated: boolean;
  failureReason: PresetDuplicateFailureReason | null;
} => {
  const preset = findPresetById(presets, presetId);
  if (!preset) {
    return {
      presets: getPresets(),
      duplicated: false,
      failureReason: "preset-not-found",
    };
  }

  if (!addPreset(duplicatePreset(preset))) {
    return {
      presets: getPresets(),
      duplicated: false,
      failureReason: "storage-failure",
    };
  }

  return { presets: getPresets(), duplicated: true, failureReason: null };
};
