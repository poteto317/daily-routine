import { useState } from "react";
import {
  createHomeCurrentDateLabel,
  createInitialIsTodayHoliday,
} from "./homeViewStateActions";

type UseHomeViewDateStateParams = {
  canUseWindow: boolean;
  getIsTodayHoliday: () => boolean;
};

export const useHomeViewDateState = ({
  canUseWindow,
  getIsTodayHoliday,
}: UseHomeViewDateStateParams) => {
  const [currentDate] = useState<string>(() => {
    return createHomeCurrentDateLabel(canUseWindow);
  });

  const [isTodayHoliday] = useState<boolean>(() => {
    return createInitialIsTodayHoliday(canUseWindow, getIsTodayHoliday);
  });

  return {
    currentDate,
    isTodayHoliday,
  };
};
