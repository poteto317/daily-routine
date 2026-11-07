import { getTodayString, toJstDay } from "@/lib/storage/core";

// React Compiler と「今日」:
// フックやコンポーネントの本体で今日を直接求めると、React Compiler の自動メモ化で
// 最初の描画の値に固定される（入力を持たない式とみなされる）。ここに集めたフックは
// 自動メモ化から外し（"use no memo"）、描画のたびに今日を取り直す。呼ぶ側は
// 戻り値（文字列・数値）を依存として扱うので、日をまたいだ後の再描画で新しい今日が届く。
// 対象の一覧と確認方法は src/__tests__/reactCompilerToday.contract.test.ts を参照。

/** JST の今日（YYYY-MM-DD）。体重・食事・カレンダーの基準 */
export const useJstTodayKey = (): string => {
  "use no memo";
  return getTodayString();
};

/** JST の今日の曜日（0 = 日曜）。ホームの曜日の並び順の基準 */
export const useJstDay = (): number => {
  "use no memo";
  return toJstDay(new Date());
};

/**
 * 端末ローカルの今日（YYYY-MM-DD）。家計簿の基準。
 * hooks は features を参照できないため、家計簿の toDateKey と同じ組み立てをここで行う。
 */
export const useLocalTodayKey = (): string => {
  "use no memo";
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};
