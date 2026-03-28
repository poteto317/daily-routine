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

  it("filter/view/edit state を保持して更新できる", () => {
    const { result } = renderHook(() =>
      useHomeViewControlRuntimeState({
        filterCategory: "health",
        isEditMode: true,
        viewMode: 3,
      }),
    );

    expect(result.current.filterCategory).toBe("health");
    expect(result.current.isEditMode).toBe(true);
    expect(result.current.viewMode).toBe(3);
    expect(createHomeViewControlRuntimeStateResult).toHaveBeenCalledWith({
      filterCategory: "health",
      isEditMode: true,
      setFilterCategory: expect.any(Function),
      setIsEditMode: expect.any(Function),
      setViewMode: expect.any(Function),
      viewMode: 3,
    });

    act(() => {
      result.current.setFilterCategory("work");
      result.current.setIsEditMode(false);
      result.current.setViewMode(5);
    });

    expect(result.current.filterCategory).toBe("work");
    expect(result.current.isEditMode).toBe(false);
    expect(result.current.viewMode).toBe(5);
    expect(createHomeViewControlRuntimeStateResult).toHaveBeenLastCalledWith({
      filterCategory: "work",
      isEditMode: false,
      setFilterCategory: expect.any(Function),
      setIsEditMode: expect.any(Function),
      setViewMode: expect.any(Function),
      viewMode: 5,
    });
  });
});
