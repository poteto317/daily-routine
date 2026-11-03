import type { JournalEntry } from "@/types/routine";

/**
 * 日付欄に出す値。dateInput が未操作（null）なら、編集は編集前の日付、新規は今日。
 * "" （利用者が空にした）はそのまま返す。
 */
export const resolveJournalDateFieldValue = (
  dateInput: string | null,
  editingEntry: JournalEntry | null,
  today: string,
): string => dateInput ?? editingEntry?.date ?? today;

/**
 * 今日のカードの見出しに使う日付。日付欄に従うのは新規追加のフォームを開いているときだけで、
 * 閉じているときと編集中は今日のまま。
 */
export const getJournalTodayCardHeadingDate = ({
  showForm,
  editingEntry,
  dateValue,
  today,
}: {
  showForm: boolean;
  editingEntry: JournalEntry | null;
  dateValue: string;
  today: string;
}): string => (showForm && editingEntry === null ? dateValue : today);

/**
 * 編集で日付を変えたときの変更先。未操作（null）や編集前と同じ日付なら null。
 * "" （空にした）は変更として返し、検証は呼び出し側に任せる。
 */
export const getChangedJournalDate = (
  dateInput: string | null,
  originalDate: string,
): string | null => {
  const nextDate = dateInput ?? originalDate;
  return nextDate === originalDate ? null : nextDate;
};
