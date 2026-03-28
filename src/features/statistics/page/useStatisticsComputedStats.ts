import { useCategoryStats } from "./useCategoryStats";
import { useMonthlyStats } from "./useMonthlyStats";
import { useWeeklyStats } from "./useWeeklyStats";

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

  return {
    weeklyStats,
    monthlyStats,
    categoryStats,
  };
};
