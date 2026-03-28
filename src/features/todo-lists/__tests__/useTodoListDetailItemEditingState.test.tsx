import { act, renderHook } from "@testing-library/react";
import { createTodoListDetailItemEditingStateResult } from "../todoListDetailItemEditingStateResult";
import { useTodoListDetailItemEditingState } from "../useTodoListDetailItemEditingState";

jest.mock("../todoListDetailItemEditingStateResult", () => ({
  createTodoListDetailItemEditingStateResult: jest.fn(),
}));

describe("useTodoListDetailItemEditingState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (
      createTodoListDetailItemEditingStateResult as jest.Mock
    ).mockImplementation((args) => args);
  });

  it("アイテム編集 state を管理し result helper に委譲する", () => {
    const { result } = renderHook(() => useTodoListDetailItemEditingState());

    expect(createTodoListDetailItemEditingStateResult).toHaveBeenCalledWith({
      editingItemId: null,
      editingItemTitle: "",
      setEditingItemId: expect.any(Function),
      setEditingItemTitle: expect.any(Function),
      startEditItem: expect.any(Function),
    });

    expect(result.current.editingItemId).toBeNull();
    expect(result.current.editingItemTitle).toBe("");

    act(() => {
      result.current.startEditItem("item-1", "Task 1");
    });

    expect(result.current.editingItemId).toBe("item-1");
    expect(result.current.editingItemTitle).toBe("Task 1");

    act(() => {
      result.current.setEditingItemTitle("Updated Task");
      result.current.setEditingItemId(null);
    });

    expect(result.current.editingItemId).toBeNull();
    expect(result.current.editingItemTitle).toBe("Updated Task");
    expect(createTodoListDetailItemEditingStateResult).toHaveBeenLastCalledWith(
      {
        editingItemId: null,
        editingItemTitle: "Updated Task",
        setEditingItemId: expect.any(Function),
        setEditingItemTitle: expect.any(Function),
        startEditItem: expect.any(Function),
      },
    );
  });
});
