import { parseNonNegativeAmount } from "./budgetPageStateHelpers";
import { isExpenseAmountAllowedOnDate } from "./utils/expenseAmountRule";

export type ExpensePayload = {
  amount: number;
  date: string;
  categoryId?: string;
};

/**
 * 支出の入力値から保存用の payload を作る。入力が不正なら null。
 * 金額と日付の組み合わせは isExpenseAmountAllowedOnDate で確認する
 * （0 円は今日より前の日付だけ。今日と未来の日付は null）。
 */
export const buildExpensePayload = (params: {
  expenseAmount: string;
  expenseDate: string;
  expenseCategoryId: string;
  now?: Date;
}): ExpensePayload | null => {
  const {
    expenseAmount,
    expenseDate,
    expenseCategoryId,
    now = new Date(),
  } = params;
  const amount = parseNonNegativeAmount(expenseAmount);

  if (amount === null || !expenseDate) {
    return null;
  }
  if (!isExpenseAmountAllowedOnDate(amount, expenseDate, now)) {
    return null;
  }

  return {
    amount,
    date: expenseDate,
    categoryId: expenseCategoryId || undefined,
  };
};
