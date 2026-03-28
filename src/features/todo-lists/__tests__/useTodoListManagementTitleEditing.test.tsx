import { act, renderHook } from "@testing-library/react";
import * as titleEditingResultModule from "../todoListManagementTitleEditingResult";
import { useTodoListManagementTitleEditing } from "../useTodoListManagementTitleEditing";

describe("useTodoListManagementTitleEditing", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("開始・確定・キャンセルの編集 state を管理する", () => {
    const handleRename = jest.fn();
    const resultSpy = jest.spyOn(
      titleEditingResultModule,
      "createTodoListManagementTitleEditingResult",
    );
    const { result } = renderHook(() =>
      useTodoListManagementTitleEditing({ handleRename }),
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

    expect(handleRename).toHaveBeenCalledWith("list-1", "Work");
    expect(result.current.editingListId).toBeNull();

    act(() => {
      result.current.startEditListTitle("list-2", "Home");
      result.current.cancelEditListTitle();
    });

    expect(result.current.editingListId).toBeNull();
    expect(resultSpy).toHaveBeenLastCalledWith({
      cancelEditListTitle: expect.any(Function),
      commitEditListTitle: expect.any(Function),
      editingListId: null,
      editingListTitleValue: "Home",
      setEditingListTitleValue: expect.any(Function),
      startEditListTitle: expect.any(Function),
    });
  });

  it("編集中でなければ確定時に rename しない", () => {
    const handleRename = jest.fn();
    const resultSpy = jest.spyOn(
      titleEditingResultModule,
      "createTodoListManagementTitleEditingResult",
    );
    const { result } = renderHook(() =>
      useTodoListManagementTitleEditing({ handleRename }),
    );

    act(() => {
      result.current.commitEditListTitle();
    });

    expect(handleRename).not.toHaveBeenCalled();
    expect(resultSpy).toHaveBeenCalledWith({
      cancelEditListTitle: expect.any(Function),
      commitEditListTitle: expect.any(Function),
      editingListId: null,
      editingListTitleValue: "",
      setEditingListTitleValue: expect.any(Function),
      startEditListTitle: expect.any(Function),
    });
  });
});
