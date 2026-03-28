import { type Routine } from "@/types/routine";
import { createRoutineDisplayProgressResult } from "../routineDisplayProgressResult";

describe("routineDisplayProgressResult", () => {
  it("display progress hook の公開 shape を組み立てる", () => {
    const todayRoutines: Routine[] = [
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

    expect(
      createRoutineDisplayProgressResult({
        todayRoutines,
        totalMinutes: 30,
        completedMinutes: 0,
        progressPercentage: 0,
      }),
    ).toEqual({
      todayRoutines,
      totalMinutes: 30,
      completedMinutes: 0,
      progressPercentage: 0,
    });
  });
});
