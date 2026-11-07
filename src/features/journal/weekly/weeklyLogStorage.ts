import { type WeeklyLogHistory } from "@/types/routine";
import { generateId, getStorageItem, setStorageItem } from "@/lib/storage/core";
import { normalizeWeeklyLogHistory } from "./weeklyLogHistoryData";

const STORAGE_KEY_WEEKLY_LOG = "weekly-log-history";

/** 業務日誌の履歴を読む。壊れた値は捨てる。毎回新しいオブジェクトを返す */
export const getWeeklyLogHistory = (): WeeklyLogHistory =>
  normalizeWeeklyLogHistory(
    getStorageItem<unknown>(STORAGE_KEY_WEEKLY_LOG, {}),
  );

/** 書き込みの成否を返す */
export const saveWeeklyLogHistory = (history: WeeklyLogHistory): boolean =>
  setStorageItem(STORAGE_KEY_WEEKLY_LOG, history);

/**
 * その週の日誌を保存する（1 週 1 件）。既にあれば本文と updatedAt だけを変え、
 * id と createdAt は据え置く。書き込みの成否を返す
 */
export const saveWeeklyLog = (
  weekStart: string,
  content: string,
  now: Date = new Date(),
): boolean => {
  const history = getWeeklyLogHistory();
  const timestamp = now.toISOString();
  const existing = history[weekStart];

  history[weekStart] = existing
    ? { ...existing, content, updatedAt: timestamp }
    : {
        id: generateId("weekly-log"),
        weekStart,
        content,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

  return saveWeeklyLogHistory(history);
};

/** その週の日誌を消す。無ければ書き込まずに true。書き込みの成否を返す */
export const deleteWeeklyLog = (weekStart: string): boolean => {
  const history = getWeeklyLogHistory();
  if (!Object.hasOwn(history, weekStart)) return true;

  delete history[weekStart];
  return saveWeeklyLogHistory(history);
};
