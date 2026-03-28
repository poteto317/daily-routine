import type { JournalEntry } from "@/types/routine";
import { createJournalPageMutationActionsResult } from "../journalPageMutationActionsResult";

describe("createJournalPageMutationActionsResult", () => {
  it("save/delete action を公開 shape に載せる", () => {
    const handleDeleteEntry = jest.fn<void, [JournalEntry]>();
    const handleSaveEntry = jest.fn();

    expect(
      createJournalPageMutationActionsResult({
        handleDeleteEntry,
        handleSaveEntry,
      }),
    ).toEqual({
      handleDeleteEntry,
      handleSaveEntry,
    });
  });
});
