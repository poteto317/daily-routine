import { act, renderHook } from "@testing-library/react";

jest.mock("../journalPageMutationActionsResult", () => ({
  createJournalPageMutationActionsResult: jest.fn(),
}));

jest.mock("../useJournalDeleteEntryAction", () => ({
  useJournalDeleteEntryAction: jest.fn(),
}));

jest.mock("../useJournalSaveEntryAction", () => ({
  useJournalSaveEntryAction: jest.fn(),
}));

import { useJournalDeleteEntryAction } from "../useJournalDeleteEntryAction";
import { createJournalPageMutationActionsResult } from "../journalPageMutationActionsResult";
import { useJournalPageMutationActions } from "../useJournalPageMutationActions";
import { useJournalSaveEntryAction } from "../useJournalSaveEntryAction";

describe("useJournalPageMutationActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createJournalPageMutationActionsResult as jest.Mock).mockImplementation(
      (value) => value,
    );
  });

  it("save/delete action hooks を compose する", () => {
    const deleteAction = jest.fn();
    const saveAction = jest.fn();
    const resultShape = {
      handleDeleteEntry: jest.fn(),
      handleSaveEntry: jest.fn(),
      composed: true,
    };
    (useJournalDeleteEntryAction as jest.Mock).mockReturnValue(deleteAction);
    (useJournalSaveEntryAction as jest.Mock).mockReturnValue(saveAction);
    (createJournalPageMutationActionsResult as jest.Mock).mockReturnValue(
      resultShape,
    );

    const loadData = jest.fn();
    const setShowForm = jest.fn();
    const { result } = renderHook(() =>
      useJournalPageMutationActions({
        titleInput: "タイトル",
        contentInput: "本文",
        setShowForm,
        loadData,
      }),
    );

    expect(result.current).toBe(resultShape);
    expect(useJournalDeleteEntryAction).toHaveBeenCalledWith({
      loadData,
    });
    expect(useJournalSaveEntryAction).toHaveBeenCalledWith({
      titleInput: "タイトル",
      contentInput: "本文",
      loadData,
      setShowForm,
    });

    expect(createJournalPageMutationActionsResult).toHaveBeenCalledWith({
      handleDeleteEntry: expect.any(Function),
      handleSaveEntry: expect.any(Function),
    });

    const builtActions = (createJournalPageMutationActionsResult as jest.Mock)
      .mock.calls[0][0] as {
      handleDeleteEntry: (entry: {
        id: string;
        date: string;
        title: string;
        content: string;
        createdAt: string;
        updatedAt: string;
      }) => void;
      handleSaveEntry: () => void;
    };
    const entry = {
      id: "entry-1",
      date: "2024-01-12",
      title: "t",
      content: "c",
      createdAt: "2024-01-12T00:00:00.000Z",
      updatedAt: "2024-01-12T00:00:00.000Z",
    };

    act(() => {
      builtActions.handleDeleteEntry(entry);
      builtActions.handleSaveEntry();
    });

    expect(deleteAction).toHaveBeenCalledWith(entry);
    expect(saveAction).toHaveBeenCalled();
  });
});
