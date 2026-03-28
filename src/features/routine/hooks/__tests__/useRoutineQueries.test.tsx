import { renderHook } from "@testing-library/react";
import type { Routine } from "@/types/routine";
import { HOLIDAY_DAY_VALUE } from "@/types/routine";

jest.mock("@/features/routine/storage", () => ({
  filterRoutinesByDayOfWeek: jest.fn(),
  shouldShowRoutineToday: jest.fn(),
}));

jest.mock("@/lib/holidays", () => ({
  isHoliday: jest.fn(),
}));

jest.mock("../routineQueriesResult", () => ({
  createRoutineQueriesResult: jest.fn(),
}));

import {
  filterRoutinesByDayOfWeek,
  shouldShowRoutineToday,
} from "@/features/routine/storage";
import { isHoliday } from "@/lib/holidays";
import { createRoutineQueriesResult } from "../routineQueriesResult";
import { useRoutineQueries } from "../useRoutineQueries";

const routines: Routine[] = [
  {
    id: "1",
    title: "Morning",
    startTime: "09:00",
    duration: 30,
    category: "health",
    daysOfWeek: [1],
    isCompleted: false,
    description: "",
    notificationMinutes: 10,
    sortOrder: 0,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "2",
    title: "Holiday",
    startTime: "10:00",
    duration: 15,
    category: "work",
    daysOfWeek: [HOLIDAY_DAY_VALUE],
    isCompleted: false,
    description: "",
    notificationMinutes: 5,
    sortOrder: 1,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "3",
    title: "Evening",
    startTime: "18:00",
    duration: 20,
    category: "study",
    daysOfWeek: [2],
    isCompleted: false,
    description: "",
    notificationMinutes: 0,
    sortOrder: 2,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
];

describe("useRoutineQueries", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (shouldShowRoutineToday as jest.Mock).mockImplementation(
      (routine: Routine) => routine.id !== "3",
    );
    (filterRoutinesByDayOfWeek as jest.Mock).mockReturnValue([routines[2]]);
    (isHoliday as jest.Mock).mockReturnValue(false);
    (createRoutineQueriesResult as jest.Mock).mockImplementation(
      (queries) => queries,
    );
  });

  it("query callback を構築し result builder へ委譲する", () => {
    const { result } = renderHook(() => useRoutineQueries(routines));

    expect(createRoutineQueriesResult).toHaveBeenCalledWith({
      getTodayRoutines: expect.any(Function),
      getRoutinesByDayOfWeek: expect.any(Function),
      getHolidayRoutines: expect.any(Function),
      getIsTodayHoliday: expect.any(Function),
    });

    expect(result.current.getTodayRoutines()).toEqual([
      routines[0],
      routines[1],
    ]);
    expect(shouldShowRoutineToday).toHaveBeenCalledTimes(3);

    expect(result.current.getRoutinesByDayOfWeek(2)).toEqual([routines[2]]);
    expect(filterRoutinesByDayOfWeek).toHaveBeenCalledWith(routines, 2);

    expect(result.current.getHolidayRoutines()).toEqual([routines[1]]);
    expect(result.current.getIsTodayHoliday()).toBe(false);
    expect(isHoliday).toHaveBeenCalledWith(expect.any(Date));
  });
});
