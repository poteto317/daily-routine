import type { Dispatch, SetStateAction } from "react";
import type { ViewMode } from "./types";

export const createStatisticsPageStateResult = <
  TWeekly,
  TMonthly,
  TCategory,
  TWeeklyGoals,
>(params: {
  viewMode: ViewMode;
  setViewMode: Dispatch<SetStateAction<ViewMode>>;
  year: number;
  month: number;
  weeklyStats: TWeekly;
  monthlyStats: TMonthly;
  categoryStats: TCategory;
  weeklyGoalProgress: TWeeklyGoals;
  goToPreviousPeriod: () => Date;
  goToNextPeriod: () => Date;
  goToToday: () => Date;
}) => {
  return params;
};
