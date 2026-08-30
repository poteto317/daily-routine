import type { RoutinePreset } from "@/types/routine";
import { getStorageItem, setStorageItem } from "@/lib/storage/core";
import { normalizeStoredPresets } from "./presetStorageNormalization";

const STORAGE_KEY = "routine-presets";

export const getPresets = (): RoutinePreset[] => {
  const storedValue = getStorageItem<unknown>(STORAGE_KEY, []);
  return normalizeStoredPresets(storedValue);
};

export const savePresets = (presets: RoutinePreset[]): boolean =>
  setStorageItem(STORAGE_KEY, presets);
