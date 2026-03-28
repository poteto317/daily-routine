import { renderHook } from "@testing-library/react";

jest.mock("../testMatrixPageActions", () => ({
  createTestMatrixPageActions: jest.fn(),
}));

jest.mock("../testMatrixPageStateResult", () => ({
  createTestMatrixPageStateResult: jest.fn(),
}));

jest.mock("../useTestMatrixDataState", () => ({
  useTestMatrixDataState: jest.fn(),
}));

jest.mock("../useTestMatrixDerivedState", () => ({
  useTestMatrixDerivedState: jest.fn(),
}));

jest.mock("../useTestMatrixViewState", () => ({
  useTestMatrixViewState: jest.fn(),
}));

import { createTestMatrixPageActions } from "../testMatrixPageActions";
import { createTestMatrixPageStateResult } from "../testMatrixPageStateResult";
import { useTestMatrixDataState } from "../useTestMatrixDataState";
import { useTestMatrixDerivedState } from "../useTestMatrixDerivedState";
import { useTestMatrixPageState } from "../useTestMatrixPageState";
import { useTestMatrixViewState } from "../useTestMatrixViewState";

describe("useTestMatrixPageState composition", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useTestMatrixViewState as jest.Mock).mockReturnValue({
      collapseAll: false,
      collapsedIds: new Set(),
      filterStatus: "all",
      handleCollapseAll: jest.fn(),
      selectedItemId: null,
      setFilterStatus: jest.fn(),
      setSelectedItemId: jest.fn(),
      toggleCollapse: jest.fn(),
    });
    (useTestMatrixDataState as jest.Mock).mockReturnValue({
      categories: [],
      detailData: {},
      resetAll: jest.fn(() => true),
      toggleDetailStatus: jest.fn(),
      toggleStatus: jest.fn(),
      updateDetailNote: jest.fn(),
      updateNote: jest.fn(),
    });
    (useTestMatrixDerivedState as jest.Mock).mockReturnValue({
      overviewStats: {
        totalCount: 0,
        okCount: 0,
        ngCount: 0,
        uncheckedCount: 0,
        progressPct: 0,
      },
      selectedItem: null,
    });
    (createTestMatrixPageActions as jest.Mock).mockReturnValue({
      handleCollapseAll: jest.fn(),
    });
    (createTestMatrixPageStateResult as jest.Mock).mockReturnValue({
      composed: true,
    });
  });

  it("view/data/derived/actions/result を compose する", () => {
    const confirmReset = jest.fn(() => true);
    const { result } = renderHook(() =>
      useTestMatrixPageState({
        confirmReset,
        resetConfirmMessage: "reset?",
      }),
    );

    expect(useTestMatrixDataState).toHaveBeenCalledWith({
      confirmReset,
      resetConfirmMessage: "reset?",
      selectedItemId: null,
    });
    expect(useTestMatrixDerivedState).toHaveBeenCalledWith({
      categories: [],
      detailData: {},
      selectedItemId: null,
    });
    expect(createTestMatrixPageActions).toHaveBeenCalledWith({
      categories: [],
      handleCollapseAllBase: expect.any(Function),
    });
    expect(createTestMatrixPageStateResult).toHaveBeenCalledWith(
      expect.objectContaining({
        categories: [],
        detailData: {},
        selectedItem: null,
      }),
    );
    expect(result.current).toEqual({ composed: true });
  });
});
