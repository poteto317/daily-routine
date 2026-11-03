import type { Dispatch, SetStateAction } from "react";
import type { JournalEntry } from "@/types/routine";

type SetValue<T> = Dispatch<SetStateAction<T>>;

type JournalPageActionBindingsArgs = {
  titleInput: string;
  contentInput: string;
  dateInput: string | null;
  editingEntry: JournalEntry | null;
  handleCancelForm: () => void;
  setTodayEntry: SetValue<JournalEntry | null>;
  setTitleInput: SetValue<string>;
  setContentInput: SetValue<string>;
  setDateInput: SetValue<string | null>;
  setRecentEntries: SetValue<JournalEntry[]>;
  setShowForm: SetValue<boolean>;
};

export const createJournalPageActionBindings = ({
  titleInput,
  contentInput,
  dateInput,
  editingEntry,
  handleCancelForm,
  setTodayEntry,
  setTitleInput,
  setContentInput,
  setDateInput,
  setRecentEntries,
  setShowForm,
}: JournalPageActionBindingsArgs) => {
  return {
    titleInput,
    contentInput,
    dateInput,
    editingEntry,
    handleCancelForm,
    setTodayEntry,
    setTitleInput,
    setContentInput,
    setDateInput,
    setRecentEntries,
    setShowForm,
  };
};
