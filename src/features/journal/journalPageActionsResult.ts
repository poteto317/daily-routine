import type { JournalEntry } from "@/types/routine";

type CreateJournalPageActionsResultParams = {
  handleDeleteEntry: (entry: JournalEntry) => void;
  handleSaveEntry: () => void;
  handleUpdateEntry: () => void;
  loadData: () => void;
};

export const createJournalPageActionsResult = ({
  handleDeleteEntry,
  handleSaveEntry,
  handleUpdateEntry,
  loadData,
}: CreateJournalPageActionsResultParams) => {
  return {
    handleDeleteEntry,
    handleSaveEntry,
    handleUpdateEntry,
    loadData,
  };
};
