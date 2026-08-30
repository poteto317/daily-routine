import { type RoutinePreset } from "@/types/routine";
import { getPresets, savePresets } from "./storageData";

export const addPreset = (preset: RoutinePreset): boolean => {
  const presets = getPresets();
  presets.push(preset);
  return savePresets(presets);
};

export type UpdatePresetResult =
  | "updated"
  | "preset-not-found"
  | "preset-conflict"
  | "storage-failure";

export const updatePreset = (
  updatedPreset: RoutinePreset,
  expectedUpdatedAt: string,
): UpdatePresetResult => {
  const presets = getPresets();
  const index = presets.findIndex((preset) => preset.id === updatedPreset.id);
  if (index === -1) return "preset-not-found";
  if (presets[index].updatedAt !== expectedUpdatedAt) return "preset-conflict";

  presets[index] = {
    ...updatedPreset,
    updatedAt: new Date().toISOString(),
  };
  return savePresets(presets) ? "updated" : "storage-failure";
};

export const deletePreset = (presetId: string): void => {
  const presets = getPresets();
  const filteredPresets = presets.filter((preset) => preset.id !== presetId);
  savePresets(filteredPresets);
};
