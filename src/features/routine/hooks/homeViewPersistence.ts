import { ROUTINE_CATEGORIES, type RoutineCategory } from "@/types/routine";
import type { HomeViewMode } from "../pages/homeTypes";

const FILTER_CATEGORY_STORAGE_KEY = "filterCategory";
const VIEW_MODE_STORAGE_KEY = "viewMode";
const EDIT_MODE_STORAGE_KEY = "isEditMode";

const ROUTINE_CATEGORY_VALUES = new Set(
  ROUTINE_CATEGORIES.map((category) => category.value),
);

const isRoutineCategory = (value: unknown): value is RoutineCategory => {
  return (
    typeof value === "string" &&
    ROUTINE_CATEGORY_VALUES.has(value as RoutineCategory)
  );
};

const canUseStorage = (): boolean => {
  return typeof window !== "undefined";
};

export const getStoredFilterCategory = (): RoutineCategory | "all" => {
  if (!canUseStorage()) {
    return "all";
  }

  const value = localStorage.getItem(FILTER_CATEGORY_STORAGE_KEY);
  if (value === "all") return "all";

  return isRoutineCategory(value) ? value : "all";
};

export const getStoredViewMode = (
  isTodayHoliday: boolean,
  currentDayOfWeek: number,
): HomeViewMode => {
  if (!canUseStorage()) return currentDayOfWeek;

  if (isTodayHoliday) return "holiday";

  const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
  if (saved === "holiday") return currentDayOfWeek;

  if (saved !== null) {
    const parsed = Number.parseInt(saved, 10);
    if (Number.isInteger(parsed) && parsed >= 0 && parsed <= 6) {
      return parsed;
    }
  }

  return currentDayOfWeek;
};

export const getStoredIsEditMode = (): boolean => {
  if (!canUseStorage()) {
    return true;
  }

  return localStorage.getItem(EDIT_MODE_STORAGE_KEY) !== "false";
};

export const saveFilterCategory = (category: RoutineCategory | "all"): void => {
  if (!canUseStorage()) {
    return;
  }

  localStorage.setItem(FILTER_CATEGORY_STORAGE_KEY, category);
};

export const saveViewMode = (mode: HomeViewMode): void => {
  if (!canUseStorage()) {
    return;
  }

  localStorage.setItem(VIEW_MODE_STORAGE_KEY, String(mode));
};

export const saveIsEditMode = (isEditMode: boolean): void => {
  if (!canUseStorage()) {
    return;
  }

  localStorage.setItem(EDIT_MODE_STORAGE_KEY, String(isEditMode));
};
