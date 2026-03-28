import { createHomeViewControlRuntimeStateResult } from "../homeViewControlRuntimeStateResult";

describe("homeViewControlRuntimeStateResult", () => {
  it("runtime state hook の公開 shape を組み立てる", () => {
    const setFilterCategory = jest.fn();
    const setIsEditMode = jest.fn();
    const setViewMode = jest.fn();

    expect(
      createHomeViewControlRuntimeStateResult({
        filterCategory: "health",
        isEditMode: true,
        setFilterCategory,
        setIsEditMode,
        setViewMode,
        viewMode: 3,
      }),
    ).toEqual({
      filterCategory: "health",
      isEditMode: true,
      setFilterCategory,
      setIsEditMode,
      setViewMode,
      viewMode: 3,
    });
  });
});
