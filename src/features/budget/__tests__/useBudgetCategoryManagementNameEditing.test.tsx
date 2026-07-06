import { act, renderHook } from "@testing-library/react";
import { useBudgetCategoryManagementNameEditing } from "../useBudgetCategoryManagementNameEditing";

describe("useBudgetCategoryManagementNameEditing", () => {
  it("初期状態では編集中のカテゴリがない", () => {
    const handleRename = jest.fn();
    const { result } = renderHook(() =>
      useBudgetCategoryManagementNameEditing({ handleRename }),
    );

    expect(result.current.editingCategoryId).toBeNull();
    expect(result.current.editingCategoryNameValue).toBe("");
  });

  it("startEditCategoryNameで編集状態になる", () => {
    const handleRename = jest.fn();
    const { result } = renderHook(() =>
      useBudgetCategoryManagementNameEditing({ handleRename }),
    );

    act(() => {
      result.current.startEditCategoryName("cat-1", "食料品");
    });

    expect(result.current.editingCategoryId).toBe("cat-1");
    expect(result.current.editingCategoryNameValue).toBe("食料品");
  });

  it("commitEditCategoryNameでhandleRenameを呼び編集状態を終える", () => {
    const handleRename = jest.fn();
    const { result } = renderHook(() =>
      useBudgetCategoryManagementNameEditing({ handleRename }),
    );

    act(() => {
      result.current.startEditCategoryName("cat-1", "食料品");
      result.current.setEditingCategoryNameValue("食費");
    });

    act(() => {
      result.current.commitEditCategoryName();
    });

    expect(handleRename).toHaveBeenCalledWith("cat-1", "食費");
    expect(result.current.editingCategoryId).toBeNull();
  });

  it("cancelEditCategoryNameではhandleRenameを呼ばず編集状態を終える", () => {
    const handleRename = jest.fn();
    const { result } = renderHook(() =>
      useBudgetCategoryManagementNameEditing({ handleRename }),
    );

    act(() => {
      result.current.startEditCategoryName("cat-1", "食料品");
    });

    act(() => {
      result.current.cancelEditCategoryName();
    });

    expect(handleRename).not.toHaveBeenCalled();
    expect(result.current.editingCategoryId).toBeNull();
  });

  it("編集中でない状態でcommitしてもhandleRenameを呼ばない", () => {
    const handleRename = jest.fn();
    const { result } = renderHook(() =>
      useBudgetCategoryManagementNameEditing({ handleRename }),
    );

    act(() => {
      result.current.commitEditCategoryName();
    });

    expect(handleRename).not.toHaveBeenCalled();
  });
});
