import { renderHook } from "@testing-library/react";

jest.mock("../homeViewControlStateActions", () => ({
  createInitialHomeViewControlState: jest.fn(),
}));

import { createInitialHomeViewControlState } from "../homeViewControlStateActions";
import { useHomeViewControlInitialState } from "../useHomeViewControlInitialState";

describe("useHomeViewControlInitialState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createInitialHomeViewControlState as jest.Mock).mockReturnValue({
      filterCategory: "health",
      isEditMode: false,
      viewMode: 3,
    });
  });

  it("初期 control state を一度だけ構築して保持する", () => {
    const getIsTodayHoliday = jest.fn(() => false);
    const { result, rerender } = renderHook(
      ({ currentDayOfWeek }) =>
        useHomeViewControlInitialState({
          canUseWindow: true,
          currentDayOfWeek,
          getIsTodayHoliday,
        }),
      {
        initialProps: { currentDayOfWeek: 3 },
      },
    );

    expect(createInitialHomeViewControlState).toHaveBeenCalledWith({
      canUseWindow: true,
      currentDayOfWeek: 3,
      getIsTodayHoliday,
    });
    expect(result.current).toEqual({
      filterCategory: "health",
      isEditMode: false,
      viewMode: 3,
    });

    rerender({ currentDayOfWeek: 5 });

    expect(createInitialHomeViewControlState).toHaveBeenCalledTimes(1);
  });
});
