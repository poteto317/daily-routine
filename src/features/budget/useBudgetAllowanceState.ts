import { useMemo, useState } from "react";
import type { BudgetExpenseItem, BudgetIncomeItem } from "@/types/routine";
import { getBudgetExpenseItems, getBudgetIncomeItems } from "./storage";
import { calculateMonthlyAllowance } from "./utils/monthlyAllowance";

/**
 * 収入項目・支出項目（固定費/変動費）から「月に使える金額」の内訳を算出する。
 * 項目は月に紐付かないテンプレートのため、マウント時に一度だけ読み込む
 * （設定ページで編集した後はページ遷移で再マウントされ最新値になる）。
 */
export const useBudgetAllowanceState = () => {
  const [incomeItems] = useState<BudgetIncomeItem[]>(() =>
    getBudgetIncomeItems(),
  );
  const [expenseItems] = useState<BudgetExpenseItem[]>(() =>
    getBudgetExpenseItems(),
  );

  const monthlyAllowance = useMemo(
    () => calculateMonthlyAllowance(incomeItems, expenseItems),
    [incomeItems, expenseItems],
  );

  return { monthlyAllowance };
};
