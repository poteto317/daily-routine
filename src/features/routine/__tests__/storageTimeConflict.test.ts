import type { Routine } from "@/types/routine";
import { hasTimeConflict } from "../storageTimeConflict";

const baseRoutine: Routine = {
  id: "r1",
  groupId: "g1",
  title: "朝活",
  startTime: "08:00",
  duration: 30,
  category: "health",
  daysOfWeek: [1],
  isCompleted: false,
  sortOrder: 0,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("hasTimeConflict", () => {
  it("同一IDのルーティンは競合対象から除外する", () => {
    const routines = [baseRoutine];
    const result = hasTimeConflict("08:00", 30, routines, "r1", [1]);
    expect(result.hasConflict).toBe(false);
  });

  it("時間と曜日が重なるルーティンを競合として検出する", () => {
    const routines = [baseRoutine];
    const result = hasTimeConflict("08:10", 30, routines, "other", [1]);
    expect(result.hasConflict).toBe(true);
    expect(result.conflictingRoutines).toHaveLength(1);
  });

  it("曜日が異なるルーティンは競合としない", () => {
    const routines = [baseRoutine]; // day=1
    const result = hasTimeConflict("08:00", 30, routines, "other", [2]);
    expect(result.hasConflict).toBe(false);
  });


});
