import { act, renderHook } from "@testing-library/react";

jest.mock("../storage", () => ({
  getTodoLists: jest.fn(),
}));

jest.mock("../sync", () => ({
  saveAndSyncTodoLists: jest.fn(),
}));

jest.mock("../selectedTodoList", () => ({
  setSelectedTodoListId: jest.fn(),
}));

import { setSelectedTodoListId } from "../selectedTodoList";
import { getTodoLists } from "../storage";
import { saveAndSyncTodoLists } from "../sync";
import { useTodoListManagementPageState } from "../useTodoListManagementPageState";

const mockGetTodoLists = getTodoLists as jest.MockedFunction<
  typeof getTodoLists
>;
const mockSaveAndSyncTodoLists = saveAndSyncTodoLists as jest.MockedFunction<
  typeof saveAndSyncTodoLists
>;
const mockSetSelectedTodoListId = setSelectedTodoListId as jest.MockedFunction<
  typeof setSelectedTodoListId
>;

describe("useTodoListManagementPageState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.spyOn(window, "confirm").mockReturnValue(true);
    mockGetTodoLists.mockReturnValue([
      {
        id: "list-1",
        title: "Inbox",
        items: [],
        createdAt: "2026-03-07T00:00:00.000Z",
        updatedAt: "2026-03-07T00:00:00.000Z",
      },
    ]);
  });

  afterEach(() => {
    jest.useRealTimers();
    (window.confirm as jest.Mock).mockRestore();
  });

  it("初期リストを読み込み、対象リストを開ける", () => {
    const navigate = jest.fn();
    const { result } = renderHook(() =>
      useTodoListManagementPageState({ navigate }),
    );

    expect(result.current.lists).toHaveLength(1);

    act(() => {
      result.current.openList("list-1");
    });

    expect(mockSetSelectedTodoListId).toHaveBeenCalledWith("list-1");
    expect(navigate).toHaveBeenCalledWith("todo-lists");
  });

  it("フォームを開閉し、閉じると入力を初期化する", () => {
    const { result } = renderHook(() =>
      useTodoListManagementPageState({ navigate: jest.fn() }),
    );

    act(() => {
      result.current.openForm();
      jest.runOnlyPendingTimers();
    });

    expect(result.current.showForm).toBe(true);

    act(() => {
      result.current.setTitleInput("買い物");
      result.current.closeForm();
    });

    expect(result.current.showForm).toBe(false);
    expect(result.current.titleInput).toBe("");
  });

  it("リスト作成時に永続化してフォームを閉じる", () => {
    const { result } = renderHook(() =>
      useTodoListManagementPageState({ navigate: jest.fn() }),
    );

    act(() => {
      result.current.openForm();
      result.current.setTitleInput("買い物");
    });

    act(() => {
      result.current.handleCreate();
    });

    expect(mockSaveAndSyncTodoLists).toHaveBeenCalledWith([
      expect.objectContaining({ id: "list-1", title: "Inbox" }),
      expect.objectContaining({ title: "買い物" }),
    ]);
    expect(result.current.showForm).toBe(false);
    expect(result.current.titleInput).toBe("");
  });

  it("リスト名編集を確定すると永続化し、編集状態を解除する", () => {
    const { result } = renderHook(() =>
      useTodoListManagementPageState({ navigate: jest.fn() }),
    );

    act(() => {
      result.current.startEditListTitle("list-1", "Inbox");
    });

    expect(result.current.editingListId).toBe("list-1");
    expect(result.current.editingListTitleValue).toBe("Inbox");

    act(() => {
      result.current.setEditingListTitleValue("Work");
    });

    act(() => {
      result.current.commitEditListTitle();
    });

    expect(mockSaveAndSyncTodoLists).toHaveBeenCalledWith([
      expect.objectContaining({ id: "list-1", title: "Work" }),
    ]);
    expect(result.current.editingListId).toBeNull();
  });

  it("表示切替と削除を state に反映する", () => {
    const { result } = renderHook(() =>
      useTodoListManagementPageState({ navigate: jest.fn() }),
    );

    act(() => {
      result.current.handleToggleVisibility(result.current.lists[0]);
    });

    expect(result.current.lists[0].isHidden).toBe(true);

    act(() => {
      result.current.handleDelete(result.current.lists[0]);
    });

    expect(result.current.lists).toEqual([]);
  });
});
