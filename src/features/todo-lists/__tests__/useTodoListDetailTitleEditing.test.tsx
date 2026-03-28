import { renderHook } from "@testing-library/react";

jest.mock("../useTodoListDetailTitleEditingFocus", () => ({
  useTodoListDetailTitleEditingFocus: jest.fn(),
}));

jest.mock("../useTodoListDetailTitleEditingState", () => ({
  useTodoListDetailTitleEditingState: jest.fn(),
}));

import { useTodoListDetailTitleEditingFocus } from "../useTodoListDetailTitleEditingFocus";
import { useTodoListDetailTitleEditingState } from "../useTodoListDetailTitleEditingState";
import { useTodoListDetailTitleEditing } from "../useTodoListDetailTitleEditing";

describe("useTodoListDetailTitleEditing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useTodoListDetailTitleEditingState as jest.Mock).mockReturnValue({
      cancelEditListTitle: jest.fn(),
      commitEditListTitle: jest.fn(),
      editingListTitle: true,
      editingListTitleValue: "Inbox",
      listTitleInputRef: { current: null },
      setEditingListTitleValue: jest.fn(),
      startEditListTitle: jest.fn(),
    });
  });

  it("title editing state hook を返し、focus hook に橋渡しする", () => {
    const onUpdateListTitle = jest.fn();
    const { result } = renderHook(() =>
      useTodoListDetailTitleEditing({
        listId: "list-1",
        listTitle: "Inbox",
        onUpdateListTitle,
      }),
    );

    expect(useTodoListDetailTitleEditingState).toHaveBeenCalledWith({
      listId: "list-1",
      listTitle: "Inbox",
      onUpdateListTitle,
    });
    expect(useTodoListDetailTitleEditingFocus).toHaveBeenCalledWith({
      editingListTitle: true,
      listTitleInputRef: { current: null },
    });
    expect(result.current).toBe(
      (useTodoListDetailTitleEditingState as jest.Mock).mock.results[0].value,
    );
  });
});
