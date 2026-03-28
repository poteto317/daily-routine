import { renderHook } from "@testing-library/react";
import { type Routine } from "@/types/routine";

jest.mock("../routineDisplayActions", () => ({
  calculateRoutineDisplayProgress: jest.fn(),
}));

jest.mock("../routineDisplayProgressResult", () => ({
  createRoutineDisplayProgressResult: jest.fn(),
}));

import { calculateRoutineDisplayProgress } from "../routineDisplayActions";
import { createRoutineDisplayProgressResult } from "../routineDisplayProgressResult";
import { useRoutineDisplayProgress } from "../useRoutineDisplayProgress";

describe("useRoutineDisplayProgress", () => {
  const routines: Routine[] = [
    {
      id: "r1",
      title: "A",
      startTime: "09:00",
      duration: 30,
      category: "health",
      daysOfWeek: [1],
      isCompleted: false,
      sortOrder: 0,
      createdAt: "2026-02-12T00:00:00.000Z",
      updatedAt: "2026-02-12T00:00:00.000Z",
    },
    {
      id: "r2",
      title: "B",
      startTime: "08:00",
      duration: 60,
      category: "work",
      daysOfWeek: [1],
      isCompleted: true,
      sortOrder: 1,
      createdAt: "2026-02-12T00:00:00.000Z",
      updatedAt: "2026-02-12T00:00:00.000Z",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (calculateRoutineDisplayProgress as jest.Mock).mockReturnValue({
      totalMinutes: 90,
      completedMinutes: 60,
      progressPercentage: 66.6666666667,
    });
    (createRoutineDisplayProgressResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("当日ルーティンから進捗値を計算し result builder へ委譲する", () => {
    const getTodayRoutines = jest.fn(() => [...routines]);
    const { result } = renderHook(() =>
      useRoutineDisplayProgress({
        getTodayRoutines,
      }),
    );

    expect(getTodayRoutines).toHaveBeenCalled();
    expect(calculateRoutineDisplayProgress).toHaveBeenCalledWith(routines);
    expect(createRoutineDisplayProgressResult).toHaveBeenCalledWith({
      todayRoutines: routines,
      totalMinutes: 90,
      completedMinutes: 60,
      progressPercentage: 66.6666666667,
    });
    expect(result.current.todayRoutines).toEqual(routines);
    expect(result.current.totalMinutes).toBe(90);
    expect(result.current.completedMinutes).toBe(60);
    expect(result.current.progressPercentage).toBeCloseTo(66.666, 2);
  });
});
