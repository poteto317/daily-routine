import { act, renderHook } from "@testing-library/react";

jest.mock("../homeViewControlRuntimeStateResult", () => ({
  createHomeViewControlRuntimeStateResult: jest.fn(),
}));

import { createHomeViewControlRuntimeStateResult } from "../homeViewControlRuntimeStateResult";
import { useHomeViewControlRuntimeState } from "../useHomeViewControlRuntimeState";

describe("useHomeViewControlRuntimeState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createHomeViewControlRuntimeStateResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("filter/選択中のタブ/edit の state を保持して更新できる（選択中のタブの初期値は mode: null）", () => {
    const { result } = renderHook(() =>
      useHomeViewControlRuntimeState({
        filterCategory: "health",
        isEditMode: true,
      }),
    );

    expect(result.current.filterCategory).toBe("health");
    expect(result.current.isEditMode).toBe(true);
    expect(result.current.selectedViewMode).toEqual({ mode: null });
    expect(createHomeViewControlRuntimeStateResult).toHaveBeenCalledWith({
      filterCategory: "health",
      isEditMode: true,
      selectedViewMode: { mode: null },
      setFilterCategory: expect.any(Function),
      setIsEditMode: expect.any(Function),
      setSelectedViewMode: expect.any(Function),
    });

    act(() => {
      result.current.setFilterCategory("work");
      result.current.setIsEditMode(false);
      result.current.setSelectedViewMode({ mode: 5 });
    });

    expect(result.current.filterCategory).toBe("work");
    expect(result.current.isEditMode).toBe(false);
    expect(result.current.selectedViewMode).toEqual({ mode: 5 });
    expect(createHomeViewControlRuntimeStateResult).toHaveBeenLastCalledWith({
      filterCategory: "work",
      isEditMode: false,
      selectedViewMode: { mode: 5 },
      setFilterCategory: expect.any(Function),
      setIsEditMode: expect.any(Function),
      setSelectedViewMode: expect.any(Function),
    });
  });
});
