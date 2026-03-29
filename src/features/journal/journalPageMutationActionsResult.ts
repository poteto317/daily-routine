import type { JournalEntry } from "@/types/routine";

type JournalPageMutationActionsResultArgs = {
  handleDeleteEntry: (entry: JournalEntry) => void;
  handleSaveEntry: () => void;
  handleUpdateEntry: () => void;
};

export const createJournalPageMutationActionsResult = ({
  handleDeleteEntry,
  handleSaveEntry,
  handleUpdateEntry,
}: JournalPageMutationActionsResultArgs) => {
  return {
    handleDeleteEntry,
    handleSaveEntry,
    handleUpdateEntry,
  };
};
