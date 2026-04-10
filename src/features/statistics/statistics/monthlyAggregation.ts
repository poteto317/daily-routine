import { calculateDailyStats } from "./daily";
import { summarizeDailyStats } from "./dailyAggregation";
import { buildDateString } from "./helpers";
import type { DailyStats, HistoryMap, MonthlyStats } from "./types";

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};

export const buildMonthlyDailyStats = (
  year: number,
  month: number,
  monthHistory: HistoryMap,
): DailyStats[] => {
  const daysInMonth = getDaysInMonth(year, month);

  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const dateStr = buildDateString(year, month, day);
    return calculateDailyStats(dateStr, monthHistory[dateStr] ?? null);
  });
};

export const accumulateMonthlyTotals = (
  days: DailyStats[],
): Pick<
  MonthlyStats,
  "totalCompleted" | "totalRoutines" | "averageAchievementRate"
> => {
  return {
    ...summarizeDailyStats(days),
  };
};

export const findMonthlyAchievementExtremes = (
  days: DailyStats[],
): Pick<MonthlyStats, "bestDay" | "worstDay"> => {
  return days.reduce<Pick<MonthlyStats, "bestDay" | "worstDay">>(
    (acc, day) => {
      if (day.totalCount === 0) return acc;

      return {
        bestDay:
          !acc.bestDay || day.achievementRate > acc.bestDay.achievementRate
            ? day
            : acc.bestDay,
        worstDay:
          !acc.worstDay || day.achievementRate < acc.worstDay.achievementRate
            ? day
            : acc.worstDay,
      };
    },
    { bestDay: null, worstDay: null },
  );
};

export const buildMonthlyStats = (
  year: number,
  month: number,
  days: DailyStats[],
): MonthlyStats => {
  const totals = accumulateMonthlyTotals(days);
  const extremes = findMonthlyAchievementExtremes(days);

  return {
    year,
    month,
    days,
    ...totals,
    ...extremes,
  };
};
