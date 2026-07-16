import { act, renderHook } from "@testing-library/react";
import { useTodoCategoryManagementFormState } from "../useTodoCategoryManagementFormState";

describe("useTodoCategoryManagementFormState", () => {
  it("初期状態はフォーム非表示・入力値は空・色は未設定", () => {
    const { result } = renderHook(() => useTodoCategoryManagementFormState());

    expect(result.current.showForm).toBe(false);
    expect(result.current.nameInput).toBe("");
    expect(result.current.colorInput).toBeUndefined();
  });

  it("openFormでフォームを表示する", () => {
    const { result } = renderHook(() => useTodoCategoryManagementFormState());

    act(() => {
      result.current.openForm();
    });

    expect(result.current.showForm).toBe(true);
  });

  it("closeFormでフォームを閉じ入力値・色をリセットする", () => {
    const { result } = renderHook(() => useTodoCategoryManagementFormState());

    act(() => {
      result.current.openForm();
      result.current.setNameInput("仕事");
      result.current.setColorInput("bg-blue-50");
    });

    expect(result.current.nameInput).toBe("仕事");
    expect(result.current.colorInput).toBe("bg-blue-50");

    act(() => {
      result.current.closeForm();
    });

    expect(result.current.showForm).toBe(false);
    expect(result.current.nameInput).toBe("");
    expect(result.current.colorInput).toBeUndefined();
  });
});
