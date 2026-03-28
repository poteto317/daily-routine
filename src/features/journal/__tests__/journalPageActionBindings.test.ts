import { createJournalPageActionBindings } from "../journalPageActionBindings";

describe("journalPageActionBindings", () => {
  it("journal action 用の依存を束ねる", () => {
    const bindings = createJournalPageActionBindings({
      titleInput: "title",
      contentInput: "content",
      setTodayEntry: jest.fn(),
      setTitleInput: jest.fn(),
      setContentInput: jest.fn(),
      setRecentEntries: jest.fn(),
      setShowForm: jest.fn(),
    });

    expect(bindings).toEqual(
      expect.objectContaining({
        titleInput: "title",
        contentInput: "content",
      }),
    );
  });
});
