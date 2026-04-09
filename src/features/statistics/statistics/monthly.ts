import { getHistoryForMonth } from "@/features/routine/storage";
import { buildMonthlyDailyStats, buildMonthlyStats } from "./monthlyAggregation";
import { type MonthlyStats } from "./types";

export const calculateMonthlyStats = (
  year: number,
  month: number,
): MonthlyStats => {
  const monthHistory = getHistoryForMonth(year, month);
  const days = buildMonthlyDailyStats(year, month, monthHistory);
  return buildMonthlyStats(year, month, days);
};
