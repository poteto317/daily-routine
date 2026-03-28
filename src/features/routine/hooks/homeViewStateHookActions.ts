import type { Dispatch, SetStateAction } from "react";
import type { RoutineCategory } from "@/types/routine";
import type { HomeDayOption, HomeViewMode } from "../pages/homeTypes";
import {
  saveFilterCategory,
  saveIsEditMode,
  saveViewMode,
} from "./homeViewPersistence";
import {
  setHomeFilterCategoryState,
  setHomeViewModeState,
  toggleHomeEditModeState,
} from "./homeViewStateActions";

type SetFilterCategory = Dispatch<SetStateAction<RoutineCategory | "all">>;
type SetViewMode = Dispatch<SetStateAction<HomeViewMode>>;
type SetIsEditMode = Dispatch<SetStateAction<boolean>>;

export const createToggleHomeEditModeAction = (params: {
  isEditMode: boolean;
  setIsEditMode: SetIsEditMode;
}) => {
  const { isEditMode, setIsEditMode } = params;

  return () => {
    return toggleHomeEditModeState({
      isEditMode,
      setIsEditMode,
      saveIsEditMode,
    });
  };
};

export const createSetHomeFilterCategoryAction = (params: {
  setFilterCategory: SetFilterCategory;
}) => {
  const { setFilterCategory } = params;

  return (category: RoutineCategory | "all") => {
    setHomeFilterCategoryState({
      category,
      setFilterCategory,
      saveFilterCategory,
    });
  };
};

export const createSetHomeViewModeAction = (params: {
  setViewMode: SetViewMode;
}) => {
  const { setViewMode } = params;

  return (mode: HomeViewMode) => {
    setHomeViewModeState({
      mode,
      setViewMode,
      saveViewMode,
    });
  };
};

export const createHomeViewStateResult = (params: {
  currentDate: string;
  isTodayHoliday: boolean;
  filterCategory: RoutineCategory | "all";
  setFilterCategoryAction: (category: RoutineCategory | "all") => void;
  viewMode: HomeViewMode;
  setViewModeAction: (mode: HomeViewMode) => void;
  isEditMode: boolean;
  toggleEditModeAction: () => boolean;
  sortedDaysAndHoliday: (HomeDayOption | "holiday")[];
}) => {
  return params;
};
