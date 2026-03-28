import { act, renderHook } from "@testing-library/react";
import { useTodoListManagementFormState } from "../useTodoListManagementFormState";

describe("useTodoListManagementFormState", () => {
  it("フォームの開閉と入力値を管理する", () => {
    const { result } = renderHook(() => useTodoListManagementFormState());

    expect(result.current.showForm).toBe(false);
    expect(result.current.titleInput).toBe("");

    act(() => {
      result.current.openForm();
      result.current.setTitleInput("買い物");
    });

    expect(result.current.showForm).toBe(true);
    expect(result.current.titleInput).toBe("買い物");

    act(() => {
      result.current.closeForm();
    });

    expect(result.current.showForm).toBe(false);
    expect(result.current.titleInput).toBe("");
  });
});
