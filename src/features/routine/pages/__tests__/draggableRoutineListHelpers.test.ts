import { reorderRoutinesWithSequentialTimes } from "../draggableRoutineListHelpers";
import type { Routine } from "@/types/routine";

const makeRoutine = (id: string, startTime: string): Routine => ({
  id,
  title: `Routine ${id}`,
  startTime,
  duration: 30,
  category: "other",
  daysOfWeek: [1],
  isCompleted: false,
  sortOrder: 0,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
});

describe("reorderRoutinesWithSequentialTimes", () => {
  const routines = [
    makeRoutine("a", "07:00"),
    makeRoutine("b", "08:00"),
    makeRoutine("c", "09:00"),
  ];

  it("前方に移動した場合は移動範囲を各ルーティンの長さで連続配置する", () => {
    // c を先頭 a の位置に移動: [c, a, b]
    const result = reorderRoutinesWithSequentialTimes(routines, "c", "a");
    expect(result).not.toBeNull();
    expect(result!.map((r) => r.id)).toEqual(["c", "a", "b"]);
    expect(result!.map((r) => r.startTime)).toEqual([
      "07:00",
      "07:30",
      "08:00",
    ]);
  });

  it("後方に移動した場合も移動範囲を各ルーティンの長さで連続配置する", () => {
    // a を末尾 c の位置に移動: [b, c, a]
    const result = reorderRoutinesWithSequentialTimes(routines, "a", "c");
    expect(result).not.toBeNull();
    expect(result!.map((r) => r.id)).toEqual(["b", "c", "a"]);
    expect(result!.map((r) => r.startTime)).toEqual([
      "07:00",
      "07:30",
      "08:00",
    ]);
  });

  it("activeId と overId が同じ場合は null を返す", () => {
    const result = reorderRoutinesWithSequentialTimes(routines, "b", "b");
    expect(result).toBeNull();
  });

  it("activeId が存在しない場合は null を返す", () => {
    const result = reorderRoutinesWithSequentialTimes(routines, "x", "a");
    expect(result).toBeNull();
  });

  it("overId が存在しない場合は null を返す", () => {
    const result = reorderRoutinesWithSequentialTimes(routines, "a", "x");
    expect(result).toBeNull();
  });

  it("要素数 1 のリストで同一 ID を渡すと null を返す", () => {
    const single = [makeRoutine("a", "07:00")];
    const result = reorderRoutinesWithSequentialTimes(single, "a", "a");
    expect(result).toBeNull();
  });
});
