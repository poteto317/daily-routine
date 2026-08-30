import type { RoutinePreset } from "@/types/routine";
import { deletePreset, getPresets } from "./storage";

export const deletePresetAndReload = (presetId: string): RoutinePreset[] => {
  deletePreset(presetId);
  return getPresets();
};
