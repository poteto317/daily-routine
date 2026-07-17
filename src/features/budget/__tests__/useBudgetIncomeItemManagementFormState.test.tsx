import { act, renderHook } from "@testing-library/react";
import { useBudgetIncomeItemManagementFormState } from "../useBudgetIncomeItemManagementFormState";

describe("useBudgetIncomeItemManagementFormState", () => {
  it("初期状態はフォーム非表示・入力値は空", () => {
    const { result } = renderHook(() =>
      useBudgetIncomeItemManagementFormState(),
    );

    expect(result.current.showForm).toBe(false);
    expect(result.current.nameInput).toBe("");
    expect(result.current.amountInput).toBe("");
  });

  it("openFormでフォームを表示する", () => {
    const { result } = renderHook(() =>
      useBudgetIncomeItemManagementFormState(),
    );

    act(() => {
      result.current.openForm();
    });

    expect(result.current.showForm).toBe(true);
  });

  it("closeFormでフォームを閉じ入力値をリセットする", () => {
    const { result } = renderHook(() =>
      useBudgetIncomeItemManagementFormState(),
    );

    act(() => {
      result.current.openForm();
      result.current.setNameInput("給与");
      result.current.setAmountInput("300000");
    });

    expect(result.current.nameInput).toBe("給与");
    expect(result.current.amountInput).toBe("300000");

    act(() => {
      result.current.closeForm();
    });

    expect(result.current.showForm).toBe(false);
    expect(result.current.nameInput).toBe("");
    expect(result.current.amountInput).toBe("");
  });
});
