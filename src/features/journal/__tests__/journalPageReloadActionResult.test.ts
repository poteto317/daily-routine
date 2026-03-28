import { createJournalPageReloadActionResult } from "../journalPageReloadActionResult";

describe("createJournalPageReloadActionResult", () => {
  it("loadData を公開 shape に載せる", () => {
    const loadData = jest.fn();

    expect(createJournalPageReloadActionResult({ loadData })).toEqual({
      loadData,
    });
  });
});
