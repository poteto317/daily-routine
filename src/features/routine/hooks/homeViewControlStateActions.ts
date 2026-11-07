import type { RoutineCategory } from "@/types/routine";
import {
  getStoredFilterCategory,
  getStoredIsEditMode,
} from "./homeViewPersistence";

type HomeViewControlInitialState = {
  filterCategory: RoutineCategory | "all";
  isEditMode: boolean;
};

export const createInitialHomeViewControlState =
  (): HomeViewControlInitialState => {
    return {
      filterCategory: getStoredFilterCategory(),
      isEditMode: getStoredIsEditMode(),
    };
  };
