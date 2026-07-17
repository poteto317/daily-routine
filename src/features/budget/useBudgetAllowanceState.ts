import { useEffect, useMemo, useState } from "react";
import type { BudgetExpenseItem, BudgetIncomeItem } from "@/types/routine";
import { getBudgetExpenseItems, getBudgetIncomeItems } from "./storage";
import { calculateMonthlyAllowance } from "./utils/monthlyAllowance";
import { LOCAL_DATA_UPDATED_AT_EVENT } from "@/lib/storage/core";

/**
 * 収入項目・支出項目（固定費/変動費）から「月に使える金額」の内訳を算出する。
 * 項目は月に紐付かないテンプレートのため、マウント時に読み込み、
 * クラウド同期・他タブでの更新（LOCAL_DATA_UPDATED_AT_EVENT）を検知して再読み込みする。
 */
export const useBudgetAllowanceState = () => {
  const [incomeItems, setIncomeItems] = useState<BudgetIncomeItem[]>(() =>
    getBudgetIncomeItems(),
  );
  const [expenseItems, setExpenseItems] = useState<BudgetExpenseItem[]>(() =>
    getBudgetExpenseItems(),
  );

  useEffect(() => {
    const handleLocalDataUpdated = () => {
      setIncomeItems(getBudgetIncomeItems());
      setExpenseItems(getBudgetExpenseItems());
    };

    window.addEventListener(
      LOCAL_DATA_UPDATED_AT_EVENT,
      handleLocalDataUpdated,
    );
    return () => {
      window.removeEventListener(
        LOCAL_DATA_UPDATED_AT_EVENT,
        handleLocalDataUpdated,
      );
    };
  }, []);

  const monthlyAllowance = useMemo(
    () => calculateMonthlyAllowance(incomeItems, expenseItems),
    [incomeItems, expenseItems],
  );

  return { monthlyAllowance };
};
