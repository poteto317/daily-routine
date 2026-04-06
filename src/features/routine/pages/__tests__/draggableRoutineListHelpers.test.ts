import { reorderRoutinesWithOriginalTimes } from "../draggableRoutineListHelpers";
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

describe("reorderRoutinesWithOriginalTimes", () => {
  const routines = [
    makeRoutine("a", "07:00"),
    makeRoutine("b", "08:00"),
    makeRoutine("c", "09:00"),
  ];

  it("前方に移動した場合: 順序が変わり元インデックスの startTime を保持する", () => {
    // c を先頭 a の位置に移動: [c, a, b]
    const result = reorderRoutinesWithOriginalTimes(routines, "c", "a");
    expect(result).not.toBeNull();
    expect(result!.map((r) => r.id)).toEqual(["c", "a", "b"]);
    // 移動後も各インデックスに対応した元の startTime を保持する
    expect(result!.map((r) => r.startTime)).toEqual([
      "07:00",
      "08:00",
      "09:00",
    ]);
  });

  it("後方に移動した場合: 順序が変わり元インデックスの startTime を保持する", () => {
    // a を末尾 c の位置に移動: [b, c, a]
    const result = reorderRoutinesWithOriginalTimes(routines, "a", "c");
    expect(result).not.toBeNull();
    expect(result!.map((r) => r.id)).toEqual(["b", "c", "a"]);
    expect(result!.map((r) => r.startTime)).toEqual([
      "07:00",
      "08:00",
      "09:00",
    ]);
  });

  it("隣接する要素へ移動した場合も正しく並び替える", () => {
    // a を b の位置に移動: [b, a, c]
    const result = reorderRoutinesWithOriginalTimes(routines, "a", "b");
    expect(result).not.toBeNull();
    expect(result!.map((r) => r.id)).toEqual(["b", "a", "c"]);
    expect(result!.map((r) => r.startTime)).toEqual([
      "07:00",
      "08:00",
      "09:00",
    ]);
  });

  it("activeId と overId が同じ場合は null を返す", () => {
    const result = reorderRoutinesWithOriginalTimes(routines, "b", "b");
    expect(result).toBeNull();
  });

  it("activeId が存在しない場合は null を返す", () => {
    const result = reorderRoutinesWithOriginalTimes(routines, "x", "a");
    expect(result).toBeNull();
  });

  it("overId が存在しない場合は null を返す", () => {
    const result = reorderRoutinesWithOriginalTimes(routines, "a", "x");
    expect(result).toBeNull();
  });

  it("要素数 1 のリストで同一 ID を渡すと null を返す", () => {
    const single = [makeRoutine("a", "07:00")];
    const result = reorderRoutinesWithOriginalTimes(single, "a", "a");
    expect(result).toBeNull();
  });
});
