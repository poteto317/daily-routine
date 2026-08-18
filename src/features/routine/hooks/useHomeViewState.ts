import { toJstDay } from "@/lib/storage/core";
import { createHomeViewStateResult } from "./homeViewStateHookActions";
import { useHomeViewControls } from "./useHomeViewControls";
import { useHomeViewDateState } from "./useHomeViewDateState";
import { useHomeViewSortedDays } from "./useHomeViewSortedDays";

/** ホーム画面のビュー状態管理（日付・曜日・フィルター・編集モード） */
export const useHomeViewState = (getIsTodayHoliday: () => boolean) => {
  const canUseWindow = typeof window !== "undefined";
  const currentDayOfWeek = toJstDay(new Date());
  const { currentDate, isTodayHoliday } = useHomeViewDateState({
    canUseWindow,
    getIsTodayHoliday,
  });
  const controls = useHomeViewControls({
    canUseWindow,
    currentDayOfWeek,
    getIsTodayHoliday,
  });
  const sortedDaysAndHoliday = useHomeViewSortedDays({
    currentDayOfWeek,
    isTodayHoliday,
  });

  return createHomeViewStateResult({
    currentDate,
    isTodayHoliday,
    filterCategory: controls.filterCategory,
    setFilterCategoryAction: controls.setFilterCategoryAction,
    viewMode: controls.viewMode,
    setViewModeAction: controls.setViewModeAction,
    isEditMode: controls.isEditMode,
    toggleEditModeAction: controls.toggleEditModeAction,
    sortedDaysAndHoliday,
  });
};
