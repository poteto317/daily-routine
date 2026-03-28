import { getHistoryForMonth } from "@/features/routine/storage";
import { aggregateCategoryHistory, buildCategoryStats } from "./categoryAggregation";
import { CategoryStats } from "./types";

export const calculateCategoryStats = (
  year: number,
  month: number,
): CategoryStats[] => {
  const monthHistory = getHistoryForMonth(year, month);
  return buildCategoryStats(aggregateCategoryHistory(monthHistory));
};
