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

const entry = {
  id: "entry-1",
  date: "2024-01-12",
  title: "t",
  content: "c",
  createdAt: "2024-01-12T00:00:00.000Z",
  updatedAt: "2024-01-12T00:00:00.000Z",
};

type BuiltActions = {
  handleDeleteEntry: (target: typeof entry) => void;
  handleSaveEntry: () => void;
  handleUpdateEntry: () => void;
};

describe("useJournalPageMutationActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createJournalPageMutationActionsResult as jest.Mock).mockImplementation(
      (value) => value,
    );
  });

  it("save/delete/update action hooks を compose する（日付の入力を保存と更新へ渡す）", () => {
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
    const closeForm = jest.fn();
    const { result } = renderHook(() =>
      useJournalPageMutationActions({
        titleInput: "タイトル",
        contentInput: "本文",
        dateInput: "2024-01-10",
        editingEntry: null,
        setShowForm,
        closeForm,
        loadData,
      }),
    );

    expect(result.current).toBe(resultShape);
    expect(useJournalDeleteEntryAction).toHaveBeenCalledWith({ loadData });
    expect(useJournalSaveEntryAction).toHaveBeenCalledWith({
      titleInput: "タイトル",
      contentInput: "本文",
      dateInput: "2024-01-10",
      loadData,
      setShowForm,
    });
    expect(useJournalUpdateEntryAction).toHaveBeenCalledWith({
      entryId: "",
      originalDate: "",
      dateInput: "2024-01-10",
      titleInput: "タイトル",
      contentInput: "本文",
      loadData,
      closeForm,
    });
    expect(createJournalPageMutationActionsResult).toHaveBeenCalledWith({
      handleDeleteEntry: expect.any(Function),
      handleSaveEntry: expect.any(Function),
      handleUpdateEntry: expect.any(Function),
    });

    const builtActions = (createJournalPageMutationActionsResult as jest.Mock)
      .mock.calls[0][0] as BuiltActions;

    act(() => {
      builtActions.handleDeleteEntry(entry);
      builtActions.handleSaveEntry();
      builtActions.handleUpdateEntry();
    });

    expect(deleteAction).toHaveBeenCalledWith(entry);
    expect(saveAction).toHaveBeenCalled();
    // editingEntry が null のため updateEntryBase は no-op にラップされており呼ばれない
    expect(updateAction).not.toHaveBeenCalled();
  });

  it("編集中は、エントリの ID と日付（編集前の日付）を更新へ渡す", () => {
    const updateAction = jest.fn();
    (useJournalDeleteEntryAction as jest.Mock).mockReturnValue(jest.fn());
    (useJournalSaveEntryAction as jest.Mock).mockReturnValue(jest.fn());
    (useJournalUpdateEntryAction as jest.Mock).mockReturnValue(updateAction);

    const loadData = jest.fn();
    const closeForm = jest.fn();
    renderHook(() =>
      useJournalPageMutationActions({
        titleInput: "タイトル",
        contentInput: "本文",
        dateInput: null,
        editingEntry: entry,
        setShowForm: jest.fn(),
        closeForm,
        loadData,
      }),
    );

    expect(useJournalUpdateEntryAction).toHaveBeenCalledWith({
      entryId: "entry-1",
      originalDate: "2024-01-12",
      dateInput: null,
      titleInput: "タイトル",
      contentInput: "本文",
      loadData,
      closeForm,
    });

    const builtActions = (createJournalPageMutationActionsResult as jest.Mock)
      .mock.calls[0][0] as BuiltActions;
    act(() => {
      builtActions.handleUpdateEntry();
    });
    expect(updateAction).toHaveBeenCalled();
  });
});
