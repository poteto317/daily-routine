import { useState } from "react";
import { createInitialHomeViewControlState } from "./homeViewControlStateActions";

type UseHomeViewControlInitialStateParams = {
  canUseWindow: boolean;
  currentDayOfWeek: number;
  getIsTodayHoliday: () => boolean;
};

export const useHomeViewControlInitialState = ({
  canUseWindow,
  currentDayOfWeek,
  getIsTodayHoliday,
}: UseHomeViewControlInitialStateParams) => {
  const [initialState] = useState(() =>
    createInitialHomeViewControlState({
      canUseWindow,
      currentDayOfWeek,
      getIsTodayHoliday,
    }),
  );

  return initialState;
};
