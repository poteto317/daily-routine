import { act, renderHook } from "@testing-library/react";
import { useBudgetExpenseItemManagementFormState } from "../useBudgetExpenseItemManagementFormState";

describe("useBudgetExpenseItemManagementFormState", () => {
  it("初期状態はフォーム非表示・入力値は空・kindはfixed", () => {
    const { result } = renderHook(() =>
      useBudgetExpenseItemManagementFormState(),
    );

    expect(result.current.showForm).toBe(false);
    expect(result.current.nameInput).toBe("");
    expect(result.current.amountInput).toBe("");
    expect(result.current.kindInput).toBe("fixed");
  });

  it("openFormでフォームを表示し指定したkindをセットする", () => {
    const { result } = renderHook(() =>
      useBudgetExpenseItemManagementFormState(),
    );

    act(() => {
      result.current.openForm("variable");
    });

    expect(result.current.showForm).toBe(true);
    expect(result.current.kindInput).toBe("variable");
  });

  it("closeFormでフォームを閉じ名前・金額入力値をリセットする（kindは維持）", () => {
    const { result } = renderHook(() =>
      useBudgetExpenseItemManagementFormState(),
    );

    act(() => {
      result.current.openForm("variable");
      result.current.setNameInput("食費");
      result.current.setAmountInput("30000");
    });

    act(() => {
      result.current.closeForm();
    });

    expect(result.current.showForm).toBe(false);
    expect(result.current.nameInput).toBe("");
    expect(result.current.amountInput).toBe("");
  });

  it("setKindInputでkindを直接変更できる", () => {
    const { result } = renderHook(() =>
      useBudgetExpenseItemManagementFormState(),
    );

    act(() => {
      result.current.setKindInput("variable");
    });

    expect(result.current.kindInput).toBe("variable");
  });
});
