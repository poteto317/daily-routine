import { useState } from "react";
import type { ViewMode } from "./types";
import {
  createStatisticsNextPeriodAction,
  createStatisticsPreviousPeriodAction,
  createStatisticsTodayAction,
} from "./statisticsPeriodActions";

export const useStatisticsPeriodState = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  return {
    currentDate,
    goToNextPeriod: createStatisticsNextPeriodAction({
      viewMode,
      currentDate,
      year,
      month,
      setCurrentDate,
    }),
    goToPreviousPeriod: createStatisticsPreviousPeriodAction({
      viewMode,
      currentDate,
      year,
      month,
      setCurrentDate,
    }),
    goToToday: createStatisticsTodayAction(setCurrentDate),
    month,
    setViewMode,
    viewMode,
    year,
  };
};
