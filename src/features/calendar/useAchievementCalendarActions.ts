import type { Dispatch, SetStateAction } from "react";
import type { DailyHistory } from "@/types/routine";
import {
  createAchievementCalendarMonthHandler,
  createAchievementCalendarTodayHandler,
} from "./calendarNavigationActions";
import { createAchievementCalendarDateClickHandler } from "./calendarSelectionActions";

type UseAchievementCalendarActionsParams = {
  year: number;
  month: number;
  getDailyHistory: (dateStr: string) => DailyHistory | null;
  setCurrentDate: Dispatch<SetStateAction<Date>>;
  setSelectedDate: Dispatch<SetStateAction<string | null>>;
  setSelectedHistory: Dispatch<SetStateAction<DailyHistory | null>>;
};

export const useAchievementCalendarActions = ({
  year,
  month,
  getDailyHistory,
  setCurrentDate,
  setSelectedDate,
  setSelectedHistory,
}: UseAchievementCalendarActionsParams) => {
  return {
    goToNextMonth: createAchievementCalendarMonthHandler({
      year,
      month,
      monthOffset: 1,
      setters: { setCurrentDate, setSelectedDate, setSelectedHistory },
    }),
    goToPreviousMonth: createAchievementCalendarMonthHandler({
      year,
      month,
      monthOffset: -1,
      setters: { setCurrentDate, setSelectedDate, setSelectedHistory },
    }),
    goToToday: createAchievementCalendarTodayHandler({
      setters: { setCurrentDate, setSelectedDate, setSelectedHistory },
    }),
    handleDateClick: createAchievementCalendarDateClickHandler({
      getDailyHistory,
      setters: { setSelectedDate, setSelectedHistory },
    }),
  };
};
