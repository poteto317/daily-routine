import { useState } from "react";

export type WeeklyLogForm = {
  isEditing: boolean;
  /** 書いている週の開始日。閉じている間は null */
  editingWeekStart: string | null;
  contentInput: string;
  open: (weekStart: string, initialContent: string) => void;
  close: () => void;
  changeContent: (value: string) => void;
};

/** 編集フォームの開閉・書いている週・入力値 */
export const useWeeklyLogForm = (): WeeklyLogForm => {
  const [editingWeekStart, setEditingWeekStart] = useState<string | null>(null);
  const [contentInput, setContentInput] = useState("");

  const open = (weekStart: string, initialContent: string) => {
    setContentInput(initialContent);
    setEditingWeekStart(weekStart);
  };

  const close = () => {
    setEditingWeekStart(null);
    setContentInput("");
  };

  return {
    isEditing: editingWeekStart !== null,
    editingWeekStart,
    contentInput,
    open,
    close,
    changeContent: setContentInput,
  };
};
