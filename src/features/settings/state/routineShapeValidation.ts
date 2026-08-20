/**
 * 取り込むルーティンが、画面が素で参照する項目を持っているかを確かめる。
 *
 * これまでは配列かどうかしか見ていなかったため、`daysOfWeek` を持たない
 * 記録などがそのまま保存され、一覧を組み立てる箇所で例外になっていた。
 *
 * 型の全項目を必須にすると、古い書き出しファイルを弾いてしまう。ここでは
 * 「無いと画面が壊れるもの」だけに絞る。省略できる項目（説明や通知など）は
 * 見ない。
 */
const REQUIRED_STRING_FIELDS = ["id", "title", "startTime"] as const;

export const hasValidRoutineShape = (value: unknown): boolean => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const routine = value as Record<string, unknown>;

  const hasStrings = REQUIRED_STRING_FIELDS.every(
    (field) => typeof routine[field] === "string",
  );

  return hasStrings && Array.isArray(routine.daysOfWeek);
};
