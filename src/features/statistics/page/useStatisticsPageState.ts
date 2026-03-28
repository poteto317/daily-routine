import { createStatisticsPageStateResult } from "./statisticsPageResult";
import { useStatisticsComputedStats } from "./useStatisticsComputedStats";
import { useStatisticsPeriodState } from "./useStatisticsPeriodState";

export const useStatisticsPageState = () => {
  const periodState = useStatisticsPeriodState();
  const computedStats = useStatisticsComputedStats({
    currentDate: periodState.currentDate,
    month: periodState.month,
    year: periodState.year,
  });

  return createStatisticsPageStateResult({
    viewMode: periodState.viewMode,
    setViewMode: periodState.setViewMode,
    year: periodState.year,
    month: periodState.month,
    weeklyStats: computedStats.weeklyStats,
    monthlyStats: computedStats.monthlyStats,
    categoryStats: computedStats.categoryStats,
    goToPreviousPeriod: periodState.goToPreviousPeriod,
    goToNextPeriod: periodState.goToNextPeriod,
    goToToday: periodState.goToToday,
  });
};
