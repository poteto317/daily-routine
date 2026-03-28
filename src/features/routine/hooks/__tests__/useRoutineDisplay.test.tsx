import { renderHook } from "@testing-library/react";
import { createRoutineDisplayResult } from "../routineDisplayResult";
import { useRoutineDisplay } from "../useRoutineDisplay";

jest.mock("../useRoutineDisplayRoutines", () => ({
  useRoutineDisplayRoutines: jest.fn(),
}));

jest.mock("../useRoutineDisplayProgress", () => ({
  useRoutineDisplayProgress: jest.fn(),
}));

jest.mock("../routineDisplayResult", () => ({
  createRoutineDisplayResult: jest.fn(),
}));

import { useRoutineDisplayProgress } from "../useRoutineDisplayProgress";
import { useRoutineDisplayRoutines } from "../useRoutineDisplayRoutines";

describe("useRoutineDisplay", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRoutineDisplayRoutines as jest.Mock).mockReturnValue({
      displayRoutines: [{ id: "display" }],
      sortedRoutines: [{ id: "sorted" }],
    });
    (useRoutineDisplayProgress as jest.Mock).mockReturnValue({
      todayRoutines: [{ id: "today" }],
      totalMinutes: 90,
      completedMinutes: 60,
      progressPercentage: 66.666,
    });
    (createRoutineDisplayResult as jest.Mock).mockReturnValue({
      composed: true,
    });
  });

  it("routines/progress/result builder を compose する", () => {
    const getHolidayRoutines = jest.fn();
    const getRoutinesByDayOfWeek = jest.fn();
    const getTodayRoutines = jest.fn();

    const { result } = renderHook(() =>
      useRoutineDisplay({
        viewMode: "holiday",
        filterCategory: "all",
        getHolidayRoutines,
        getRoutinesByDayOfWeek,
        getTodayRoutines,
      }),
    );

    expect(useRoutineDisplayRoutines).toHaveBeenCalledWith({
      viewMode: "holiday",
      filterCategory: "all",
      getHolidayRoutines,
      getRoutinesByDayOfWeek,
    });
    expect(useRoutineDisplayProgress).toHaveBeenCalledWith({
      getTodayRoutines,
    });
    expect(createRoutineDisplayResult).toHaveBeenCalledWith({
      displayRoutines: [{ id: "display" }],
      todayRoutines: [{ id: "today" }],
      sortedRoutines: [{ id: "sorted" }],
      totalMinutes: 90,
      completedMinutes: 60,
      progressPercentage: 66.666,
    });
    expect(result.current).toEqual({ composed: true });
  });
});
