import type { Expense } from "@/types/routine";
import { formatTimeOfDay } from "./utils/date";

const DEFAULT_FALLBACK_TIME = "00:00";

/**
 * 支出の追加時刻（usedTime、"HH:mm"）を解決する。`usedTime`が未設定または空文字列
 * （`usedTime`を持たない古い既存データや、以前の編集画面で時刻の入力を
 * クリアして空になったデータ）は、記録時刻（createdAt）の時刻部分に
 * フォールバックする。`createdAt`も不正な日時文字列の場合は`"00:00"`へ
 * フォールバックし、`"NaN:NaN"`による並び替え破綻を防ぐ。
 * `usedTime`は追加時に記録され、現在の編集画面からは変更しない。
 * `??` ではなく `||` を使うのは、空文字列（未入力）も「未設定」として
 * 扱うため（`??` は `null`/`undefined` にしか反応せず、空文字列を
 * そのまま返してしまうと不正な日時文字列になり並び替えが壊れる）。
 */
export const resolveExpenseUsedTime = (expense: Expense): string => {
  if (expense.usedTime) {
    return expense.usedTime;
  }
  const createdDate = new Date(expense.createdAt);
  if (Number.isNaN(createdDate.getTime())) {
    return DEFAULT_FALLBACK_TIME;
  }
  return formatTimeOfDay(createdDate);
};

/**
 * 支出一覧を日付（`date`）降順・時間降順で並べる。
 * 優先順位（すべて新しい順＝降順）:
 * 1. `date`（"YYYY-MM-DD"）と追加時刻（`resolveExpenseUsedTime`、"HH:mm"）
 * 2. 同じ分（`HH:mm`）に追加された支出同士は、記録日時（`createdAt`）のミリ秒値
 * 3. `createdAt`がともにパース不能な場合は、`createdAt`文字列の辞書順
 * 4. それでも同じ場合は、配列の格納位置（`index`、後から`push`された方が後）
 *
 * ソートキーは比較のたびに再計算せず、各要素について1回だけ算出する
 * （decorate-sort-undecorate）。
 */
export const sortExpensesByDateDesc = (expenses: Expense[]): Expense[] =>
  expenses
    .map((expense, index) => {
      const parsedCreatedAt = Date.parse(expense.createdAt);
      return {
        expense,
        primaryKey: `${expense.date}T${resolveExpenseUsedTime(expense)}`,
        createdAtMs: Number.isFinite(parsedCreatedAt)
          ? parsedCreatedAt
          : -Infinity,
        createdAtRaw: expense.createdAt ?? "",
        index,
      };
    })
    .sort((a, b) => {
      if (a.primaryKey !== b.primaryKey) {
        return a.primaryKey < b.primaryKey ? 1 : -1;
      }
      if (a.createdAtMs !== b.createdAtMs) {
        return b.createdAtMs - a.createdAtMs;
      }
      if (a.createdAtRaw !== b.createdAtRaw) {
        return a.createdAtRaw < b.createdAtRaw ? 1 : -1;
      }
      return b.index - a.index;
    })
    .map(({ expense }) => expense);
