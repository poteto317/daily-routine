import type { JournalEntry, JournalHistory } from "@/types/routine";
export { getRecentJournalEntries } from "./journalRecentEntries";
import { getRecentJournalEntries } from "./journalRecentEntries";

type JournalPageData = {
  todayEntry: JournalEntry | null;
  titleInput: string;
  contentInput: string;
  /**
   * 日付の入力。null は未操作（新規は今日、編集は編集前の日付に従う）、
   * "" は利用者が空にした、YYYY-MM-DD は選んだ値
   */
  dateInput: string | null;
  recentEntries: JournalEntry[];
};

/** フォームの入力を空に戻した値。キャンセル・新規を開く・再読み込みのリセットはすべてこれに従う */
export const resetJournalFormInputs = (): Pick<
  JournalPageData,
  "titleInput" | "contentInput" | "dateInput"
> => {
  return {
    titleInput: "",
    contentInput: "",
    dateInput: null,
  };
};

export const createJournalPageData = (
  todayEntry: JournalEntry | null,
  history: JournalHistory,
): JournalPageData => {
  return {
    todayEntry,
    // 再読み込みでも、キャンセルと同じ規則で入力を戻す
    ...resetJournalFormInputs(),
    recentEntries: getRecentJournalEntries(history),
  };
};
