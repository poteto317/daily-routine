import { calculateDailyStats } from "./daily";
import { calculateRate, formatDate } from "./helpers";
import type { DailyStats, HistoryMap } from "./types";

export interface DailyStatsTotals {
  totalCompleted: number;
  totalRoutines: number;
  averageAchievementRate: number;
}

export const buildDateRange = (startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = [];

  for (
    let date = new Date(startDate);
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    dates.push(new Date(date));
  }

  return dates;
};

export const buildDailyStatsForDates = (
  dates: Date[],
  historyMap: HistoryMap,
): DailyStats[] => {
  return dates.map((date) => {
    const dateStr = formatDate(date);
    return calculateDailyStats(dateStr, historyMap[dateStr] ?? null);
  });
};

export const summarizeDailyStats = (days: DailyStats[]): DailyStatsTotals => {
  const totals = days.reduce(
    (acc, day) => ({
      completed: acc.completed + day.completedCount,
      routines: acc.routines + day.totalCount,
    }),
    { completed: 0, routines: 0 },
  );

  return {
    totalCompleted: totals.completed,
    totalRoutines: totals.routines,
    averageAchievementRate: calculateRate(totals.completed, totals.routines),
  };
};
