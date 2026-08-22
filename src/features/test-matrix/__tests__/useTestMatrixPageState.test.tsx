import { act, renderHook } from "@testing-library/react";

jest.mock("../testMatrixViewActions", () => ({
  createCollapseAllState: jest.fn(),
  toggleCollapsedCategoryId: jest.fn(),
}));

jest.mock("../testMatrixDerivedSelectors", () => ({
  findSelectedTestMatrixItem: jest.fn(),
}));

jest.mock("../matrixComputations", () => ({
  calculateOverviewStats: jest.fn(),
}));

jest.mock("../useTestMatrixDataState", () => ({
  useTestMatrixDataState: jest.fn(),
}));

import { calculateOverviewStats } from "../matrixComputations";
import {
  createCollapseAllState,
  toggleCollapsedCategoryId,
} from "../testMatrixViewActions";
import { findSelectedTestMatrixItem } from "../testMatrixDerivedSelectors";
import { useTestMatrixDataState } from "../useTestMatrixDataState";
import { useTestMatrixPageState } from "../useTestMatrixPageState";

const mockCalculateOverviewStats =
  calculateOverviewStats as jest.MockedFunction<typeof calculateOverviewStats>;
const mockToggleCollapsedCategoryId =
  toggleCollapsedCategoryId as jest.MockedFunction<
    typeof toggleCollapsedCategoryId
  >;
const mockCreateCollapseAllState =
  createCollapseAllState as jest.MockedFunction<typeof createCollapseAllState>;
const mockFindSelectedTestMatrixItem =
  findSelectedTestMatrixItem as jest.MockedFunction<
    typeof findSelectedTestMatrixItem
  >;
const mockUseTestMatrixDataState =
  useTestMatrixDataState as jest.MockedFunction<typeof useTestMatrixDataState>;

describe("useTestMatrixPageState", () => {
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
  const detailData = {
    "1-1": [
      {
        id: "case-1",
        scenario: "正常系",
        expected: "成功する",
        pc: "unchecked" as const,
        sp: "unchecked" as const,
        note: "",
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCalculateOverviewStats.mockReturnValue({
      totalCount: 1,
      okCount: 0,
      ngCount: 0,
      uncheckedCount: 1,
      progressPct: 0,
    });
    mockToggleCollapsedCategoryId.mockImplementation((prev) => new Set(prev));
    mockCreateCollapseAllState.mockReturnValue({
      collapseAll: true,
      collapsedIds: new Set(["auth"]),
    });
    mockUseTestMatrixDataState.mockReturnValue({
      categories,
      detailData,
      resetAll: jest.fn(() => true),
      toggleDetailStatus: jest.fn(),
      toggleStatus: jest.fn(),
      updateDetailNote: jest.fn(),
      updateNote: jest.fn(),
    });
    mockFindSelectedTestMatrixItem.mockReturnValue(categories[0].items[0]);
  });

  it("data hook を使って overview と selected item を組み立てる", () => {
    const { result } = renderHook(() =>
      useTestMatrixPageState({ resetConfirmMessage: "reset?" }),
    );

    expect(result.current.categories).toEqual(categories);
    expect(result.current.detailData).toEqual(detailData);
    expect(mockUseTestMatrixDataState).toHaveBeenCalledWith({
      confirmReset: expect.any(Function),
      resetConfirmMessage: "reset?",
      selectedItemId: null,
    });
    expect(result.current.selectedItem).toEqual(categories[0].items[0]);
  });

  it("折りたたみ状態を更新できる", () => {
    const nextCollapsedIds = new Set(["auth"]);
    mockToggleCollapsedCategoryId.mockReturnValue(nextCollapsedIds);

    const { result } = renderHook(() =>
      useTestMatrixPageState({ resetConfirmMessage: "reset?" }),
    );

    act(() => {
      result.current.toggleCollapse("auth");
    });

    expect(mockToggleCollapsedCategoryId).toHaveBeenCalled();
    expect(result.current.collapsedIds).toEqual(nextCollapsedIds);
  });

  it("一括折りたたみ状態を更新できる", () => {
    const nextCollapsedIds = new Set(["auth"]);
    mockCreateCollapseAllState.mockReturnValue({
      collapseAll: true,
      collapsedIds: nextCollapsedIds,
    });

    const { result } = renderHook(() =>
      useTestMatrixPageState({ resetConfirmMessage: "reset?" }),
    );

    act(() => {
      result.current.handleCollapseAll();
    });

    expect(mockCreateCollapseAllState).toHaveBeenCalledWith(false, categories);
    expect(result.current.collapseAll).toBe(true);
    expect(result.current.collapsedIds).toEqual(nextCollapsedIds);
  });

  it("確認時のみリセットする", () => {
    const confirmReset = jest.fn(() => true);
    const resetAll = jest.fn(() => true);
    mockUseTestMatrixDataState.mockReturnValue({
      categories,
      detailData,
      resetAll,
      toggleDetailStatus: jest.fn(),
      toggleStatus: jest.fn(),
      updateDetailNote: jest.fn(),
      updateNote: jest.fn(),
    });
    const { result } = renderHook(() =>
      useTestMatrixPageState({
        confirmReset,
        resetConfirmMessage: "reset?",
      }),
    );

    let didReset = false;
    act(() => {
      didReset = result.current.resetAll();
    });

    expect(resetAll).toHaveBeenCalled();
    expect(didReset).toBe(true);
  });

  it("リセット確認をキャンセルしたら状態を変更しない", () => {
    const resetAll = jest.fn(() => false);
    mockUseTestMatrixDataState.mockReturnValue({
      categories,
      detailData,
      resetAll,
      toggleDetailStatus: jest.fn(),
      toggleStatus: jest.fn(),
      updateDetailNote: jest.fn(),
      updateNote: jest.fn(),
    });
    const { result } = renderHook(() =>
      useTestMatrixPageState({
        resetConfirmMessage: "reset?",
      }),
    );

    let didReset = true;
    act(() => {
      didReset = result.current.resetAll();
    });

    expect(resetAll).toHaveBeenCalled();
    expect(didReset).toBe(false);
  });
});
