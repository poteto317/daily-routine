import { renderHook } from "@testing-library/react";

jest.mock("../testMatrixDerivedStateResult", () => ({
  createTestMatrixDerivedStateResult: jest.fn(),
}));

import { useTestMatrixDerivedState } from "../useTestMatrixDerivedState";

jest.mock("../testMatrixDerivedSelectors", () => ({
  findSelectedTestMatrixItem: jest.fn(),
}));

jest.mock("../matrixComputations", () => ({
  calculateOverviewStats: jest.fn(),
}));

import { calculateOverviewStats } from "../matrixComputations";
import { createTestMatrixDerivedStateResult } from "../testMatrixDerivedStateResult";
import { findSelectedTestMatrixItem } from "../testMatrixDerivedSelectors";

describe("useTestMatrixDerivedState", () => {
  it("selected item と overview stats を組み立てる", () => {
    const categories = [
      {
        id: "auth",
        title: "認証",
        items: [
          {
            id: "1-1",
            label: "ログイン",
            pc: "unchecked" as const,
            sp: "unchecked" as const,
            note: "",
          },
        ],
      },
    ];
    const detailData = { "1-1": [] };
    const selectedItem = categories[0].items[0];
    const overviewStats = {
      totalCount: 1,
      okCount: 0,
      ngCount: 0,
      uncheckedCount: 1,
      progressPct: 0,
    };
    (findSelectedTestMatrixItem as jest.Mock).mockReturnValue(selectedItem);
    (calculateOverviewStats as jest.Mock).mockReturnValue(overviewStats);
    (createTestMatrixDerivedStateResult as jest.Mock).mockReturnValue({
      overviewStats,
      selectedItem,
    });

    const { result } = renderHook(() =>
      useTestMatrixDerivedState({
        categories,
        detailData,
        selectedItemId: "1-1",
      }),
    );

    expect(findSelectedTestMatrixItem).toHaveBeenCalledWith(categories, "1-1");
    expect(calculateOverviewStats).toHaveBeenCalledWith(categories, detailData);
    expect(createTestMatrixDerivedStateResult).toHaveBeenCalledWith({
      selectedItem,
      overviewStats,
    });
    expect(result.current).toEqual({
      selectedItem,
      overviewStats,
    });
  });
});
