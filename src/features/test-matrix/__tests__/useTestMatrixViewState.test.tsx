import { renderHook } from "@testing-library/react";

jest.mock("../testMatrixViewStateResult", () => ({
  createTestMatrixViewStateResult: jest.fn(),
}));

import { useTestMatrixViewState } from "../useTestMatrixViewState";

jest.mock("../useTestMatrixCollapseState", () => ({
  useTestMatrixCollapseState: jest.fn(),
}));

jest.mock("../useTestMatrixFilterState", () => ({
  useTestMatrixFilterState: jest.fn(),
}));

jest.mock("../useTestMatrixSelectionState", () => ({
  useTestMatrixSelectionState: jest.fn(),
}));

import { useTestMatrixCollapseState } from "../useTestMatrixCollapseState";
import { useTestMatrixFilterState } from "../useTestMatrixFilterState";
import { useTestMatrixSelectionState } from "../useTestMatrixSelectionState";
import { createTestMatrixViewStateResult } from "../testMatrixViewStateResult";

describe("useTestMatrixViewState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const collapseState = {
      collapseAll: true,
      collapsedIds: new Set(["auth"]),
      handleCollapseAll: jest.fn(),
      toggleCollapse: jest.fn(),
    };
    const filterState = {
      filterStatus: "ok",
      setFilterStatus: jest.fn(),
    };
    const selectionState = {
      selectedItemId: "1-1",
      setSelectedItemId: jest.fn(),
    };
    (useTestMatrixCollapseState as jest.Mock).mockReturnValue(collapseState);
    (useTestMatrixFilterState as jest.Mock).mockReturnValue(filterState);
    (useTestMatrixSelectionState as jest.Mock).mockReturnValue(selectionState);
    (createTestMatrixViewStateResult as jest.Mock).mockReturnValue({
      ...collapseState,
      ...filterState,
      ...selectionState,
    });
  });

  it("collapse/filter/selection state hooks を compose する", () => {
    const { result } = renderHook(() => useTestMatrixViewState());

    expect(useTestMatrixCollapseState).toHaveBeenCalledTimes(1);
    expect(useTestMatrixFilterState).toHaveBeenCalledTimes(1);
    expect(useTestMatrixSelectionState).toHaveBeenCalledTimes(1);
    expect(createTestMatrixViewStateResult).toHaveBeenCalledWith({
      collapseState: expect.objectContaining({
        collapseAll: true,
        collapsedIds: new Set(["auth"]),
      }),
      filterState: expect.objectContaining({
        filterStatus: "ok",
      }),
      selectionState: expect.objectContaining({
        selectedItemId: "1-1",
      }),
    });
    expect(result.current).toEqual({
      collapseAll: true,
      collapsedIds: new Set(["auth"]),
      handleCollapseAll: expect.any(Function),
      toggleCollapse: expect.any(Function),
      filterStatus: "ok",
      setFilterStatus: expect.any(Function),
      selectedItemId: "1-1",
      setSelectedItemId: expect.any(Function),
    });
  });
});
