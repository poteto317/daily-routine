import type { JournalEntry } from "@/types/routine";
import { createJournalPageMutationActionsResult } from "../journalPageMutationActionsResult";

describe("createJournalPageMutationActionsResult", () => {
  it("save/delete/update action を公開 shape に載せる", () => {
    const handleDeleteEntry = jest.fn<void, [JournalEntry]>();
    const handleSaveEntry = jest.fn();
    const handleUpdateEntry = jest.fn();

    expect(
      createJournalPageMutationActionsResult({
        handleDeleteEntry,
        handleSaveEntry,
        handleUpdateEntry,
      }),
    ).toEqual({
      handleDeleteEntry,
      handleSaveEntry,
      handleUpdateEntry,
    });
  });
});
