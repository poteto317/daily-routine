import { createHomeViewControlRuntimeStateResult } from "../homeViewControlRuntimeStateResult";

describe("homeViewControlRuntimeStateResult", () => {
  it("runtime state hook の公開 shape を組み立てる", () => {
    const setFilterCategory = jest.fn();
    const setIsEditMode = jest.fn();
    const setSelectedViewMode = jest.fn();
    const selectedViewMode = { mode: 3 };

    expect(
      createHomeViewControlRuntimeStateResult({
        filterCategory: "health",
        isEditMode: true,
        selectedViewMode,
        setFilterCategory,
        setIsEditMode,
        setSelectedViewMode,
      }),
    ).toEqual({
      filterCategory: "health",
      isEditMode: true,
      selectedViewMode,
      setFilterCategory,
      setIsEditMode,
      setSelectedViewMode,
    });
  });
});
