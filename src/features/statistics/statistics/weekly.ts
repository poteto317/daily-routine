import { getMonthlyHistory } from "@/features/routine/storage";
import {
  buildDailyStatsForDateKeys,
  summarizeDailyStats,
} from "./dailyAggregation";
import { calculateRate } from "./helpers";
import { type DailyStats, type WeeklyStats } from "./types";
import { addDaysToDateKey, getWeekStartKey } from "./weeklyGoalDateKeys";

const DAYS_IN_WEEK = 7;

export const calculateWeeklyStats = (startDate: Date): WeeklyStats => {
  // 週間目標と同じ JST の日付キー（月曜始まり）の上で週を求める。端末のタイムゾーンや
  // 日曜日の getDay() の違い（日曜日が 0）で、週がずれたり翌週になったりしないようにする
  const weekStartKey = getWeekStartKey(startDate);
  const weekDateKeys = Array.from({ length: DAYS_IN_WEEK }, (_, offset) =>
    addDaysToDateKey(weekStartKey, offset),
  );
  const allHistory = getMonthlyHistory();
  const days: DailyStats[] = buildDailyStatsForDateKeys(
    weekDateKeys,
    allHistory,
  );
  const totals = summarizeDailyStats(days);

  return {
    weekStart: weekStartKey,
    weekEnd: weekDateKeys[DAYS_IN_WEEK - 1]!,
    days,
    averageAchievementRate: calculateRate(
      totals.totalCompleted,
      totals.totalRoutines,
    ),
    totalCompleted: totals.totalCompleted,
    totalRoutines: totals.totalRoutines,
  };
};
