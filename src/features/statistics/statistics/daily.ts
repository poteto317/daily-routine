import { DailyHistory } from "@/types/routine";
import { calculateRate } from "./helpers";
import { DailyStats } from "./types";

export const calculateDailyStats = (
  date: string,
  history: DailyHistory | null,
): DailyStats => {
  if (!history || history.routineSnapshots.length === 0) {
    return {
      date,
      completedCount: 0,
      totalCount: 0,
      achievementRate: 0,
    };
  }

  const completedCount = history.completedRoutineIds.length;
  const totalCount = history.routineSnapshots.length;

  return {
    date,
    completedCount,
    totalCount,
    achievementRate: calculateRate(completedCount, totalCount),
  };
};
