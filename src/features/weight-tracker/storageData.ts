import { type WeightHistory } from "@/types/routine";
import { getStorageItem, setStorageItem } from "@/lib/storage/core";

export const STORAGE_KEY_WEIGHT = "weight-history";

const DEFAULT_WEIGHT_HISTORY: WeightHistory = {};

export const getWeightHistory = (): WeightHistory => {
  return getStorageItem<WeightHistory>(
    STORAGE_KEY_WEIGHT,
    DEFAULT_WEIGHT_HISTORY,
  );
};

export const saveWeightHistory = (history: WeightHistory): void => {
  setStorageItem(STORAGE_KEY_WEIGHT, history);
};
