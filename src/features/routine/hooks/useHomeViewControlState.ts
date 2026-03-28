import { useHomeViewControlInitialState } from "./useHomeViewControlInitialState";
import { useHomeViewControlRuntimeState } from "./useHomeViewControlRuntimeState";

type UseHomeViewControlStateParams = {
  canUseWindow: boolean;
  currentDayOfWeek: number;
  getIsTodayHoliday: () => boolean;
};

export const useHomeViewControlState = ({
  canUseWindow,
  currentDayOfWeek,
  getIsTodayHoliday,
}: UseHomeViewControlStateParams) => {
  const initialState = useHomeViewControlInitialState({
    canUseWindow,
    currentDayOfWeek,
    getIsTodayHoliday,
  });

  return useHomeViewControlRuntimeState(initialState);
};
