import { createRoutineDisplayResult } from "../routineDisplayResult";

describe("routineDisplayResult", () => {
  it("display hook の公開 shape を組み立てる", () => {
    expect(
      createRoutineDisplayResult({
        displayRoutines: [{ id: "display" } as never],
        todayRoutines: [{ id: "today" } as never],
        sortedRoutines: [{ id: "sorted" } as never],
        totalMinutes: 90,
        completedMinutes: 60,
        progressPercentage: 66.666,
      }),
    ).toEqual({
      displayRoutines: [{ id: "display" }],
      todayRoutines: [{ id: "today" }],
      sortedRoutines: [{ id: "sorted" }],
      totalMinutes: 90,
      completedMinutes: 60,
      progressPercentage: 66.666,
    });
  });
});
