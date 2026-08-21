import { useCategoryStats } from "./useCategoryStats";
import { useMonthlyStats } from "./useMonthlyStats";
import { useWeeklyStats } from "./useWeeklyStats";
import { useWeeklyGoalProgress } from "./useWeeklyGoalProgress";

type UseStatisticsComputedStatsArgs = {
  currentDate: Date;
  month: number;
  year: number;
};

export const useStatisticsComputedStats = ({
  currentDate,
  month,
  year,
}: UseStatisticsComputedStatsArgs) => {
  const weeklyStats = useWeeklyStats(currentDate);
  const monthlyStats = useMonthlyStats(year, month);
  const categoryStats = useCategoryStats(year, month);
  const weeklyGoalProgress = useWeeklyGoalProgress(currentDate);

  return {
    weeklyStats,
    monthlyStats,
    categoryStats,
    weeklyGoalProgress,
  };
};
