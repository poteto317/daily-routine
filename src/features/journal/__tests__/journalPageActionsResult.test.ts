import { createJournalPageActionsResult } from "../journalPageActionsResult";

describe("createJournalPageActionsResult", () => {
  it("journal page actions hook の公開 shape を組み立てる", () => {
    const loadData = jest.fn();
    const handleSaveEntry = jest.fn();
    const handleDeleteEntry = jest.fn();
    const handleUpdateEntry = jest.fn();

    const result = createJournalPageActionsResult({
      handleDeleteEntry,
      handleSaveEntry,
      handleUpdateEntry,
      loadData,
    });

    expect(result).toEqual({
      handleDeleteEntry,
      handleSaveEntry,
      handleUpdateEntry,
      loadData,
    });
  });
});
