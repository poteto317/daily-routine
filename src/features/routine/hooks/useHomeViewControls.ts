import { createHomeViewControlsResult } from "./homeViewControlsResult";
import { useHomeViewControlActions } from "./useHomeViewControlActions";
import { useHomeViewControlState } from "./useHomeViewControlState";

type UseHomeViewControlsParams = {
  canUseWindow: boolean;
  currentDayOfWeek: number;
  getIsTodayHoliday: () => boolean;
};

export const useHomeViewControls = ({
  canUseWindow,
  currentDayOfWeek,
  getIsTodayHoliday,
}: UseHomeViewControlsParams) => {
  const {
    filterCategory,
    isEditMode,
    setFilterCategory,
    setIsEditMode,
    setViewMode,
    viewMode,
  } = useHomeViewControlState({
    canUseWindow,
    currentDayOfWeek,
    getIsTodayHoliday,
  });
  const { setFilterCategoryAction, setViewModeAction, toggleEditModeAction } =
    useHomeViewControlActions({
      isEditMode,
      setFilterCategory,
      setIsEditMode,
      setViewMode,
    });

  return createHomeViewControlsResult({
    filterCategory,
    isEditMode,
    setFilterCategoryAction,
    setViewModeAction,
    toggleEditModeAction,
    viewMode,
  });
};
