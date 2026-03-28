import type { Routine } from "@/types/routine";
import {
  applyDailyProgressToRoutines,
  buildDailyProgressFromRoutines,
  createDailyResetProgress,
  sortRoutinesByOrder,
  stripCompletionState,
} from "../routineStateModel";

const baseRoutine: Routine = {
  id: "r1",
  title: "朝活",
  startTime: "08:00",
  duration: 30,
  category: "health",
  daysOfWeek: [1],
  isCompleted: true,
  sortOrder: 1,
  createdAt: "2026-02-13T00:00:00.000Z",
  updatedAt: "2026-02-13T00:00:00.000Z",
};

describe("routineStateModel progress", () => {
  it("stripCompletionStateは完了状態を除去", () => {
    expect(stripCompletionState([baseRoutine])[0]?.isCompleted).toBe(false);
  });

  it("sortRoutinesByOrderはsortOrder順", () => {
    const sorted = sortRoutinesByOrder([
      { ...baseRoutine, id: "r2", sortOrder: 2 },
      { ...baseRoutine, id: "r1", sortOrder: 1 },
    ]);
    expect(sorted.map((item) => item.id)).toEqual(["r1", "r2"]);
  });

  it("createDailyResetProgressは空進捗", () => {
    const progress = createDailyResetProgress("2026-02-13");
    expect(progress.date).toBe("2026-02-13");
    expect(progress.completedRoutineIds).toEqual([]);
  });

  it("applyDailyProgressToRoutinesは完了IDを反映", () => {
    const routines = [
      { ...baseRoutine, id: "r1", isCompleted: false },
      { ...baseRoutine, id: "r2", isCompleted: false },
    ];
    const applied = applyDailyProgressToRoutines(routines, ["r2"]);
    expect(applied.find((item) => item.id === "r1")?.isCompleted).toBe(false);
    expect(applied.find((item) => item.id === "r2")?.isCompleted).toBe(true);
  });

  it("buildDailyProgressFromRoutinesは完了IDのみ収集", () => {
    const progress = buildDailyProgressFromRoutines(
      [
        { ...baseRoutine, id: "a", isCompleted: true },
        { ...baseRoutine, id: "b", isCompleted: false },
      ],
      "2026-02-13",
      null,
    );
    expect(progress.completedRoutineIds).toEqual(["a"]);
  });
});
