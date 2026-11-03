import type { Dispatch, SetStateAction } from "react";
import type { JournalEntry } from "@/types/routine";

type SetValue<T> = Dispatch<SetStateAction<T>>;

/**
 * UI からの入力を受けるハンドラ。タイトル・本文の最初の変更で日付を固定する
 * （新規はその時点の今日、編集は編集対象のエントリの日付）。
 * フォームを開く・閉じる・保存・再読み込みのリセットは素のセッターで行い、固定を起こさない。
 */
export const createJournalInputChangeHandlers = (params: {
  editingEntry: JournalEntry | null;
  getToday: () => string;
  setTitleInput: SetValue<string>;
  setContentInput: SetValue<string>;
  setDateInput: SetValue<string | null>;
}) => {
  const {
    editingEntry,
    getToday,
    setTitleInput,
    setContentInput,
    setDateInput,
  } = params;

  const lockDate = () => {
    // 固定する日付は関数更新の外で 1 回だけ取る（StrictMode の二重実行でも揺れない）
    const lockedDate = editingEntry?.date ?? getToday();
    setDateInput((prev) => prev ?? lockedDate);
  };

  return {
    handleTitleChange: (value: string) => {
      lockDate();
      setTitleInput(value);
    },
    handleContentChange: (value: string) => {
      lockDate();
      setContentInput(value);
    },
    // 日付欄の変更はそれ自体が最初の変更。選んだ値（"" を含む）をそのまま入れる
    handleDateChange: (value: string) => {
      setDateInput(value);
    },
  };
};
