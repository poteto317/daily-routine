import type { DailyHistory } from "@/types/routine";
import { calculateRate } from "./helpers";
import type { CategoryStats, HistoryMap } from "./types";

export type CategoryStatsAccumulator = Record<
  string,
  { completed: number; total: number }
>;

export const createCategoryStatsAccumulator = (): CategoryStatsAccumulator => {
  return {};
};

export const accumulateCategoryHistory = (
  accumulator: CategoryStatsAccumulator,
  history: DailyHistory,
): CategoryStatsAccumulator => {
  const completedIds = new Set(history.completedRoutineIds);

  history.routineSnapshots.forEach((routine) => {
    const currentStats = accumulator[routine.category] ?? {
      completed: 0,
      total: 0,
    };

    accumulator[routine.category] = {
      completed:
        currentStats.completed + (completedIds.has(routine.id) ? 1 : 0),
      total: currentStats.total + 1,
    };
  });

  return accumulator;
};

export const aggregateCategoryHistory = (
  monthHistory: HistoryMap,
): CategoryStatsAccumulator => {
  return Object.values(monthHistory).reduce(
    (accumulator, history) => accumulateCategoryHistory(accumulator, history),
    createCategoryStatsAccumulator(),
  );
};

export const buildCategoryStats = (
  accumulator: CategoryStatsAccumulator,
): CategoryStats[] => {
  return Object.entries(accumulator).map(([category, stats]) => ({
    category,
    completed: stats.completed,
    total: stats.total,
    achievementRate: calculateRate(stats.completed, stats.total),
  }));
};
