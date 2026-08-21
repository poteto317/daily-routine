import { useMemo } from "react";
import {
  getMonthlyHistory,
  getRoutines,
} from "@/features/routine/storage";
import { calculateWeeklyGoalProgress } from "../statistics";
import type { WeeklyGoalProgress } from "../statistics/types";

type UseWeeklyGoalProgressOptions = {
  now?: () => Date;
};

export const useWeeklyGoalProgress = (
  selectedDate: Date,
  options: UseWeeklyGoalProgressOptions = {},
): WeeklyGoalProgress[] => {
  const now = options.now;

  return useMemo(
    () =>
      calculateWeeklyGoalProgress({
        selectedDate,
        today: now ? now() : new Date(),
        routines: getRoutines(),
        history: getMonthlyHistory(),
      }),
    [selectedDate, now],
  );
};
