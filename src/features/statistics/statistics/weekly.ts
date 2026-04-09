import { getMonthlyHistory } from "@/features/routine/storage";
import {
  buildDailyStatsForDates,
  buildDateRange,
  summarizeDailyStats,
} from "./dailyAggregation";
import { calculateRate, formatDate, getWeekEnd, getWeekStart } from "./helpers";
import { type DailyStats, type WeeklyStats } from "./types";

export const calculateWeeklyStats = (startDate: Date): WeeklyStats => {
  const weekStart = getWeekStart(startDate);
  const weekEnd = getWeekEnd(weekStart);
  const allHistory = getMonthlyHistory();
  const weekDates = buildDateRange(weekStart, weekEnd);
  const days: DailyStats[] = buildDailyStatsForDates(weekDates, allHistory);
  const totals = summarizeDailyStats(days);

  return {
    weekStart: formatDate(weekStart),
    weekEnd: formatDate(weekEnd),
    days,
    averageAchievementRate: calculateRate(
      totals.totalCompleted,
      totals.totalRoutines,
    ),
    totalCompleted: totals.totalCompleted,
    totalRoutines: totals.totalRoutines,
  };
};
