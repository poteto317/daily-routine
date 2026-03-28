import { useMemo } from "react";
import { calculateWeeklyStats } from "../statistics";

export const useWeeklyStats = (currentDate: Date) => {
  return useMemo(() => calculateWeeklyStats(currentDate), [currentDate]);
};
