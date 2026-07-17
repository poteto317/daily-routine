import type { BudgetExpenseItem, BudgetIncomeItem } from "@/types/routine";

export type MonthlyAllowance = {
  totalIncome: number;
  totalFixed: number;
  totalVariable: number;
  totalExpenseItems: number;
  allowance: number;
};

/**
 * 収入項目・支出項目（固定費/変動費）から「月に使える金額」を計算する。
 * allowance = totalIncome - totalFixed - totalVariable
 */
export const calculateMonthlyAllowance = (
  incomeItems: BudgetIncomeItem[],
  expenseItems: BudgetExpenseItem[],
): MonthlyAllowance => {
  const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);
  let totalFixed = 0;
  let totalVariable = 0;
  for (const item of expenseItems) {
    if (item.kind === "fixed") {
      totalFixed += item.amount;
    } else {
      totalVariable += item.amount;
    }
  }
  const totalExpenseItems = totalFixed + totalVariable;

  return {
    totalIncome,
    totalFixed,
    totalVariable,
    totalExpenseItems,
    allowance: totalIncome - totalExpenseItems,
  };
};
