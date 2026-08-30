import type { Routine } from "@/types/routine";
import { selectRoutinesForPresetSourceDay } from "../presetSourceRoutineSelection";
import { createRoutineFixture } from "./storageTestFixtures";

describe("selectRoutinesForPresetSourceDay", () => {
  it("選択曜日に属する全ルーティンを開始時刻順で返す", () => {
    const routines = [
      createRoutineFixture({ id: "late", startTime: "21:00", daysOfWeek: [1] }),
      createRoutineFixture({
        id: "other",
        startTime: "08:00",
        daysOfWeek: [2],
      }),
      createRoutineFixture({
        id: "early",
        startTime: "07:30",
        daysOfWeek: [1, 3],
      }),
    ];

    expect(
      selectRoutinesForPresetSourceDay(routines, 1).map(({ id }) => id),
    ).toEqual(["early", "late"]);
  });

  it("壊れた daysOfWeek を持つルーティンを無視する", () => {
    const brokenRoutine = createRoutineFixture({
      id: "broken",
      daysOfWeek: [],
    }) as Routine;
    (brokenRoutine as unknown as { daysOfWeek: unknown }).daysOfWeek = null;

    expect(selectRoutinesForPresetSourceDay([brokenRoutine], 1)).toEqual([]);
  });

  it("空曜日では空配列を返す", () => {
    expect(
      selectRoutinesForPresetSourceDay(
        [createRoutineFixture({ daysOfWeek: [1] })],
        2,
      ),
    ).toEqual([]);
  });

  it("日曜の0と祝日の7を有効な元曜日として扱う", () => {
    const routines = [
      createRoutineFixture({ id: "sunday", daysOfWeek: [0] }),
      createRoutineFixture({ id: "holiday", daysOfWeek: [7] }),
    ];

    expect(selectRoutinesForPresetSourceDay(routines, 0)).toEqual([
      routines[0],
    ]);
    expect(selectRoutinesForPresetSourceDay(routines, 7)).toEqual([
      routines[1],
    ]);
  });

  it.each([8, -1, 1.5, Number.NaN])(
    "範囲外または非整数の元曜日 %s は対象があっても拒否する",
    (sourceDay) => {
      const brokenRoutine = createRoutineFixture({
        id: "broken-day",
        daysOfWeek: [sourceDay],
      });

      expect(
        selectRoutinesForPresetSourceDay([brokenRoutine], sourceDay),
      ).toEqual([]);
    },
  );

  it("保存できない startTime のルーティンを除外し、有効なルーティンだけを返す", () => {
    const brokenRoutine = createRoutineFixture({
      id: "broken-time",
      startTime: "09:00",
      daysOfWeek: [1],
    }) as Routine;
    (brokenRoutine as unknown as { startTime: unknown }).startTime = null;

    expect(
      selectRoutinesForPresetSourceDay(
        [
          createRoutineFixture({
            id: "valid",
            startTime: "08:00",
            daysOfWeek: [1],
          }),
          brokenRoutine,
          createRoutineFixture({
            id: "late",
            startTime: "10:00",
            daysOfWeek: [1],
          }),
        ],
        1,
      ).map(({ id }) => id),
    ).toEqual(["valid", "late"]);
  });
});
