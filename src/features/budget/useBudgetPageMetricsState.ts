import { useMemo } from "react";
import type { Expense } from "@/types/routine";
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
  return useMemo(
    () => calculateBudgetMetrics(currentDate, monthBudget, expenses),
    [currentDate, expenses, monthBudget],
  );
};
