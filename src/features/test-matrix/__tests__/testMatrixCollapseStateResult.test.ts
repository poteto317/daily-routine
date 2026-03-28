import { createTestMatrixCollapseStateResult } from "../testMatrixCollapseStateResult";

describe("createTestMatrixCollapseStateResult", () => {
  it("collapse state の公開 shape を返す", () => {
    const handleCollapseAll = jest.fn();
    const toggleCollapse = jest.fn();

    expect(
      createTestMatrixCollapseStateResult({
        collapseAll: true,
        collapsedIds: new Set(["auth"]),
        handleCollapseAll,
        toggleCollapse,
      }),
    ).toEqual({
      collapseAll: true,
      collapsedIds: new Set(["auth"]),
      handleCollapseAll,
      toggleCollapse,
    });
  });
});
