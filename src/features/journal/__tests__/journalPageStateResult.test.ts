import { createJournalPageStateResult } from "../journalPageStateResult";

describe("journalPageStateResult", () => {
  it("journal page の result を組み立てる（UI 用ハンドラを含み、素のセッターは含まない）", () => {
    const args = {
      contentInput: "本文",
      dateInput: "2024-01-10",
      editingEntry: null,
      recentEntries: [
        {
          id: "saved",
          date: "2024-01-12",
          title: "保存済み",
          content: "本文",
          createdAt: "2024-01-12T00:00:00.000Z",
          updatedAt: "2024-01-12T00:00:00.000Z",
        },
      ],
      showForm: true,
      titleInput: "保存済み",
      today: "2024-01-12",
      todayEntry: null,
      handleCancelForm: jest.fn(),
      handleContentChange: jest.fn(),
      handleDateChange: jest.fn(),
      handleDeleteEntry: jest.fn(),
      handleSaveEntry: jest.fn(),
      handleTitleChange: jest.fn(),
      handleUpdateEntry: jest.fn(),
      openEditForm: jest.fn(),
      openForm: jest.fn(),
      setEditingEntry: jest.fn(),
    };

    const result = createJournalPageStateResult(args);

    expect(result).toEqual(args);
    expect(result).not.toHaveProperty("setTitleInput");
    expect(result).not.toHaveProperty("setContentInput");
    expect(result).not.toHaveProperty("setDateInput");
  });
});
