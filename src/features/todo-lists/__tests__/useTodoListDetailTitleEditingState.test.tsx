import { renderHook } from "@testing-library/react";

jest.mock("../useTodoListDetailTitleEditingActions", () => ({
  useTodoListDetailTitleEditingActions: jest.fn(),
}));

jest.mock("../useTodoListDetailTitleEditingValueState", () => ({
  useTodoListDetailTitleEditingValueState: jest.fn(),
}));

import { useTodoListDetailTitleEditingActions } from "../useTodoListDetailTitleEditingActions";
import { useTodoListDetailTitleEditingState } from "../useTodoListDetailTitleEditingState";
import { useTodoListDetailTitleEditingValueState } from "../useTodoListDetailTitleEditingValueState";

describe("useTodoListDetailTitleEditingState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("value state と action hook を compose する", () => {
    const onUpdateListTitle = jest.fn();
    const valueState = {
      editingListTitle: true,
      editingListTitleValue: "Inbox",
      listTitleInputRef: { current: null },
      setEditingListTitle: jest.fn(),
      setEditingListTitleValue: jest.fn(),
    };
    const actions = {
      cancelEditListTitle: jest.fn(),
      commitEditListTitle: jest.fn(),
      startEditListTitle: jest.fn(),
    };
    (useTodoListDetailTitleEditingValueState as jest.Mock).mockReturnValue(
      valueState,
    );
    (useTodoListDetailTitleEditingActions as jest.Mock).mockReturnValue(
      actions,
    );

    const { result } = renderHook(() =>
      useTodoListDetailTitleEditingState({
        listId: "list-1",
        listTitle: "Inbox",
        onUpdateListTitle,
      }),
    );

    expect(useTodoListDetailTitleEditingValueState).toHaveBeenCalledTimes(1);
    expect(useTodoListDetailTitleEditingActions).toHaveBeenCalledWith({
      listId: "list-1",
      listTitle: "Inbox",
      editingListTitleValue: "Inbox",
      onUpdateListTitle,
      setEditingListTitle: valueState.setEditingListTitle,
      setEditingListTitleValue: valueState.setEditingListTitleValue,
    });
    expect(result.current).toEqual({
      cancelEditListTitle: actions.cancelEditListTitle,
      commitEditListTitle: actions.commitEditListTitle,
      editingListTitle: true,
      editingListTitleValue: "Inbox",
      listTitleInputRef: { current: null },
      setEditingListTitleValue: valueState.setEditingListTitleValue,
      startEditListTitle: actions.startEditListTitle,
    });
  });
});
