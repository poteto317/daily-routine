import type { Dispatch, SetStateAction } from "react";
import type { JournalEntry } from "@/types/routine";

type JournalPageStateResultArgs = {
  contentInput: string;
  editingEntry: JournalEntry | null;
  recentEntries: JournalEntry[];
  showForm: boolean;
  titleInput: string;
  today: string;
  todayEntry: JournalEntry | null;
  handleCancelForm: () => void;
  handleDeleteEntry: (entry: JournalEntry) => void;
  handleSaveEntry: () => void;
  handleUpdateEntry: () => void;
  openEditForm: (entry: JournalEntry) => void;
  openForm: () => void;
  setContentInput: Dispatch<SetStateAction<string>>;
  setEditingEntry: Dispatch<SetStateAction<JournalEntry | null>>;
  setTitleInput: Dispatch<SetStateAction<string>>;
};

export const createJournalPageStateResult = ({
  contentInput,
  editingEntry,
  recentEntries,
  showForm,
  titleInput,
  today,
  todayEntry,
  handleCancelForm,
  handleDeleteEntry,
  handleSaveEntry,
  handleUpdateEntry,
  openEditForm,
  openForm,
  setContentInput,
  setEditingEntry,
  setTitleInput,
}: JournalPageStateResultArgs) => {
  return {
    contentInput,
    editingEntry,
    recentEntries,
    showForm,
    titleInput,
    today,
    todayEntry,
    handleCancelForm,
    handleDeleteEntry,
    handleSaveEntry,
    handleUpdateEntry,
    openEditForm,
    openForm,
    setContentInput,
    setEditingEntry,
    setTitleInput,
  };
};
