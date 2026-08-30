import type { Routine } from "@/types/routine";
import { hasPresetRoutineCoreFields } from "../presetRoutineValidation";
import { createRoutineFixture } from "./storageTestFixtures";

const createMalformedRoutine = (
  field: keyof Routine,
  value: unknown,
): Routine => {
  const routine = createRoutineFixture();
  (routine as unknown as Record<keyof Routine, unknown>)[field] = value;
  return routine;
};

describe("hasPresetRoutineCoreFields", () => {
  it("プリセットへ変換できるルーティンを受け入れる", () => {
    expect(hasPresetRoutineCoreFields(createRoutineFixture())).toBe(true);
  });

  it("通知なしを表す notificationMinutes 0 を受け入れる", () => {
    expect(
      hasPresetRoutineCoreFields(
        createRoutineFixture({ notificationMinutes: 0 }),
      ),
    ).toBe(true);
  });

  it.each([
    ["title", ""],
    ["title", "   "],
    ["startTime", ""],
    ["startTime", "7:00"],
    ["startTime", "24:00"],
    ["startTime", "23:60"],
    ["duration", null],
    ["duration", "30"],
    ["duration", 0],
    ["duration", 1.5],
    ["duration", 1441],
    ["category", "unknown"],
    ["description", 1],
    ["notificationMinutes", -1],
    ["notificationMinutes", "10"],
  ] as const)("%s が %p のルーティンを除外する", (field, value) => {
    expect(
      hasPresetRoutineCoreFields(createMalformedRoutine(field, value)),
    ).toBe(false);
  });
});
