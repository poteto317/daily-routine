import type { JournalEntry } from "@/types/routine";

type CreateJournalPageActionsResultParams = {
  handleDeleteEntry: (entry: JournalEntry) => void;
  handleSaveEntry: () => void;
  loadData: () => void;
};

export const createJournalPageActionsResult = ({
  handleDeleteEntry,
  handleSaveEntry,
  loadData,
}: CreateJournalPageActionsResultParams) => {
  return {
    handleDeleteEntry,
    handleSaveEntry,
    loadData,
  };
};
