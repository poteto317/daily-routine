import { renderHook } from "@testing-library/react";

jest.mock("../useHomeViewControlState", () => ({
  useHomeViewControlState: jest.fn(),
}));

jest.mock("../useHomeViewControlActions", () => ({
  useHomeViewControlActions: jest.fn(),
}));

jest.mock("../homeViewControlsResult", () => ({
  createHomeViewControlsResult: jest.fn(),
}));

import { createHomeViewControlsResult } from "../homeViewControlsResult";
import { useHomeViewControlActions } from "../useHomeViewControlActions";
import { useHomeViewControlState } from "../useHomeViewControlState";
import { useHomeViewControls } from "../useHomeViewControls";

describe("useHomeViewControls", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useHomeViewControlState as jest.Mock).mockReturnValue({
      filterCategory: "health",
      isEditMode: false,
      setFilterCategory: jest.fn(),
      setIsEditMode: jest.fn(),
      setViewMode: jest.fn(),
      viewMode: 3,
    });
    (useHomeViewControlActions as jest.Mock).mockReturnValue({
      setFilterCategoryAction: jest.fn(),
      setViewModeAction: jest.fn(),
      toggleEditModeAction: jest.fn(),
    });
    (createHomeViewControlsResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("state hook と actions hook を compose し result builder へ委譲する", () => {
    const getIsTodayHoliday = jest.fn(() => false);
    const { result } = renderHook(() =>
      useHomeViewControls({
        canUseWindow: true,
        currentDayOfWeek: 3,
        getIsTodayHoliday,
      }),
    );

    expect(useHomeViewControlState).toHaveBeenCalledWith({
      canUseWindow: true,
      currentDayOfWeek: 3,
      getIsTodayHoliday,
    });
    expect(useHomeViewControlActions).toHaveBeenCalledWith({
      isEditMode: false,
      setFilterCategory: (useHomeViewControlState as jest.Mock).mock.results[0]
        .value.setFilterCategory,
      setIsEditMode: (useHomeViewControlState as jest.Mock).mock.results[0]
        .value.setIsEditMode,
      setViewMode: (useHomeViewControlState as jest.Mock).mock.results[0].value
        .setViewMode,
    });
    expect(createHomeViewControlsResult).toHaveBeenCalledWith({
      filterCategory: "health",
      isEditMode: false,
      setFilterCategoryAction: (useHomeViewControlActions as jest.Mock).mock
        .results[0].value.setFilterCategoryAction,
      setViewModeAction: (useHomeViewControlActions as jest.Mock).mock
        .results[0].value.setViewModeAction,
      toggleEditModeAction: (useHomeViewControlActions as jest.Mock).mock
        .results[0].value.toggleEditModeAction,
      viewMode: 3,
    });
    expect(result.current).toEqual({
      filterCategory: "health",
      isEditMode: false,
      setFilterCategoryAction: (useHomeViewControlActions as jest.Mock).mock
        .results[0].value.setFilterCategoryAction,
      setViewModeAction: (useHomeViewControlActions as jest.Mock).mock
        .results[0].value.setViewModeAction,
      toggleEditModeAction: (useHomeViewControlActions as jest.Mock).mock
        .results[0].value.toggleEditModeAction,
      viewMode: 3,
    });
  });
});
