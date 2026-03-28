import { createHomeViewControlsResult } from "../homeViewControlsResult";

describe("homeViewControlsResult", () => {
  it("home view controls の公開 shape を組み立てる", () => {
    const setFilterCategoryAction = jest.fn();
    const setViewModeAction = jest.fn();
    const toggleEditModeAction = jest.fn();

    expect(
      createHomeViewControlsResult({
        filterCategory: "health",
        isEditMode: false,
        setFilterCategoryAction,
        setViewModeAction,
        toggleEditModeAction,
        viewMode: 3,
      }),
    ).toEqual({
      filterCategory: "health",
      isEditMode: false,
      setFilterCategoryAction,
      setViewModeAction,
      toggleEditModeAction,
      viewMode: 3,
    });
  });
});
