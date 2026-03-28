import type { RoutineCategory } from "@/types/routine";
import type { HomeViewMode } from "../pages/homeTypes";

type HomeViewControlsResultArgs = {
  filterCategory: RoutineCategory | "all";
  isEditMode: boolean;
  setFilterCategoryAction: (category: RoutineCategory | "all") => void;
  setViewModeAction: (mode: HomeViewMode) => void;
  toggleEditModeAction: () => boolean;
  viewMode: HomeViewMode;
};

export const createHomeViewControlsResult = ({
  filterCategory,
  isEditMode,
  setFilterCategoryAction,
  setViewModeAction,
  toggleEditModeAction,
  viewMode,
}: HomeViewControlsResultArgs) => {
  return {
    filterCategory,
    isEditMode,
    setFilterCategoryAction,
    setViewModeAction,
    toggleEditModeAction,
    viewMode,
  };
};
