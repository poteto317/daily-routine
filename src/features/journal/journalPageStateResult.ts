import type { Dispatch, SetStateAction } from "react";
import type { JournalEntry } from "@/types/routine";

type JournalPageStateResultArgs = {
  contentInput: string;
  recentEntries: JournalEntry[];
  showForm: boolean;
  titleInput: string;
  today: string;
  todayEntry: JournalEntry | null;
  handleCancelForm: () => void;
  handleDeleteEntry: (entry: JournalEntry) => void;
  handleSaveEntry: () => void;
  openForm: () => void;
  setContentInput: Dispatch<SetStateAction<string>>;
  setTitleInput: Dispatch<SetStateAction<string>>;
};

export const createJournalPageStateResult = ({
  contentInput,
  recentEntries,
  showForm,
  titleInput,
  today,
  todayEntry,
  handleCancelForm,
  handleDeleteEntry,
  handleSaveEntry,
  openForm,
  setContentInput,
  setTitleInput,
}: JournalPageStateResultArgs) => {
  return {
    contentInput,
    recentEntries,
    showForm,
    titleInput,
    today,
    todayEntry,
    handleCancelForm,
    handleDeleteEntry,
    handleSaveEntry,
    openForm,
    setContentInput,
    setTitleInput,
  };
};
