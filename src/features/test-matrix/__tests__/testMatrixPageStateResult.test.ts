import { createTestMatrixPageStateResult } from "../testMatrixPageStateResult";

describe("testMatrixPageStateResult", () => {
  it("page の公開 state を組み立てる", () => {
    const categories = [
      {
        id: "auth",
        title: "認証",
        items: [],
      },
    ];
    const detailData = {};
    const overviewStats = {
      totalCount: 1,
      okCount: 0,
      ngCount: 0,
      uncheckedCount: 1,
      progressPct: 0,
    };
    const result = createTestMatrixPageStateResult({
      categories,
      collapseAll: false,
      collapsedIds: new Set(),
      detailData,
      filterStatus: "all",
      handleCollapseAll: jest.fn(),
      overviewStats,
      resetAll: jest.fn(() => true),
      selectedItem: null,
      selectedItemId: null,
      setFilterStatus: jest.fn(),
      setSelectedItemId: jest.fn(),
      toggleCollapse: jest.fn(),
      toggleDetailStatus: jest.fn(),
      toggleStatus: jest.fn(),
      updateDetailNote: jest.fn(),
      updateNote: jest.fn(),
    });

    expect(result).toEqual(
      expect.objectContaining({
        categories,
        detailData,
        overviewStats,
        filterStatus: "all",
      }),
    );
  });
});
