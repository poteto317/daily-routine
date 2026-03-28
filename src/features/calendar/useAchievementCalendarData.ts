import { useMemo } from "react";
import {
  getDailyHistory,
  getHistoryForMonth,
} from "@/features/routine/storage";
import { getPomodoroHistory } from "@/features/pomodoro/storage";
import { buildAchievementCalendarData } from "./achievementCalendarStateActions";

export const useAchievementCalendarData = (year: number, month: number) => {
  const { monthHistory, pomodoroHistory } = useMemo(
    () =>
      buildAchievementCalendarData({
        year,
        month,
        getHistoryForMonth,
        getPomodoroHistory,
      }),
    [year, month],
  );

  return {
    getDailyHistory,
    monthHistory,
    pomodoroHistory,
  };
};
