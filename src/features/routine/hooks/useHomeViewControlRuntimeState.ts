import { useState } from "react";
import type { RoutineCategory } from "@/types/routine";
import type { HomeViewMode } from "../pages/homeTypes";
import type { createInitialHomeViewControlState } from "./homeViewControlStateActions";
import { createHomeViewControlRuntimeStateResult } from "./homeViewControlRuntimeStateResult";

type HomeViewControlInitialState = ReturnType<
  typeof createInitialHomeViewControlState
>;

export const useHomeViewControlRuntimeState = (
  initialState: HomeViewControlInitialState,
) => {
  const [filterCategory, setFilterCategory] = useState<RoutineCategory | "all">(
    initialState.filterCategory,
  );
  const [viewMode, setViewMode] = useState<HomeViewMode>(initialState.viewMode);
  const [isEditMode, setIsEditMode] = useState(initialState.isEditMode);

  return createHomeViewControlRuntimeStateResult({
    filterCategory,
    isEditMode,
    setFilterCategory,
    setIsEditMode,
    setViewMode,
    viewMode,
  });
};
