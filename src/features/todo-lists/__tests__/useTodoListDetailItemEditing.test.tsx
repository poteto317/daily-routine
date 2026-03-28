import { renderHook } from "@testing-library/react";

jest.mock("../todoListDetailItemEditingResult", () => ({
  createTodoListDetailItemEditingResult: jest.fn(),
}));

jest.mock("../useTodoListDetailItemEditingActions", () => ({
  useTodoListDetailItemEditingActions: jest.fn(),
}));

jest.mock("../useTodoListDetailItemEditingState", () => ({
  useTodoListDetailItemEditingState: jest.fn(),
}));

import { createTodoListDetailItemEditingResult } from "../todoListDetailItemEditingResult";
import { useTodoListDetailItemEditingActions } from "../useTodoListDetailItemEditingActions";
import { useTodoListDetailItemEditingState } from "../useTodoListDetailItemEditingState";
import { useTodoListDetailItemEditing } from "../useTodoListDetailItemEditing";

describe("useTodoListDetailItemEditing", () => {
  const itemEditingState = {
    editingItemId: "item-1",
    editingItemTitle: "Task 1",
    setEditingItemId: jest.fn(),
    setEditingItemTitle: jest.fn(),
    startEditItem: jest.fn(),
  };
  const itemEditingActions = {
    cancelEditItem: jest.fn(),
    commitEditItem: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTodoListDetailItemEditingState as jest.Mock).mockReturnValue(
      itemEditingState,
    );
    (useTodoListDetailItemEditingActions as jest.Mock).mockReturnValue(
      itemEditingActions,
    );
  });

  it("item editing state と action hook を合成する", () => {
    const onUpdateItemTitle = jest.fn();
    const itemEditingResult = {
      ...itemEditingState,
      ...itemEditingActions,
    };
    (createTodoListDetailItemEditingResult as jest.Mock).mockReturnValue(
      itemEditingResult,
    );

    const { result } = renderHook(() =>
      useTodoListDetailItemEditing({
        listId: "list-1",
        onUpdateItemTitle,
      }),
    );

    expect(useTodoListDetailItemEditingState).toHaveBeenCalledWith();
    expect(useTodoListDetailItemEditingActions).toHaveBeenCalledWith({
      editingItemTitle: "Task 1",
      listId: "list-1",
      onUpdateItemTitle,
      setEditingItemId: expect.any(Function),
    });
    expect(createTodoListDetailItemEditingResult).toHaveBeenCalledWith({
      itemEditingState,
      itemEditingActions,
    });
    expect(result.current).toBe(itemEditingResult);
  });
});
