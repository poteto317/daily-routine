import type { Dispatch, SetStateAction } from "react";
import type { JournalEntry } from "@/types/routine";

type JournalPageStateResultArgs = {
  contentInput: string;
  dateInput: string | null;
  editingEntry: JournalEntry | null;
  recentEntries: JournalEntry[];
  showForm: boolean;
  titleInput: string;
  today: string;
  todayEntry: JournalEntry | null;
  handleCancelForm: () => void;
  handleContentChange: (value: string) => void;
  handleDateChange: (value: string) => void;
  handleDeleteEntry: (entry: JournalEntry) => void;
  handleSaveEntry: () => void;
  handleTitleChange: (value: string) => void;
  handleUpdateEntry: () => void;
  openEditForm: (entry: JournalEntry) => void;
  openForm: () => void;
  setEditingEntry: Dispatch<SetStateAction<JournalEntry | null>>;
};

/** 画面に渡す state。入力の変更は handle*Change だけ（素のセッターは含めない） */
export const createJournalPageStateResult = ({
  contentInput,
  dateInput,
  editingEntry,
  recentEntries,
  showForm,
  titleInput,
  today,
  todayEntry,
  handleCancelForm,
  handleContentChange,
  handleDateChange,
  handleDeleteEntry,
  handleSaveEntry,
  handleTitleChange,
  handleUpdateEntry,
  openEditForm,
  openForm,
  setEditingEntry,
}: JournalPageStateResultArgs) => {
  return {
    contentInput,
    dateInput,
    editingEntry,
    recentEntries,
    showForm,
    titleInput,
    today,
    todayEntry,
    handleCancelForm,
    handleContentChange,
    handleDateChange,
    handleDeleteEntry,
    handleSaveEntry,
    handleTitleChange,
    handleUpdateEntry,
    openEditForm,
    openForm,
    setEditingEntry,
  };
};
