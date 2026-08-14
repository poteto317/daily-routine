import type { MealHistory, MealRecord } from "@/types/routine";
import { findShiftedDateKey } from "@/lib/dateKeyShift";
import { getMealHistory, saveMealHistory } from "./storageData";

/**
 * UTC 基準で保存されていた食事記録を、正しい JST 日付へ移す。
 *
 * 食事は 1 日に複数件を配列で持つため、記録ごとに移す。移し先に既に別の
 * 記録があっても上書きせず、その日の配列へ足す。移した結果 0 件になった
 * 日付はキーごと消す。
 *
 * @returns 移した件数
 */
export const migrateMealDateKeys = (): number => {
  const history = getMealHistory();
  const migrated: MealHistory = {};
  let movedCount = 0;

  /** 指定した日付の配列へ記録を足す */
  const append = (dateKey: string, record: MealRecord) => {
    migrated[dateKey] = [...(migrated[dateKey] ?? []), record];
  };

  for (const [dateKey, records] of Object.entries(history)) {
    for (const record of records ?? []) {
      const correctKey = findShiftedDateKey(dateKey, record?.createdAt);
      if (!correctKey) {
        append(dateKey, record);
        continue;
      }

      append(correctKey, { ...record, date: correctKey });
      movedCount += 1;
    }
  }

  // 移すものが無ければ保存し直さない。無駄な書き込みで更新時刻が進み、
  // 同期に不要な差分を作ってしまう。
  if (movedCount > 0) {
    saveMealHistory(migrated);
  }

  return movedCount;
};
