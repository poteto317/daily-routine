import { RoutinePreset } from "@/types/routine";
import { getPresets, savePresets } from "./storageData";

export const addPreset = (preset: RoutinePreset): void => {
  const presets = getPresets();
  presets.push(preset);
  savePresets(presets);
};

export const updatePreset = (updatedPreset: RoutinePreset): void => {
  const presets = getPresets();
  const index = presets.findIndex((preset) => preset.id === updatedPreset.id);
  if (index === -1) return;

  presets[index] = {
    ...updatedPreset,
    updatedAt: new Date().toISOString(),
  };
  savePresets(presets);
};

export const deletePreset = (presetId: string): void => {
  const presets = getPresets();
  const filteredPresets = presets.filter((preset) => preset.id !== presetId);
  savePresets(filteredPresets);
};
