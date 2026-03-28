import type { Dispatch, SetStateAction } from "react";
import type { RoutineCategory } from "@/types/routine";
import type { HomeDayOption, HomeViewMode } from "../pages/homeTypes";

type SetFilterCategory = Dispatch<SetStateAction<RoutineCategory | "all">>;
type SetViewMode = Dispatch<SetStateAction<HomeViewMode>>;
type SetIsEditMode = Dispatch<SetStateAction<boolean>>;

export const createHomeCurrentDateLabel = (
  canUseWindow: boolean,
  now: Date = new Date(),
): string => {
  if (!canUseWindow) {
    return "";
  }

  return now.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
};

export const createInitialIsTodayHoliday = (
  canUseWindow: boolean,
  getIsTodayHoliday: () => boolean,
): boolean => {
  if (!canUseWindow) {
    return false;
  }

  return getIsTodayHoliday();
};

export const createInitialHomeViewMode = (
  canUseWindow: boolean,
  getIsTodayHoliday: () => boolean,
  currentDayOfWeek: number,
): HomeViewMode => {
  if (!canUseWindow) {
    return currentDayOfWeek;
  }

  return getIsTodayHoliday() ? "holiday" : currentDayOfWeek;
};

export const createSortedDaysAndHoliday = (params: {
  currentDayOfWeek: number;
  isTodayHoliday: boolean;
  days: HomeDayOption[];
}): (HomeDayOption | "holiday")[] => {
  const { currentDayOfWeek, isTodayHoliday, days } = params;
  const reorderedDays = [
    ...days.slice(currentDayOfWeek),
    ...days.slice(0, currentDayOfWeek),
  ];

  return isTodayHoliday
    ? ["holiday", ...reorderedDays]
    : [...reorderedDays, "holiday"];
};

export const toggleHomeEditModeState = (params: {
  isEditMode: boolean;
  setIsEditMode: SetIsEditMode;
  saveIsEditMode: (isEditMode: boolean) => void;
}): boolean => {
  const { isEditMode, setIsEditMode, saveIsEditMode } = params;
  const nextMode = !isEditMode;

  setIsEditMode(nextMode);
  saveIsEditMode(nextMode);

  return nextMode;
};

export const setHomeFilterCategoryState = (params: {
  category: RoutineCategory | "all";
  setFilterCategory: SetFilterCategory;
  saveFilterCategory: (category: RoutineCategory | "all") => void;
}): void => {
  const { category, setFilterCategory, saveFilterCategory } = params;

  setFilterCategory(category);
  saveFilterCategory(category);
};

export const setHomeViewModeState = (params: {
  mode: HomeViewMode;
  setViewMode: SetViewMode;
  saveViewMode: (mode: HomeViewMode) => void;
}): void => {
  const { mode, setViewMode, saveViewMode } = params;

  setViewMode(mode);
  saveViewMode(mode);
};
