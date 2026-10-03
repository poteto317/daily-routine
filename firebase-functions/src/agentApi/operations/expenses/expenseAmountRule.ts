import { invalidField } from "../../validation/fieldError";
import { toJstDateKey } from "../jstTime";
import type { Expense } from "./expenseTypes";

/**
 * 0 円の支出は「支出が無かった日」の記録なので、今日（JST）より前の日付にだけ許可する。
 * 今日と未来の日付は、まだ支出が確定していないため認めない。
 * date は "YYYY-MM-DD" の固定長なので、文字列の比較で日付の前後を判定できる。
 */
export const assertZeroAmountOnPastDate = (
  expense: { date: string; amount: number },
  now: Date,
): void => {
  if (expense.amount !== 0) return;
  if (expense.date < toJstDateKey(now)) return;
  throw invalidField(
    "amount",
    "0 は、今日（JST）より前の日付にだけ指定できます",
  );
};

/**
 * 更新後の支出が 0 円のルールを満たすか確認する。
 * 金額か日付を変える更新のときだけ確認する（それ以外の更新で、既存のデータの更新を止めないため）。
 */
export const assertAmountRuleForPatch = (
  patch: Partial<Pick<Expense, "date" | "amount">>,
  updated: { date: string; amount: number },
  now: Date,
): void => {
  if (!("amount" in patch) && !("date" in patch)) return;
  assertZeroAmountOnPastDate(updated, now);
};
