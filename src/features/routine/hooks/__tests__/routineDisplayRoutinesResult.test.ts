import { type Routine } from "@/types/routine";
import { createRoutineDisplayRoutinesResult } from "../routineDisplayRoutinesResult";

describe("routineDisplayRoutinesResult", () => {
  it("display routines hook の公開 shape を組み立てる", () => {
    const displayRoutines: Routine[] = [
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
    ];
    const sortedRoutines: Routine[] = [
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

    expect(
      createRoutineDisplayRoutinesResult({
        displayRoutines,
        sortedRoutines,
      }),
    ).toEqual({
      displayRoutines,
      sortedRoutines,
    });
  });
});
