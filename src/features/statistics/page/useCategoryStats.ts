import { useMemo } from "react";
import { calculateCategoryStats } from "../statistics";

export const useCategoryStats = (year: number, month: number) => {
  return useMemo(() => calculateCategoryStats(year, month), [year, month]);
};
