import type { Dispatch, SetStateAction } from "react";
import type { DailyHistory } from "@/types/routine";
import {
  createAchievementCalendarMonthNavigation,
  createAchievementCalendarTodayNavigation,
} from "./achievementCalendarStateActions";

type CalendarStateSetters = {
  setCurrentDate: Dispatch<SetStateAction<Date>>;
  setSelectedDate: Dispatch<SetStateAction<string | null>>;
  setSelectedHistory: Dispatch<SetStateAction<DailyHistory | null>>;
};

const applyCalendarNavigation = (
  state: {
    currentDate: Date;
    selectedDate: string | null;
    selectedHistory: DailyHistory | null;
  },
  setters: CalendarStateSetters,
): void => {
  setters.setCurrentDate(state.currentDate);
  setters.setSelectedDate(state.selectedDate);
  setters.setSelectedHistory(state.selectedHistory);
};

export const createAchievementCalendarMonthHandler = (args: {
  year: number;
  month: number;
  monthOffset: number;
  setters: CalendarStateSetters;
}) => {
  const { year, month, monthOffset, setters } = args;

  return () => {
    applyCalendarNavigation(
      createAchievementCalendarMonthNavigation(year, month, monthOffset),
      setters,
    );
  };
};

export const createAchievementCalendarTodayHandler = (args: {
  setters: CalendarStateSetters;
  createTodayNavigation?: () => {
    currentDate: Date;
    selectedDate: string | null;
    selectedHistory: DailyHistory | null;
  };
}) => {
  const {
    setters,
    createTodayNavigation = () => createAchievementCalendarTodayNavigation(),
  } = args;

  return () => {
    applyCalendarNavigation(createTodayNavigation(), setters);
  };
};
