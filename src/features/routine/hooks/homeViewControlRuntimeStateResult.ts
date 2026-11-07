import type { RoutineCategory } from "@/types/routine";
import type { Dispatch, SetStateAction } from "react";
import type { HomeSelectedViewMode } from "../pages/homeTypes";

type HomeViewControlRuntimeStateResultArgs = {
  filterCategory: RoutineCategory | "all";
  isEditMode: boolean;
  selectedViewMode: HomeSelectedViewMode;
  setFilterCategory: Dispatch<SetStateAction<RoutineCategory | "all">>;
  setIsEditMode: Dispatch<SetStateAction<boolean>>;
  setSelectedViewMode: Dispatch<SetStateAction<HomeSelectedViewMode>>;
};

export const createHomeViewControlRuntimeStateResult = ({
  filterCategory,
  isEditMode,
  selectedViewMode,
  setFilterCategory,
  setIsEditMode,
  setSelectedViewMode,
}: HomeViewControlRuntimeStateResultArgs) => {
  return {
    filterCategory,
    isEditMode,
    selectedViewMode,
    setFilterCategory,
    setIsEditMode,
    setSelectedViewMode,
  };
};
