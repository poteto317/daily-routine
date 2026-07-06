import { act, renderHook } from "@testing-library/react";
import { useBudgetCategoryManagementFormState } from "../useBudgetCategoryManagementFormState";

describe("useBudgetCategoryManagementFormState", () => {
  it("初期状態はフォーム非表示・入力値は空", () => {
    const { result } = renderHook(() => useBudgetCategoryManagementFormState());

    expect(result.current.showForm).toBe(false);
    expect(result.current.nameInput).toBe("");
  });

  it("openFormでフォームを表示する", () => {
    const { result } = renderHook(() => useBudgetCategoryManagementFormState());

    act(() => {
      result.current.openForm();
    });

    expect(result.current.showForm).toBe(true);
  });

  it("closeFormでフォームを閉じ入力値をリセットする", () => {
    const { result } = renderHook(() => useBudgetCategoryManagementFormState());

    act(() => {
      result.current.openForm();
      result.current.setNameInput("食料品");
    });

    expect(result.current.nameInput).toBe("食料品");

    act(() => {
      result.current.closeForm();
    });

    expect(result.current.showForm).toBe(false);
    expect(result.current.nameInput).toBe("");
  });
});
