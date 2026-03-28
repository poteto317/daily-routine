import type { DailyHistory, PomodoroHistory } from "@/types/routine";
import { toMonthDate } from "./utils/calendarDate";

type AchievementCalendarSelection = {
  selectedDate: string | null;
  selectedHistory: DailyHistory | null;
};

type AchievementCalendarNavigationState = AchievementCalendarSelection & {
  currentDate: Date;
};

type AchievementCalendarData = {
  monthHistory: Record<string, DailyHistory>;
  pomodoroHistory: PomodoroHistory;
};

type BuildCalendarDataArgs = {
  year: number;
  month: number;
  getHistoryForMonth: (year: number, month: number) => Record<string, DailyHistory>;
  getPomodoroHistory: () => PomodoroHistory;
};

export const createEmptyAchievementCalendarSelection = ():
AchievementCalendarSelection => {
  return {
    selectedDate: null,
    selectedHistory: null,
  };
};

export const createAchievementCalendarMonthNavigation = (
  year: number,
  month: number,
  monthOffset: number,
): AchievementCalendarNavigationState => {
  return {
    currentDate: toMonthDate(year, month + monthOffset),
    ...createEmptyAchievementCalendarSelection(),
  };
};

export const createAchievementCalendarTodayNavigation = (
  today: Date = new Date(),
): AchievementCalendarNavigationState => {
  return {
    currentDate: today,
    ...createEmptyAchievementCalendarSelection(),
  };
};

export const selectAchievementCalendarDate = (
  dateStr: string,
  history: DailyHistory | null,
): AchievementCalendarSelection => {
  return {
    selectedDate: dateStr,
    selectedHistory: history,
  };
};

export const buildAchievementCalendarData = ({
  year,
  month,
  getHistoryForMonth,
  getPomodoroHistory,
}: BuildCalendarDataArgs): AchievementCalendarData => {
  return {
    monthHistory: getHistoryForMonth(year, month),
    pomodoroHistory: getPomodoroHistory(),
  };
};

export type {
  AchievementCalendarData,
  AchievementCalendarNavigationState,
  AchievementCalendarSelection,
};
