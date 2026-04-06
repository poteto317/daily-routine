import type { RoutinePreset } from "@/types/routine";
import { getStorageItem, setStorageItem } from "@/lib/storage/core";

const STORAGE_KEY = "routine-presets";

export const getPresets = (): RoutinePreset[] => {
  return getStorageItem<RoutinePreset[]>(STORAGE_KEY, []);
};

export const savePresets = (presets: RoutinePreset[]): void => {
  setStorageItem(STORAGE_KEY, presets);
};
