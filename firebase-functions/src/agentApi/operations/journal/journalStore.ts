import { readObject } from "../dataAccess";
import type { SyncDocData } from "../../syncDoc";
import type { FoundEntry, JournalEntry, JournalHistory } from "./journalTypes";

/** 同期ドキュメントからジャーナル履歴を読み出す（未設定・型不正は空） */
export const readHistory = (data: SyncDocData): JournalHistory =>
  readObject(data, "journalHistory") as JournalHistory;

/** journalHistory を差し替える変更を作る */
export const toJournalChanges = (history: JournalHistory): SyncDocData => ({
  journalHistory: history,
});

/**
 * 全バケットを走査して ID が一致するエントリを返す。
 * エントリの date ではなく、実際に入っているバケットのキーを返す。
 */
export const findEntry = (
  history: JournalHistory,
  id: string | undefined,
): FoundEntry | null => {
  for (const [key, entries] of Object.entries(history)) {
    const entry = entries.find((candidate) => candidate.id === id);
    if (entry) return { key, entry };
  }
  return null;
};

/** 更新日時の新しい順に並べ替える（アプリの sortEntriesByLatest と同じ） */
export const sortByLatest = (entries: JournalEntry[]): JournalEntry[] =>
  [...entries].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  );

/** date 指定ならその日、省略時は全件を新しい順で返す */
export const listEntries = (
  history: JournalHistory,
  date: string | undefined,
): JournalEntry[] =>
  sortByLatest(date ? (history[date] ?? []) : Object.values(history).flat());

/** エントリの日付のバケット末尾に追加する */
export const addEntry = (
  history: JournalHistory,
  entry: JournalEntry,
): JournalHistory => ({
  ...history,
  [entry.date]: [...(history[entry.date] ?? []), entry],
});

/** 見つかったバケット内で、エントリを更新後の値に置き換える */
export const replaceEntry = (
  history: JournalHistory,
  key: string,
  updated: JournalEntry,
): JournalHistory => ({
  ...history,
  [key]: history[key].map((entry) =>
    entry.id === updated.id ? updated : entry,
  ),
});

/** エントリを取り除く。バケットが空になったらキーごと削除する */
export const removeEntry = (
  history: JournalHistory,
  key: string,
  id: string,
): JournalHistory => {
  const remaining = history[key].filter((entry) => entry.id !== id);
  const otherDays = Object.fromEntries(
    Object.entries(history).filter(([dayKey]) => dayKey !== key),
  );
  return remaining.length > 0 ? { ...otherDays, [key]: remaining } : otherDays;
};
