import type { Routine } from "@/types/routine";
import {
  calculateRoutineDisplayProgress,
  filterRoutineDisplayByCategory,
  getDisplayRoutinesForViewMode,
  sortDisplayRoutinesForList,
} from "../routineDisplayActions";

describe("routineDisplayActions", () => {
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

  it("view mode に応じた表示ルーティンを時刻順で返す", () => {
    expect(
      getDisplayRoutinesForViewMode({
        viewMode: "holiday",
        getHolidayRoutines: () => routines,
        getRoutinesByDayOfWeek: () => [],
      }).map((routine) => routine.id),
    ).toEqual(["r2", "r1"]);

    expect(
      getDisplayRoutinesForViewMode({
        viewMode: 1,
        getHolidayRoutines: () => [],
        getRoutinesByDayOfWeek: () => routines,
      }).map((routine) => routine.id),
    ).toEqual(["r2", "r1"]);
  });

  it("カテゴリで絞り込み、一覧順に並べ替える", () => {
    expect(filterRoutineDisplayByCategory(routines, "all")).toEqual(routines);
    expect(
      filterRoutineDisplayByCategory(routines, "health").map(
        (routine) => routine.id,
      ),
    ).toEqual(["r1"]);

    expect(
      sortDisplayRoutinesForList(routines).map((routine) => routine.id),
    ).toEqual(["r1", "r2"]);
  });

  it("進捗を計算する", () => {
    expect(calculateRoutineDisplayProgress(routines)).toEqual({
      totalMinutes: 90,
      completedMinutes: 60,
      progressPercentage: (60 / 90) * 100,
    });
    expect(calculateRoutineDisplayProgress([])).toEqual({
      totalMinutes: 0,
      completedMinutes: 0,
      progressPercentage: 0,
    });
  });
});
