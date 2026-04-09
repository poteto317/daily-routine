import { getMonthlyHistory } from "@/features/routine/storage";
import { buildDailyStatsForDates, buildDateRange } from "./dailyAggregation";
import { type DailyStats } from "./types";

export const calculatePeriodStats = (
  startDate: string,
  endDate: string,
): DailyStats[] => {
  const allHistory = getMonthlyHistory();
  const start = new Date(startDate);
  const end = new Date(endDate);
  return buildDailyStatsForDates(buildDateRange(start, end), allHistory);
};
