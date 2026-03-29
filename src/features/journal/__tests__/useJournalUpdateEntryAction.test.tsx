import { act, renderHook } from "@testing-library/react";

jest.mock("../journalPageMutationHandlers", () => ({
  createUpdateJournalEntryHandler: jest.fn(),
}));

import { createUpdateJournalEntryHandler } from "../journalPageMutationHandlers";
import { useJournalUpdateEntryAction } from "../useJournalUpdateEntryAction";

describe("useJournalUpdateEntryAction", () => {
  it("update handler を組み立てて委譲する", () => {
    const updateAction = jest.fn();
    (createUpdateJournalEntryHandler as jest.Mock).mockReturnValue(
      updateAction,
    );
    const loadData = jest.fn();
    const closeForm = jest.fn();

    const { result } = renderHook(() =>
      useJournalUpdateEntryAction({
        entryId: "entry-1",
        titleInput: "タイトル",
        contentInput: "本文",
        loadData,
        closeForm,
      }),
    );

    act(() => {
      result.current();
    });

    expect(createUpdateJournalEntryHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        entryId: "entry-1",
        titleInput: "タイトル",
        contentInput: "本文",
        reloadData: loadData,
        closeForm: expect.any(Function),
      }),
    );
    expect(updateAction).toHaveBeenCalled();
  });
});
