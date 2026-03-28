import type { JournalEntry } from "@/types/routine";

type JournalPageMutationActionsResultArgs = {
  handleDeleteEntry: (entry: JournalEntry) => void;
  handleSaveEntry: () => void;
};

export const createJournalPageMutationActionsResult = ({
  handleDeleteEntry,
  handleSaveEntry,
}: JournalPageMutationActionsResultArgs) => {
  return {
    handleDeleteEntry,
    handleSaveEntry,
  };
};
