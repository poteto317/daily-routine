import { useMemo } from "react";
import { getMonthStateSnapshot } from "./budgetPageStateHelpers";
import { createInitialBudgetViewState } from "./budgetViewStateActions";

export const useBudgetPageInitialState = () => {
  return useMemo(() => {
    const initialDate = new Date();
    const initialSnapshot = getMonthStateSnapshot(initialDate);

    return createInitialBudgetViewState(initialDate, initialSnapshot);
  }, []);
};
