import { act, renderHook } from "@testing-library/react";
import { useTodoListDetailItemEditingActions } from "../useTodoListDetailItemEditingActions";

describe("useTodoListDetailItemEditingActions", () => {
  it("commit/cancel action を組み立てる", () => {
    const onUpdateItemTitle = jest.fn();
    const setEditingItemId = jest.fn();

    const { result } = renderHook(() =>
      useTodoListDetailItemEditingActions({
        editingItemTitle: "Updated Task",
        listId: "list-1",
        onUpdateItemTitle,
        setEditingItemId,
      }),
    );

    act(() => {
      result.current.commitEditItem("item-1");
      result.current.cancelEditItem();
    });

    expect(onUpdateItemTitle).toHaveBeenCalledWith(
      "list-1",
      "item-1",
      "Updated Task",
    );
    expect(setEditingItemId).toHaveBeenNthCalledWith(1, null);
    expect(setEditingItemId).toHaveBeenNthCalledWith(2, null);
  });
});
