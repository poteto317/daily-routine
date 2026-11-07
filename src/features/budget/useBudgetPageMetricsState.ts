import { useMemo } from "react";
import type { Expense } from "@/types/routine";
import { useLocalTodayKey } from "@/hooks/useToday";
import { calculateBudgetMetrics } from "./utils/metrics";

type UseBudgetPageMetricsStateParams = {
  currentDate: Date;
  monthBudget: number;
  expenses: Expense[];
};

export const useBudgetPageMetricsState = ({
  currentDate,
  monthBudget,
  expenses,
}: UseBudgetPageMetricsStateParams) => {
  const todayKey = useLocalTodayKey();

  return useMemo(
    () =>
      calculateBudgetMetrics(
        currentDate,
        monthBudget,
        expenses,
        new Date(`${todayKey}T00:00:00`),
      ),
    [currentDate, expenses, monthBudget, todayKey],
  );
};
