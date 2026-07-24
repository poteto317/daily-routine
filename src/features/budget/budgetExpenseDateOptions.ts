import {
  buildDateValue,
  daysInMonthByKey,
  shiftMonthToFirstDay,
  toMonthKey,
} from "./utils/date";
import { formatBudgetMonthLabel } from "./helpers";

export type BudgetDateSelectOption = { value: string; label: string };

/**
 * 支出の日付選択で選べる「月」の選択肢（前月・表示中の月・翌月の3件）を返す。
 * ラベルは formatBudgetMonthLabel を再利用するため、年をまたぐ場合も
 * 正しい年が表示される。
 */
export const buildAdjacentMonthOptions = (
  currentDate: Date,
): BudgetDateSelectOption[] =>
  [-1, 0, 1].map((offset) => {
    const date = shiftMonthToFirstDay(currentDate, offset);
    return { value: toMonthKey(date), label: formatBudgetMonthLabel(date) };
  });

/** 指定した月キー（"YYYY-MM"）の日数分の「日」選択肢を返す。 */
export const buildExpenseDayOptions = (
  monthKey: string,
): BudgetDateSelectOption[] =>
  Array.from({ length: daysInMonthByKey(monthKey) }, (_, index) => {
    const day = index + 1;
    return {
      value: buildDateValue(monthKey, day),
      label: `${day}日`,
    };
  });
