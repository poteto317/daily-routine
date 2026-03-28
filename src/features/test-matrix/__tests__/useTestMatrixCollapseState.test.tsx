import { act, renderHook } from "@testing-library/react";
import { createTestMatrixCollapseStateResult } from "../testMatrixCollapseStateResult";
import { useTestMatrixCollapseState } from "../useTestMatrixCollapseState";

jest.mock("../testMatrixCollapseStateResult", () => ({
  createTestMatrixCollapseStateResult: jest.fn(),
}));

jest.mock("../testMatrixViewActions", () => ({
  createCollapseAllState: jest.fn(),
  toggleCollapsedCategoryId: jest.fn(),
}));

import {
  createCollapseAllState,
  toggleCollapsedCategoryId,
} from "../testMatrixViewActions";

describe("useTestMatrixCollapseState", () => {
  const categories = [{ id: "auth", title: "認証", items: [] }];

  beforeEach(() => {
    jest.clearAllMocks();
    (createTestMatrixCollapseStateResult as jest.Mock).mockImplementation(
      (args) => args,
    );
    (toggleCollapsedCategoryId as jest.Mock).mockImplementation((prev) =>
      new Set(prev).add("auth"),
    );
    (createCollapseAllState as jest.Mock).mockReturnValue({
      collapseAll: true,
      collapsedIds: new Set(["auth"]),
    });
  });

  it("collapse 状態と操作を管理する", () => {
    const { result } = renderHook(() => useTestMatrixCollapseState());

    expect(createTestMatrixCollapseStateResult).toHaveBeenCalledWith({
      collapseAll: false,
      collapsedIds: new Set(),
      handleCollapseAll: expect.any(Function),
      toggleCollapse: expect.any(Function),
    });

    act(() => {
      result.current.toggleCollapse("auth");
      result.current.handleCollapseAll(categories);
    });

    expect(toggleCollapsedCategoryId).toHaveBeenCalledWith(new Set(), "auth");
    expect(createCollapseAllState).toHaveBeenCalledWith(false, categories);
    expect(result.current.collapseAll).toBe(true);
    expect(result.current.collapsedIds).toEqual(new Set(["auth"]));
    expect(createTestMatrixCollapseStateResult).toHaveBeenLastCalledWith({
      collapseAll: true,
      collapsedIds: new Set(["auth"]),
      handleCollapseAll: expect.any(Function),
      toggleCollapse: expect.any(Function),
    });
  });
});
