import type { Dispatch, SetStateAction } from "react";
import type { JournalEntry } from "@/types/routine";

type SetValue<T> = Dispatch<SetStateAction<T>>;

type JournalPageActionBindingsArgs = {
  titleInput: string;
  contentInput: string;
  editingEntry: JournalEntry | null;
  handleCancelForm: () => void;
  setTodayEntry: SetValue<JournalEntry | null>;
  setTitleInput: SetValue<string>;
  setContentInput: SetValue<string>;
  setRecentEntries: SetValue<JournalEntry[]>;
  setShowForm: SetValue<boolean>;
};

export const createJournalPageActionBindings = ({
  titleInput,
  contentInput,
  editingEntry,
  handleCancelForm,
  setTodayEntry,
  setTitleInput,
  setContentInput,
  setRecentEntries,
  setShowForm,
}: JournalPageActionBindingsArgs) => {
  return {
    titleInput,
    contentInput,
    editingEntry,
    handleCancelForm,
    setTodayEntry,
    setTitleInput,
    setContentInput,
    setRecentEntries,
    setShowForm,
  };
};
