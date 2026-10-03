import type { Expense } from "@/types/routine";
import { formatTimeOfDay } from "./utils/date";

/**
 * 支出の追加時刻（usedTime、"HH:mm"）を解決する。`usedTime`が未設定または空文字列
 * （`usedTime`を持たない古い既存データや、以前の編集画面で時刻の入力を
 * クリアして空になったデータ）は、記録時刻（createdAt）の時刻部分に
 * フォールバックする。`usedTime`は追加時に記録され、現在の編集画面からは
 * 変更しない。
 * `??` ではなく `||` を使うのは、空文字列（未入力）も「未設定」として
 * 扱うため（`??` は `null`/`undefined` にしか反応せず、空文字列を
 * そのまま返してしまうと不正な日時文字列になり並び替えが壊れる）。
 */
export const resolveExpenseUsedTime = (expense: Expense): string =>
  expense.usedTime || formatTimeOfDay(new Date(expense.createdAt));

/**
 * 支出一覧を日付（`date`）降順で並べる。同じ`date`の支出同士は
 * 追加時刻（resolveExpenseUsedTimeで解決）が新しい順に並べる。
 * ソートキーは比較のたびに再計算せず、各要素について1回だけ算出する
 * （decorate-sort-undecorate）。`date`（"YYYY-MM-DD"）と追加時刻
 * （"HH:mm"）はどちらも固定長でゼロ埋めされているため、Dateへの変換は
 * 不要で文字列比較だけで時系列順になる。
 */
export const sortExpensesByDateDesc = (expenses: Expense[]): Expense[] =>
  expenses
    .map((expense) => ({
      expense,
      sortKey: `${expense.date}T${resolveExpenseUsedTime(expense)}`,
    }))
    .sort((a, b) =>
      a.sortKey < b.sortKey ? 1 : a.sortKey > b.sortKey ? -1 : 0,
    )
    .map(({ expense }) => expense);
