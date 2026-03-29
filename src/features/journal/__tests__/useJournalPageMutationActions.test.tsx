jest.mock("../journalPageMutationActionsResult", () => ({
  createJournalPageMutationActionsResult: jest.fn(),
}));

jest.mock("../useJournalDeleteEntryAction", () => ({
  useJournalDeleteEntryAction: jest.fn(),
}));

jest.mock("../useJournalSaveEntryAction", () => ({
  useJournalSaveEntryAction: jest.fn(),
}));

jest.mock("../useJournalUpdateEntryAction", () => ({
  useJournalUpdateEntryAction: jest.fn(),
}));

import { act, renderHook } from "@testing-library/react";
import { useJournalDeleteEntryAction } from "../useJournalDeleteEntryAction";
import { createJournalPageMutationActionsResult } from "../journalPageMutationActionsResult";
import { useJournalPageMutationActions } from "../useJournalPageMutationActions";
import { useJournalSaveEntryAction } from "../useJournalSaveEntryAction";
import { useJournalUpdateEntryAction } from "../useJournalUpdateEntryAction";

describe("useJournalPageMutationActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createJournalPageMutationActionsResult as jest.Mock).mockImplementation(
      (value) => value,
    );
  });

  it("save/delete/update action hooks を compose する", () => {
    const deleteAction = jest.fn();
    const saveAction = jest.fn();
    const updateAction = jest.fn();
    const resultShape = {
      handleDeleteEntry: jest.fn(),
      handleSaveEntry: jest.fn(),
      handleUpdateEntry: jest.fn(),
      composed: true,
    };
    (useJournalDeleteEntryAction as jest.Mock).mockReturnValue(deleteAction);
    (useJournalSaveEntryAction as jest.Mock).mockReturnValue(saveAction);
    (useJournalUpdateEntryAction as jest.Mock).mockReturnValue(updateAction);
    (createJournalPageMutationActionsResult as jest.Mock).mockReturnValue(
      resultShape,
    );

    const loadData = jest.fn();
    const setShowForm = jest.fn();
    const editingEntry = null;
    const { result } = renderHook(() =>
      useJournalPageMutationActions({
        titleInput: "タイトル",
        contentInput: "本文",
        editingEntry,
        setShowForm,
        loadData,
      }),
    );

    expect(result.current).toBe(resultShape);
    expect(useJournalDeleteEntryAction).toHaveBeenCalledWith({ loadData });
    expect(useJournalSaveEntryAction).toHaveBeenCalledWith({
      titleInput: "タイトル",
      contentInput: "本文",
      loadData,
      setShowForm,
    });
    expect(useJournalUpdateEntryAction).toHaveBeenCalledWith({
      entryId: "",
      titleInput: "タイトル",
      contentInput: "本文",
      loadData,
      setShowForm,
    });
    expect(createJournalPageMutationActionsResult).toHaveBeenCalledWith({
      handleDeleteEntry: expect.any(Function),
      handleSaveEntry: expect.any(Function),
      handleUpdateEntry: expect.any(Function),
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
      handleUpdateEntry: () => void;
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
      builtActions.handleUpdateEntry();
    });

    expect(deleteAction).toHaveBeenCalledWith(entry);
    expect(saveAction).toHaveBeenCalled();
    expect(updateAction).toHaveBeenCalled();
  });
});
