import { act, renderHook } from "@testing-library/react";
import { useTodoListManagementFormViewState } from "../useTodoListManagementFormViewState";

describe("useTodoListManagementFormViewState", () => {
  it("フォーム表示状態と入力値を管理する", () => {
    const { result } = renderHook(() => useTodoListManagementFormViewState());

    expect(result.current.showForm).toBe(false);
    expect(result.current.titleInput).toBe("");
    expect(result.current.inputRef.current).toBeNull();

    act(() => {
      result.current.setShowForm(true);
      result.current.setTitleInput("買い物");
    });

    expect(result.current.showForm).toBe(true);
    expect(result.current.titleInput).toBe("買い物");
  });
});
