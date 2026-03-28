import type { Routine } from "@/types/routine";
import { createUseRoutinesResult } from "../useRoutinesResult";

describe("useRoutinesResult", () => {
  it("useRoutines の公開 shape を組み立てる", () => {
    const mutations = {
      addRoutine: jest.fn(),
      addRoutines: jest.fn(),
      updateRoutine: jest.fn(),
      updateRoutineGroup: jest.fn(),
      deleteRoutine: jest.fn(),
      deleteRoutineGroup: jest.fn(),
      replaceRoutinesForDays: jest.fn(),
      toggleComplete: jest.fn(),
      reorderRoutines: jest.fn(),
    };
    const queries = {
      getTodayRoutines: jest.fn(),
      getRoutinesByDayOfWeek: jest.fn(),
      getHolidayRoutines: jest.fn(),
      getIsTodayHoliday: jest.fn(),
    };
    const schedules = {
      updateServiceWorkerSchedules: jest.fn(),
    };
    const routines: Routine[] = [
      {
        id: "1",
        title: "Routine",
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
    ];

    expect(
      createUseRoutinesResult({
        isLoaded: true,
        mutations,
        queries,
        routines,
        schedules,
      }),
    ).toEqual({
      routines,
      isLoaded: true,
      ...mutations,
      ...queries,
      ...schedules,
    });
  });
});
