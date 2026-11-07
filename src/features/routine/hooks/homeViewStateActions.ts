import type { Dispatch, SetStateAction } from "react";
import type { RoutineCategory } from "@/types/routine";
import type {
  HomeDayOption,
  HomeSelectedViewMode,
  HomeViewMode,
} from "../pages/homeTypes";

type SetFilterCategory = Dispatch<SetStateAction<RoutineCategory | "all">>;
type SetSelectedViewMode = Dispatch<SetStateAction<HomeSelectedViewMode>>;
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

/** 今日が祝日か（window が無いときは false。祝日の判定関数を呼ばない） */
export const createIsTodayHoliday = (
  canUseWindow: boolean,
  getIsTodayHoliday: () => boolean,
): boolean => {
  if (!canUseWindow) {
    return false;
  }

  return getIsTodayHoliday();
};

/** 既定のタブ: 今日が祝日なら「祝日」、そうでなければ今日の曜日（window が無いときは今日の曜日） */
export const createDefaultHomeViewMode = (
  canUseWindow: boolean,
  isTodayHoliday: boolean,
  currentDayOfWeek: number,
): HomeViewMode => {
  if (!canUseWindow) {
    return currentDayOfWeek;
  }

  return isTodayHoliday ? "holiday" : currentDayOfWeek;
};

/** 表示するタブ: 利用者が選んだタブ。選んでいなければ（`mode` が `null`）既定のタブ */
export const resolveHomeViewMode = (
  selectedViewMode: HomeSelectedViewMode,
  defaultViewMode: HomeViewMode,
): HomeViewMode => {
  return selectedViewMode.mode ?? defaultViewMode;
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
  /** 押した時点の既定のタブ（描画時の値を渡さない。L-538） */
  defaultViewMode: HomeViewMode;
  setSelectedViewMode: SetSelectedViewMode;
  saveViewMode: (mode: HomeViewMode) => void;
}): void => {
  const { mode, defaultViewMode, setSelectedViewMode, saveViewMode } = params;

  // 押した時点の既定のタブと同じなら「今日に追従」（mode: null）に戻す。
  // 押すたびに新しいオブジェクトを入れる（mode が null のままでも再描画させるため）
  setSelectedViewMode({ mode: mode === defaultViewMode ? null : mode });
  saveViewMode(mode);
};
