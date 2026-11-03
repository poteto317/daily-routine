import type { JournalEntry, JournalHistory } from "@/types/routine";

/** 更新で書き換える値。date を省略したときは日付も置き場所も変えない */
type JournalEntryChanges = {
  title: string;
  content: string;
  date?: string;
};

type JournalEntryLocation = { key: string; entry: JournalEntry };

/**
 * ID が一致するエントリと、それが実際に入っているバケットのキーを返す。
 * エントリ自身の date ではなく置き場所を正とする（キーと date が食い違うデータに耐える）
 */
const findJournalEntryLocation = (
  history: JournalHistory,
  entryId: string,
): JournalEntryLocation | null => {
  for (const [key, entries] of Object.entries(history)) {
    const entry = entries.find((candidate) => candidate.id === entryId);
    if (entry) return { key, entry };
  }
  return null;
};

/** key のバケットの中で、同じ ID のエントリを更新後の値に置き換える */
const replaceJournalEntryInBucket = (
  history: JournalHistory,
  key: string,
  updated: JournalEntry,
): JournalHistory => ({
  ...history,
  [key]: history[key].map((candidate) =>
    candidate.id === updated.id ? updated : candidate,
  ),
});

/** key のバケットから ID が一致するエントリを除く。バケットが空になったらキーごと消す */
const removeJournalEntryFromBucket = (
  history: JournalHistory,
  key: string,
  entryId: string,
): JournalHistory => {
  const remaining = history[key].filter(
    (candidate) => candidate.id !== entryId,
  );
  const otherDays = Object.fromEntries(
    Object.entries(history).filter(([dayKey]) => dayKey !== key),
  );
  return remaining.length > 0 ? { ...otherDays, [key]: remaining } : otherDays;
};

/** entry.date のバケットの末尾へ入れる（バケットが無ければ作る） */
const appendJournalEntryToItsDate = (
  history: JournalHistory,
  entry: JournalEntry,
): JournalHistory => ({
  ...history,
  [entry.date]: [...(history[entry.date] ?? []), entry],
});

/** fromKey のバケットから除き、updated.date のバケットの末尾へ入れる */
const moveJournalEntryToItsDate = (
  history: JournalHistory,
  fromKey: string,
  updated: JournalEntry,
): JournalHistory =>
  appendJournalEntryToItsDate(
    removeJournalEntryFromBucket(history, fromKey, updated.id),
    updated,
  );

/**
 * エントリのタイトル・本文（と、指定されたときは日付）を更新した履歴を返す（入力は変えない）。
 * date が置き場所のキーと違うときだけバケットを移す。見つからないときは history をそのまま返す。
 */
export const applyJournalEntryUpdate = (
  history: JournalHistory,
  entryId: string,
  changes: JournalEntryChanges,
  updatedAt: string,
): JournalHistory => {
  const location = findJournalEntryLocation(history, entryId);
  if (!location) return history;

  const { key, entry } = location;
  const { title, content, date } = changes;
  const updated: JournalEntry = {
    ...entry,
    title,
    content,
    // 省略時に undefined で既存の日付を上書きしない
    ...(date === undefined ? {} : { date }),
    updatedAt,
  };

  return date !== undefined && date !== key
    ? moveJournalEntryToItsDate(history, key, updated)
    : replaceJournalEntryInBucket(history, key, updated);
};
