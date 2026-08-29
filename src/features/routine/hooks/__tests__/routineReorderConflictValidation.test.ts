import type { Routine } from "@/types/routine";
import { hasReorderedRoutineTimeConflict } from "../routineReorderConflictValidation";

const createRoutine = (
  id: string,
  startTime: string,
  duration: number,
  daysOfWeek: number[] = [1],
): Routine => ({
  id,
  title: id,
  startTime,
  duration,
  category: "other",
  daysOfWeek,
  isCompleted: false,
  sortOrder: 0,
  createdAt: "2026-08-29T00:00:00.000Z",
  updatedAt: "2026-08-29T00:00:00.000Z",
});

describe("routineReorderConflictValidation", () => {
  it("並び替え対象が非表示の同曜日ルーティンと重なる場合は競合と判定する", () => {
    const reordered = [
      createRoutine("b", "19:00", 20),
      createRoutine("a", "19:20", 30),
    ];
    const hidden = createRoutine("hidden", "19:30", 20);

    expect(
      hasReorderedRoutineTimeConflict([...reordered, hidden], reordered),
    ).toBe(true);
  });

  it("同じ時間帯でも曜日が異なる場合は競合と判定しない", () => {
    const reordered = [createRoutine("a", "19:00", 30, [1])];
    const otherDay = createRoutine("other-day", "19:10", 30, [2]);

    expect(
      hasReorderedRoutineTimeConflict([...reordered, otherDay], reordered),
    ).toBe(false);
  });

  it("終了時刻と次の開始時刻が一致する場合は競合と判定しない", () => {
    const reordered = [createRoutine("a", "19:00", 30)];
    const adjacent = createRoutine("adjacent", "19:30", 20);

    expect(
      hasReorderedRoutineTimeConflict([...reordered, adjacent], reordered),
    ).toBe(false);
  });
});
