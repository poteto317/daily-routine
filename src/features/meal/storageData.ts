import { MealHistory } from "@/types/routine";
import { getStorageItem, setStorageItem } from "@/lib/storage/core";

const STORAGE_KEY_MEAL = "meal-history";
const DEFAULT_MEAL_HISTORY: MealHistory = {};

export const getMealHistory = (): MealHistory => {
  return getStorageItem<MealHistory>(STORAGE_KEY_MEAL, DEFAULT_MEAL_HISTORY);
};

export const saveMealHistory = (history: MealHistory): void => {
  setStorageItem(STORAGE_KEY_MEAL, history);
};
