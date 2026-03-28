import { renderHook } from "@testing-library/react";
import { type Routine } from "@/types/routine";

jest.mock("../routineDisplayActions", () => ({
  filterRoutineDisplayByCategory: jest.fn(),
  getDisplayRoutinesForViewMode: jest.fn(),
  sortDisplayRoutinesForList: jest.fn(),
}));

jest.mock("../routineDisplayRoutinesResult", () => ({
  createRoutineDisplayRoutinesResult: jest.fn(),
}));

import {
  filterRoutineDisplayByCategory,
  getDisplayRoutinesForViewMode,
  sortDisplayRoutinesForList,
} from "../routineDisplayActions";
import { createRoutineDisplayRoutinesResult } from "../routineDisplayRoutinesResult";
import { useRoutineDisplayRoutines } from "../useRoutineDisplayRoutines";

describe("useRoutineDisplayRoutines", () => {
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
    (getDisplayRoutinesForViewMode as jest.Mock).mockReturnValue([
      routines[1],
      routines[0],
    ]);
    (filterRoutineDisplayByCategory as jest.Mock).mockImplementation(
      (displayRoutines: Routine[], filterCategory: string) =>
        filterCategory === "all"
          ? displayRoutines
          : displayRoutines.filter(
              (routine) => routine.category === filterCategory,
            ),
    );
    (sortDisplayRoutinesForList as jest.Mock).mockImplementation(
      (filteredRoutines: Routine[]) => [...filteredRoutines].reverse(),
    );
    (createRoutineDisplayRoutinesResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("表示 routines を計算して result builder へ委譲する", () => {
    const getHolidayRoutines = jest.fn(() => [...routines]);
    const getRoutinesByDayOfWeek = jest.fn(() => []);
    const { result } = renderHook(() =>
      useRoutineDisplayRoutines({
        viewMode: "holiday",
        filterCategory: "all",
        getHolidayRoutines,
        getRoutinesByDayOfWeek,
      }),
    );

    expect(getDisplayRoutinesForViewMode).toHaveBeenCalledWith({
      viewMode: "holiday",
      getHolidayRoutines,
      getRoutinesByDayOfWeek,
    });
    expect(filterRoutineDisplayByCategory).toHaveBeenCalledWith(
      [routines[1], routines[0]],
      "all",
    );
    expect(sortDisplayRoutinesForList).toHaveBeenCalledWith([
      routines[1],
      routines[0],
    ]);
    expect(createRoutineDisplayRoutinesResult).toHaveBeenCalledWith({
      displayRoutines: [routines[1], routines[0]],
      sortedRoutines: [routines[0], routines[1]],
    });
    expect(result.current).toEqual({
      displayRoutines: [routines[1], routines[0]],
      sortedRoutines: [routines[0], routines[1]],
    });
  });

  it("filterCategory を filtered/sorted routines へ反映する", () => {
    const { result } = renderHook(() =>
      useRoutineDisplayRoutines({
        viewMode: 1,
        filterCategory: "health",
        getHolidayRoutines: () => [],
        getRoutinesByDayOfWeek: () => [...routines],
      }),
    );

    expect(filterRoutineDisplayByCategory).toHaveBeenCalledWith(
      [routines[1], routines[0]],
      "health",
    );
    expect(sortDisplayRoutinesForList).toHaveBeenCalledWith([routines[0]]);
    expect(result.current.sortedRoutines).toEqual([routines[0]]);
  });
});
