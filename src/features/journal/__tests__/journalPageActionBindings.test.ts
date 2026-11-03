import { createJournalPageActionBindings } from "../journalPageActionBindings";

describe("journalPageActionBindings", () => {
  it("journal action 用の依存を束ねる（日付の入力と素のセッターを含む）", () => {
    const args = {
      titleInput: "title",
      contentInput: "content",
      dateInput: "2026-03-10",
      editingEntry: null,
      handleCancelForm: jest.fn(),
      setTodayEntry: jest.fn(),
      setTitleInput: jest.fn(),
      setContentInput: jest.fn(),
      setDateInput: jest.fn(),
      setRecentEntries: jest.fn(),
      setShowForm: jest.fn(),
    };

    expect(createJournalPageActionBindings(args)).toEqual(args);
  });
});
