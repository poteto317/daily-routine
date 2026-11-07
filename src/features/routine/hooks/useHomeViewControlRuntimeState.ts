import { useState } from "react";
import type { RoutineCategory } from "@/types/routine";
import type { HomeSelectedViewMode } from "../pages/homeTypes";
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
  // 初期値は「今日に追従」。表示するタブは描画のたびに既定のタブから求める（useHomeViewControls）
  const [selectedViewMode, setSelectedViewMode] =
    useState<HomeSelectedViewMode>({ mode: null });
  const [isEditMode, setIsEditMode] = useState(initialState.isEditMode);

  return createHomeViewControlRuntimeStateResult({
    filterCategory,
    isEditMode,
    selectedViewMode,
    setFilterCategory,
    setIsEditMode,
    setSelectedViewMode,
  });
};
