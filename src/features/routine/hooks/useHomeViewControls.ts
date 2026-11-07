import { createHomeViewControlsResult } from "./homeViewControlsResult";
import {
  createDefaultHomeViewMode,
  resolveHomeViewMode,
} from "./homeViewStateActions";
import { useHomeViewControlActions } from "./useHomeViewControlActions";
import { useHomeViewControlState } from "./useHomeViewControlState";

type UseHomeViewControlsParams = {
  canUseWindow: boolean;
  currentDayOfWeek: number;
  getIsTodayHoliday: () => boolean;
  isTodayHoliday: boolean;
};

export const useHomeViewControls = ({
  canUseWindow,
  currentDayOfWeek,
  getIsTodayHoliday,
  isTodayHoliday,
}: UseHomeViewControlsParams) => {
  const {
    filterCategory,
    isEditMode,
    selectedViewMode,
    setFilterCategory,
    setIsEditMode,
    setSelectedViewMode,
  } = useHomeViewControlState();
  const { setFilterCategoryAction, setViewModeAction, toggleEditModeAction } =
    useHomeViewControlActions({
      canUseWindow,
      getIsTodayHoliday,
      isEditMode,
      setFilterCategory,
      setIsEditMode,
      setSelectedViewMode,
    });
  // 表示するタブ: 選んでいなければ（mode が null）、描画時の今日の既定のタブ。
  // 祝日は、useHomeViewDateState が描画のたびに求めた真偽値を受け取って決める。
  // このフックでは getIsTodayHoliday を描画中に呼ばない（押した時点の比較にだけ使う）
  const viewMode = resolveHomeViewMode(
    selectedViewMode,
    createDefaultHomeViewMode(canUseWindow, isTodayHoliday, currentDayOfWeek),
  );

  return createHomeViewControlsResult({
    filterCategory,
    isEditMode,
    setFilterCategoryAction,
    setViewModeAction,
    toggleEditModeAction,
    viewMode,
  });
};
