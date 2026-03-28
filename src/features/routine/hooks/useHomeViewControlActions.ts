import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { RoutineCategory } from "@/types/routine";
import type { HomeViewMode } from "../pages/homeTypes";
import {
  createSetHomeFilterCategoryAction,
  createSetHomeViewModeAction,
  createToggleHomeEditModeAction,
} from "./homeViewStateHookActions";

type SetFilterCategory = Dispatch<SetStateAction<RoutineCategory | "all">>;
type SetViewMode = Dispatch<SetStateAction<HomeViewMode>>;
type SetIsEditMode = Dispatch<SetStateAction<boolean>>;

type UseHomeViewControlActionsParams = {
  isEditMode: boolean;
  setFilterCategory: SetFilterCategory;
  setIsEditMode: SetIsEditMode;
  setViewMode: SetViewMode;
};

export const useHomeViewControlActions = ({
  isEditMode,
  setFilterCategory,
  setIsEditMode,
  setViewMode,
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
      createSetHomeViewModeAction({ setViewMode })(mode);
    },
    [setViewMode],
  );

  return {
    setFilterCategoryAction,
    setViewModeAction,
    toggleEditModeAction,
  };
};
