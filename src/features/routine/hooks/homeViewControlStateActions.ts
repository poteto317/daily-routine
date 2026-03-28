import type { RoutineCategory } from "@/types/routine";
import type { HomeViewMode } from "../pages/homeTypes";
import {
  getStoredFilterCategory,
  getStoredIsEditMode,
} from "./homeViewPersistence";
import { createInitialHomeViewMode } from "./homeViewStateActions";

type CreateInitialHomeViewControlStateParams = {
  canUseWindow: boolean;
  currentDayOfWeek: number;
  getIsTodayHoliday: () => boolean;
};

type HomeViewControlInitialState = {
  filterCategory: RoutineCategory | "all";
  isEditMode: boolean;
  viewMode: HomeViewMode;
};

export const createInitialHomeViewControlState = ({
  canUseWindow,
  currentDayOfWeek,
  getIsTodayHoliday,
}: CreateInitialHomeViewControlStateParams): HomeViewControlInitialState => {
  return {
    filterCategory: getStoredFilterCategory(),
    isEditMode: getStoredIsEditMode(),
    viewMode: createInitialHomeViewMode(
      canUseWindow,
      getIsTodayHoliday,
      currentDayOfWeek,
    ),
  };
};
