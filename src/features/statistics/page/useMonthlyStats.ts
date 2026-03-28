import { useMemo } from "react";
import { calculateMonthlyStats } from "../statistics";

export const useMonthlyStats = (year: number, month: number) => {
  return useMemo(() => calculateMonthlyStats(year, month), [year, month]);
};
