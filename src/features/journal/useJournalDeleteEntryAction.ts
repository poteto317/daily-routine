import { useCallback } from "react";
import type { JournalEntry } from "@/types/routine";
import { createDeleteJournalEntryHandler } from "./journalPageMutationHandlers";

type UseJournalDeleteEntryActionParams = {
  loadData: () => void;
};

export const useJournalDeleteEntryAction = ({
  loadData,
}: UseJournalDeleteEntryActionParams) => {
  return useCallback(
    (entry: JournalEntry) => {
      return createDeleteJournalEntryHandler({
        reloadData: loadData,
      })(entry);
    },
    [loadData],
  );
};
