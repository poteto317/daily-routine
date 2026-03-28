import type { Dispatch, SetStateAction } from "react";
import type { ViewMode } from "./types";

export const createStatisticsPageStateResult = <
  TWeekly,
  TMonthly,
  TCategory,
>(params: {
  viewMode: ViewMode;
  setViewMode: Dispatch<SetStateAction<ViewMode>>;
  year: number;
  month: number;
  weeklyStats: TWeekly;
  monthlyStats: TMonthly;
  categoryStats: TCategory;
  goToPreviousPeriod: () => Date;
  goToNextPeriod: () => Date;
  goToToday: () => Date;
}) => {
  return params;
};
