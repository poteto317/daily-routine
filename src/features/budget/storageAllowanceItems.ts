import type { BudgetExpenseItem, BudgetIncomeItem } from "@/types/routine";
import { setLocalDataUpdatedAt, withSyncBatch } from "@/lib/storage/core";
import { saveBudgetExpenseItems } from "./storageExpenseItems";
import {
  getBudgetIncomeItems,
  saveBudgetIncomeItems,
} from "./storageIncomeItems";

/**
 * - `saved`: 収入も支出も置き換えた
 * - `failed`: どちらも元のまま
 * - `rollbackFailed`: 収入だけが新しい値のまま残った
 */
export type BudgetAllowanceSaveResult = "saved" | "failed" | "rollbackFailed";

const replaceAllowanceItems = (
  incomeItems: BudgetIncomeItem[],
  expenseItems: BudgetExpenseItem[],
  previousIncomeItems: BudgetIncomeItem[],
): BudgetAllowanceSaveResult => {
  // setItem の失敗では値は変わらないので、書き戻すのは先に保存した収入だけでよい
  if (!saveBudgetIncomeItems(incomeItems)) return "failed";
  if (saveBudgetExpenseItems(expenseItems)) return "saved";
  return saveBudgetIncomeItems(previousIncomeItems)
    ? "failed"
    : "rollbackFailed";
};

/**
 * 収入項目と支出項目を 1 回の操作として置き換える。
 *
 * 支出の保存に失敗したら収入を控えに書き戻し、収入と支出が混ざった状態を
 * 残さない。書き戻しもバッチの中で行う。外で行うと更新時刻が進み、内容が
 * 元のままなのにクラウド同期がローカルを新しいと判断してしまう。
 */
export const saveBudgetAllowanceItems = (
  incomeItems: BudgetIncomeItem[],
  expenseItems: BudgetExpenseItem[],
): BudgetAllowanceSaveResult => {
  const previousIncomeItems = getBudgetIncomeItems();
  let result = "failed" as BudgetAllowanceSaveResult;

  withSyncBatch(() => {
    result = replaceAllowanceItems(
      incomeItems,
      expenseItems,
      previousIncomeItems,
    );
  });

  // rollbackFailed でも進めない。進めると、収入と支出が混ざった状態を同期が
  // 新しいと判断してリモートの整った内容へ上書きしてしまう
  if (result === "saved") setLocalDataUpdatedAt(Date.now());
  return result;
};
