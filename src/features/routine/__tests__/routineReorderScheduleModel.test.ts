import type { Routine } from "@/types/routine";
import { assignSequentialStartTimes } from "../routineReorderScheduleModel";

const createRoutine = (
  id: string,
  startTime: string,
  duration: number,
): Routine => ({
  id,
  title: id,
  startTime,
  duration,
  category: "other",
  daysOfWeek: [1],
  isCompleted: false,
  sortOrder: 0,
  createdAt: "2026-08-29T00:00:00.000Z",
  updatedAt: "2026-08-29T00:00:00.000Z",
});

describe("assignSequentialStartTimes", () => {
  it("指定範囲をanchorから各ルーティンの長さで連続配置する", () => {
    const routines = [
      createRoutine("b", "19:30", 20),
      createRoutine("a", "19:00", 30),
    ];

    const result = assignSequentialStartTimes(
      routines,
      { start: 0, end: 1 },
      "19:00",
    );

    expect(result?.map(({ id, startTime }) => ({ id, startTime }))).toEqual([
      { id: "b", startTime: "19:00" },
      { id: "a", startTime: "19:20" },
    ]);
  });

  it("指定範囲外のルーティンと入力配列を変更しない", () => {
    const routines = [
      createRoutine("a", "07:00", 30),
      createRoutine("b", "08:00", 20),
      createRoutine("c", "09:00", 15),
    ];

    const result = assignSequentialStartTimes(
      routines,
      { start: 0, end: 1 },
      "07:00",
    );

    expect(result?.map((routine) => routine.startTime)).toEqual([
      "07:00",
      "07:30",
      "09:00",
    ]);
    expect(routines.map((routine) => routine.startTime)).toEqual([
      "07:00",
      "08:00",
      "09:00",
    ]);
  });

  it("後続ルーティンの開始時刻が翌日になる場合はnullを返す", () => {
    const routines = [
      createRoutine("b", "23:30", 60),
      createRoutine("a", "23:00", 30),
    ];

    expect(
      assignSequentialStartTimes(routines, { start: 0, end: 1 }, "23:00"),
    ).toBeNull();
  });
});
