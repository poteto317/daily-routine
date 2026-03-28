import { act, renderHook } from "@testing-library/react";
import { useTodoListDetailTitleEditingActions } from "../useTodoListDetailTitleEditingActions";

describe("useTodoListDetailTitleEditingActions", () => {
  it("start/commit/cancel handler を組み立てる", () => {
    const onUpdateListTitle = jest.fn();
    const setEditingListTitle = jest.fn();
    const setEditingListTitleValue = jest.fn();

    const { result, rerender } = renderHook(
      ({ editingListTitleValue }) =>
        useTodoListDetailTitleEditingActions({
          listId: "list-1",
          listTitle: "Inbox",
          editingListTitleValue,
          onUpdateListTitle,
          setEditingListTitle,
          setEditingListTitleValue,
        }),
      { initialProps: { editingListTitleValue: "" } },
    );

    act(() => {
      result.current.startEditListTitle();
    });

    expect(setEditingListTitleValue).toHaveBeenCalledWith("Inbox");
    expect(setEditingListTitle).toHaveBeenCalledWith(true);

    rerender({ editingListTitleValue: "Work" });

    act(() => {
      result.current.commitEditListTitle();
    });

    expect(onUpdateListTitle).toHaveBeenCalledWith("list-1", "Work");
    expect(setEditingListTitle).toHaveBeenCalledWith(false);

    act(() => {
      result.current.cancelEditListTitle();
    });

    expect(setEditingListTitle).toHaveBeenLastCalledWith(false);
  });
});
