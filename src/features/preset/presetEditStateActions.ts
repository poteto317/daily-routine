import type { RoutinePreset } from "@/types/routine";
import { findPresetById } from "./presetLookup";

export const startPresetEdit = (
  presets: RoutinePreset[],
  presetId: string,
): {
  editingPresetId: string | null;
  editingPresetUpdatedAt: string | null;
  editPresetName: string;
  editPresetDescription: string;
  editSourceDay: number | null;
} => {
  const preset = findPresetById(presets, presetId);
  if (!preset) {
    return {
      editingPresetId: null,
      editingPresetUpdatedAt: null,
      editPresetName: "",
      editPresetDescription: "",
      editSourceDay: null,
    };
  }

  return {
    editingPresetId: presetId,
    editingPresetUpdatedAt: preset.updatedAt,
    editPresetName: preset.name,
    editPresetDescription: preset.description ?? "",
    editSourceDay: null,
  };
};

export const cancelPresetEdit = () => ({
  editingPresetId: null,
  editingPresetUpdatedAt: null,
  editPresetName: "",
  editPresetDescription: "",
  editSourceDay: null,
});
