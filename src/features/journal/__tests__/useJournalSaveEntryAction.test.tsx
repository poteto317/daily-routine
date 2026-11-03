import { act, renderHook } from "@testing-library/react";

jest.mock("../journalPageMutationHandlers", () => ({
  createSaveJournalEntryHandler: jest.fn(),
}));

import { createSaveJournalEntryHandler } from "../journalPageMutationHandlers";
import { useJournalSaveEntryAction } from "../useJournalSaveEntryAction";
import { getTodayDateString } from "../utils/journalDate";

describe("useJournalSaveEntryAction", () => {
  it("日付の入力と今日の取得関数を渡して save handler を組み立て、委譲する", () => {
    const saveAction = jest.fn();
    (createSaveJournalEntryHandler as jest.Mock).mockReturnValue(saveAction);
    const loadData = jest.fn();
    const setShowForm = jest.fn();

    const { result } = renderHook(() =>
      useJournalSaveEntryAction({
        titleInput: "タイトル",
        contentInput: "本文",
        dateInput: "2026-03-10",
        loadData,
        setShowForm,
      }),
    );

    act(() => {
      result.current();
    });

    expect(createSaveJournalEntryHandler).toHaveBeenCalledWith({
      getToday: getTodayDateString,
      dateInput: "2026-03-10",
      titleInput: "タイトル",
      contentInput: "本文",
      reloadData: loadData,
      closeForm: expect.any(Function),
    });
    expect(saveAction).toHaveBeenCalled();
  });
});
