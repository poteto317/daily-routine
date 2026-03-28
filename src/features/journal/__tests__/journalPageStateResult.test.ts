import { createJournalPageStateResult } from "../journalPageStateResult";

describe("journalPageStateResult", () => {
  it("journal page の result を組み立てる", () => {
    const setContentInput = jest.fn();
    const setTitleInput = jest.fn();
    const handleCancelForm = jest.fn();
    const handleDeleteEntry = jest.fn();
    const handleSaveEntry = jest.fn();
    const openForm = jest.fn();
    const entry = {
      id: "saved",
      date: "2024-01-12",
      title: "保存済み",
      content: "本文",
      createdAt: "2024-01-12T00:00:00.000Z",
      updatedAt: "2024-01-12T00:00:00.000Z",
    };

    expect(
      createJournalPageStateResult({
        contentInput: "本文",
        recentEntries: [entry],
        showForm: true,
        titleInput: "保存済み",
        today: "2024-01-12",
        todayEntry: entry,
        handleCancelForm,
        handleDeleteEntry,
        handleSaveEntry,
        openForm,
        setContentInput,
        setTitleInput,
      }),
    ).toEqual({
      contentInput: "本文",
      recentEntries: [entry],
      showForm: true,
      titleInput: "保存済み",
      today: "2024-01-12",
      todayEntry: entry,
      handleCancelForm,
      handleDeleteEntry,
      handleSaveEntry,
      openForm,
      setContentInput,
      setTitleInput,
    });
  });
});
