import { renderHook } from "@testing-library/react";

jest.mock("../useJournalPageMutationActions", () => ({
  useJournalPageMutationActions: jest.fn(),
}));

jest.mock("../useJournalPageReloadAction", () => ({
  useJournalPageReloadAction: jest.fn(),
}));

jest.mock("../journalPageActionsResult", () => ({
  createJournalPageActionsResult: jest.fn(),
}));

import { useJournalPageMutationActions } from "../useJournalPageMutationActions";
import { createJournalPageActionsResult } from "../journalPageActionsResult";
import { useJournalPageReloadAction } from "../useJournalPageReloadAction";
import { useJournalPageActions } from "../useJournalPageActions";

describe("useJournalPageActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("load/save/delete/update handler を組み立てて委譲する", () => {
    const loadAction = jest.fn();
    const saveAction = jest.fn();
    const deleteAction = jest.fn();
    const updateAction = jest.fn();
    const resultShape = { composed: true };
    (useJournalPageReloadAction as jest.Mock).mockReturnValue({
      loadData: loadAction,
    });
    (useJournalPageMutationActions as jest.Mock).mockReturnValue({
      handleSaveEntry: saveAction,
      handleDeleteEntry: deleteAction,
      handleUpdateEntry: updateAction,
    });
    (createJournalPageActionsResult as jest.Mock).mockReturnValue(resultShape);

    const params = {
      titleInput: "タイトル",
      contentInput: "本文",
      editingEntry: null,
      handleCancelForm: jest.fn(),
      setTodayEntry: jest.fn(),
      setTitleInput: jest.fn(),
      setContentInput: jest.fn(),
      setRecentEntries: jest.fn(),
      setShowForm: jest.fn(),
    };

    const { result } = renderHook(() => useJournalPageActions(params));

    expect(useJournalPageReloadAction).toHaveBeenCalledWith({
      setTodayEntry: params.setTodayEntry,
      setTitleInput: params.setTitleInput,
      setContentInput: params.setContentInput,
      setRecentEntries: params.setRecentEntries,
    });
    expect(useJournalPageMutationActions).toHaveBeenCalledWith(
      expect.objectContaining({
        titleInput: "タイトル",
        contentInput: "本文",
        editingEntry: null,
        loadData: loadAction,
        setShowForm: params.setShowForm,
        closeForm: params.handleCancelForm,
      }),
    );
    expect(createJournalPageActionsResult).toHaveBeenCalledWith({
      handleDeleteEntry: deleteAction,
      handleSaveEntry: saveAction,
      handleUpdateEntry: updateAction,
      loadData: loadAction,
    });
    expect(result.current).toBe(resultShape);
  });
});
