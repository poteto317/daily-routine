import { renderHook } from "@testing-library/react";

jest.mock("../useHomeViewControlInitialState", () => ({
  useHomeViewControlInitialState: jest.fn(),
}));

jest.mock("../useHomeViewControlRuntimeState", () => ({
  useHomeViewControlRuntimeState: jest.fn(),
}));

import { useHomeViewControlState } from "../useHomeViewControlState";
import { useHomeViewControlInitialState } from "../useHomeViewControlInitialState";
import { useHomeViewControlRuntimeState } from "../useHomeViewControlRuntimeState";

describe("useHomeViewControlState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (useHomeViewControlInitialState as jest.Mock).mockReturnValue({
      filterCategory: "health",
      isEditMode: false,
      viewMode: 3,
    });
    (useHomeViewControlRuntimeState as jest.Mock).mockReturnValue({
      filterCategory: "health",
      isEditMode: false,
      setFilterCategory: jest.fn(),
      setIsEditMode: jest.fn(),
      setViewMode: jest.fn(),
      viewMode: 3,
    });
  });

  it("initial state hook と runtime state hook を compose する", () => {
    const getIsTodayHoliday = jest.fn(() => false);
    const { result } = renderHook(() =>
      useHomeViewControlState({
        canUseWindow: true,
        currentDayOfWeek: 3,
        getIsTodayHoliday,
      }),
    );

    expect(useHomeViewControlInitialState).toHaveBeenCalledWith({
      canUseWindow: true,
      currentDayOfWeek: 3,
      getIsTodayHoliday,
    });
    expect(useHomeViewControlRuntimeState).toHaveBeenCalledWith({
      filterCategory: "health",
      isEditMode: false,
      viewMode: 3,
    });
    expect(result.current.filterCategory).toBe("health");
    expect(result.current.isEditMode).toBe(false);
    expect(result.current.viewMode).toBe(3);
  });
});
