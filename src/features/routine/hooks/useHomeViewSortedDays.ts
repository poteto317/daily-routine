import { useMemo } from "react";
import { DAYS } from "../pages/DaySelector";
import { createSortedDaysAndHoliday } from "./homeViewStateActions";

type UseHomeViewSortedDaysParams = {
  currentDayOfWeek: number;
  isTodayHoliday: boolean;
};

export const useHomeViewSortedDays = ({
  currentDayOfWeek,
  isTodayHoliday,
}: UseHomeViewSortedDaysParams) => {
  return useMemo(() => {
    return createSortedDaysAndHoliday({
      currentDayOfWeek,
      isTodayHoliday,
      days: DAYS,
    });
  }, [currentDayOfWeek, isTodayHoliday]);
};
