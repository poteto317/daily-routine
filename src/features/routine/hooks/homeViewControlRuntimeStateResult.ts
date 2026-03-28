import type { RoutineCategory } from "@/types/routine";
import type { Dispatch, SetStateAction } from "react";
import type { HomeViewMode } from "../pages/homeTypes";

type HomeViewControlRuntimeStateResultArgs = {
  filterCategory: RoutineCategory | "all";
  isEditMode: boolean;
  setFilterCategory: Dispatch<SetStateAction<RoutineCategory | "all">>;
  setIsEditMode: Dispatch<SetStateAction<boolean>>;
  setViewMode: Dispatch<SetStateAction<HomeViewMode>>;
  viewMode: HomeViewMode;
};

export const createHomeViewControlRuntimeStateResult = ({
  filterCategory,
  isEditMode,
  setFilterCategory,
  setIsEditMode,
  setViewMode,
  viewMode,
}: HomeViewControlRuntimeStateResultArgs) => {
  return {
    filterCategory,
    isEditMode,
    setFilterCategory,
    setIsEditMode,
    setViewMode,
    viewMode,
  };
};
