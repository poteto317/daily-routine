import { isBeforeToday } from "./date";

/**
 * 支出の金額と日付の組み合わせが有効かどうか。
 * 0 より大きい金額は、どの日付でも有効。0 円は「支出が無かった日」の記録なので、
 * 今日より前の日付にだけ有効（今日と未来の日付は、まだ支出が確定していないため無効）。
 * 負の金額は無効。
 */
export const isExpenseAmountAllowedOnDate = (
  amount: number,
  date: string,
  now: Date,
): boolean => {
  if (amount > 0) return true;
  if (amount === 0) return isBeforeToday(date, now);
  return false;
};

/**
 * 入力中の金額（文字列）が、0 円で、今日以降の日付に指定されているかどうか。
 * 保存が拒否される組み合わせなので、入力欄の近くに理由を表示するために使う。
 */
export const isZeroAmountOnUnavailableDate = (
  amountText: string,
  date: string,
  now: Date,
): boolean => Number.parseFloat(amountText) === 0 && !isBeforeToday(date, now);
