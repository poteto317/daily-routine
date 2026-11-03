import { act, renderHook } from "@testing-library/react";

jest.mock("../journalPageMutationHandlers", () => ({
  createUpdateJournalEntryHandler: jest.fn(),
}));

import { createUpdateJournalEntryHandler } from "../journalPageMutationHandlers";
import { useJournalUpdateEntryAction } from "../useJournalUpdateEntryAction";
import { getTodayDateString } from "../utils/journalDate";

describe("useJournalUpdateEntryAction", () => {
  it("編集前の日付・日付の入力・今日の取得関数を渡して update handler を組み立て、委譲する", () => {
    const updateAction = jest.fn();
    (createUpdateJournalEntryHandler as jest.Mock).mockReturnValue(
      updateAction,
    );
    const loadData = jest.fn();
    const closeForm = jest.fn();

    const { result } = renderHook(() =>
      useJournalUpdateEntryAction({
        entryId: "entry-1",
        originalDate: "2026-03-10",
        dateInput: "2026-03-08",
        titleInput: "タイトル",
        contentInput: "本文",
        loadData,
        closeForm,
      }),
    );

    act(() => {
      result.current();
    });

    expect(createUpdateJournalEntryHandler).toHaveBeenCalledWith({
      entryId: "entry-1",
      originalDate: "2026-03-10",
      dateInput: "2026-03-08",
      getToday: getTodayDateString,
      titleInput: "タイトル",
      contentInput: "本文",
      reloadData: loadData,
      closeForm,
    });
    expect(updateAction).toHaveBeenCalled();
  });
});
