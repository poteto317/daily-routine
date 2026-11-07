import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import { toJstDay } from "@/lib/storage/core";
import type { RoutineCategory } from "@/types/routine";
import type { HomeSelectedViewMode, HomeViewMode } from "../pages/homeTypes";
import { createDefaultHomeViewMode } from "./homeViewStateActions";
import {
  createSetHomeFilterCategoryAction,
  createSetHomeViewModeAction,
  createToggleHomeEditModeAction,
} from "./homeViewStateHookActions";

type SetFilterCategory = Dispatch<SetStateAction<RoutineCategory | "all">>;
type SetSelectedViewMode = Dispatch<SetStateAction<HomeSelectedViewMode>>;
type SetIsEditMode = Dispatch<SetStateAction<boolean>>;

type UseHomeViewControlActionsParams = {
  canUseWindow: boolean;
  getIsTodayHoliday: () => boolean;
  isEditMode: boolean;
  setFilterCategory: SetFilterCategory;
  setIsEditMode: SetIsEditMode;
  setSelectedViewMode: SetSelectedViewMode;
};

export const useHomeViewControlActions = ({
  canUseWindow,
  getIsTodayHoliday,
  isEditMode,
  setFilterCategory,
  setIsEditMode,
  setSelectedViewMode,
}: UseHomeViewControlActionsParams) => {
  const toggleEditModeAction = useCallback(() => {
    return createToggleHomeEditModeAction({
      isEditMode,
      setIsEditMode,
    })();
  }, [isEditMode, setIsEditMode]);

  const setFilterCategoryAction = useCallback(
    (category: RoutineCategory | "all") => {
      createSetHomeFilterCategoryAction({
        setFilterCategory,
      })(category);
    },
    [setFilterCategory],
  );

  const setViewModeAction = useCallback(
    (mode: HomeViewMode) => {
      createSetHomeViewModeAction({
        // 押した時点の既定のタブと比べる（描画時の今日を持たない。L-538）
        getDefaultViewMode: () =>
          createDefaultHomeViewMode(
            canUseWindow,
            getIsTodayHoliday(),
            toJstDay(new Date()),
          ),
        setSelectedViewMode,
      })(mode);
    },
    [canUseWindow, getIsTodayHoliday, setSelectedViewMode],
  );

  return {
    setFilterCategoryAction,
    setViewModeAction,
    toggleEditModeAction,
  };
};
