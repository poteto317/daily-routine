import { useMemo } from "react";
import type { Expense } from "@/types/routine";
import { getMonthKeyFromDateValue, toDateKey, toMonthKey } from "./utils/date";
import { listMissingExpenseDates } from "./utils/missingExpenseDates";

type UseBudgetMissingExpenseDatesParams = {
  /** 表示中の月（useBudgetMonthState の currentDate） */
  currentDate: Date;
  /** 表示中の月の支出（useBudgetMonthState の expenses） */
  expenses: Expense[];
};

/**
 * 表示中の月が今月のときだけ、未入力の日（今月の 1 日〜昨日で支出の記録が無い日）を
 * 昇順の "YYYY-MM-DD" で返す。今月でなければ []。
 *
 * 今日は描画のたびに 1 回だけ取り直し、useMemo の依存に入れる。ページを開いたまま
 * 日付をまたいでも、次の再描画で結果が追いつく（今日を取り込んだ値を持ち続けない）。
 * 今月かどうかも同じ今日から判定する（メモ化された metrics.isCurrentMonth は使わない）。
 */
export const useBudgetMissingExpenseDates = ({
  currentDate,
  expenses,
}: UseBudgetMissingExpenseDatesParams): string[] => {
  // React Compiler の自動メモ化から外す。外さないと、引数の無い new Date() が初回の値で
  // 固定され（コンパイル後のコードで確認した）、日付をまたいでも古い今日のままになる。
  // メモ化は下の useMemo で、今日を依存に入れて明示する。
  "use no memo";
  const todayKey = toDateKey(new Date());
  const monthKey = toMonthKey(currentDate);

  // 今月でないときの [] も useMemo の中で返す（フックの呼び出しを条件付きにせず、
  // 再描画のたびに新しい配列を作らない）
  return useMemo(
    () =>
      monthKey === getMonthKeyFromDateValue(todayKey)
        ? listMissingExpenseDates(monthKey, expenses, todayKey)
        : [],
    [monthKey, expenses, todayKey],
  );
};
