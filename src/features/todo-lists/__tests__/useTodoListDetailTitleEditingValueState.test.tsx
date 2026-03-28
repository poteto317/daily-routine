import { act, renderHook } from "@testing-library/react";
import { useTodoListDetailTitleEditingValueState } from "../useTodoListDetailTitleEditingValueState";

describe("useTodoListDetailTitleEditingValueState", () => {
  it("title editing value state と input ref を管理する", () => {
    const { result } = renderHook(() =>
      useTodoListDetailTitleEditingValueState(),
    );

    expect(result.current.editingListTitle).toBe(false);
    expect(result.current.editingListTitleValue).toBe("");
    expect(result.current.listTitleInputRef.current).toBeNull();

    act(() => {
      result.current.setEditingListTitle(true);
      result.current.setEditingListTitleValue("Inbox");
    });

    expect(result.current.editingListTitle).toBe(true);
    expect(result.current.editingListTitleValue).toBe("Inbox");
  });
});
