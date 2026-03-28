import { act, renderHook } from "@testing-library/react";

jest.mock("../journalPageMutationHandlers", () => ({
  createSaveJournalEntryHandler: jest.fn(),
}));

import { createSaveJournalEntryHandler } from "../journalPageMutationHandlers";
import { useJournalSaveEntryAction } from "../useJournalSaveEntryAction";

describe("useJournalSaveEntryAction", () => {
  it("save handler を組み立てて委譲する", () => {
    const saveAction = jest.fn();
    (createSaveJournalEntryHandler as jest.Mock).mockReturnValue(saveAction);
    const loadData = jest.fn();
    const setShowForm = jest.fn();

    const { result } = renderHook(() =>
      useJournalSaveEntryAction({
        titleInput: "タイトル",
        contentInput: "本文",
        loadData,
        setShowForm,
      }),
    );

    act(() => {
      result.current();
    });

    expect(createSaveJournalEntryHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        titleInput: "タイトル",
        contentInput: "本文",
        reloadData: loadData,
        closeForm: expect.any(Function),
      }),
    );
    expect(saveAction).toHaveBeenCalled();
  });
});
