import { createTestMatrixViewStateResult } from "../testMatrixViewStateResult";

describe("createTestMatrixViewStateResult", () => {
  it("collapse/filter/selection の公開 shape を返す", () => {
    const collapseState = {
      collapseAll: true,
      collapsedIds: new Set(["auth"]),
      handleCollapseAll: jest.fn(),
      toggleCollapse: jest.fn(),
    };
    const filterState = {
      filterStatus: "ok" as const,
      setFilterStatus: jest.fn(),
    };
    const selectionState = {
      selectedItemId: "1-1",
      setSelectedItemId: jest.fn(),
    };

    const result = createTestMatrixViewStateResult({
      collapseState,
      filterState,
      selectionState,
    });

    expect(result).toEqual({
      collapseAll: true,
      collapsedIds: new Set(["auth"]),
      handleCollapseAll: collapseState.handleCollapseAll,
      toggleCollapse: collapseState.toggleCollapse,
      filterStatus: "ok",
      setFilterStatus: filterState.setFilterStatus,
      selectedItemId: "1-1",
      setSelectedItemId: selectionState.setSelectedItemId,
    });
  });
});
