import type { Routine } from "@/types/routine";
import { buildRoutineTemplatesFromRoutines } from "../presetTemplateConverter";

const createRoutine = (overrides: Partial<Routine> = {}): Routine => ({
  id: "routine-1",
  title: "朝食",
  startTime: "07:00",
  duration: 30,
  category: "life",
  daysOfWeek: [1],
  isCompleted: false,
  sortOrder: 0,
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
  ...overrides,
});

describe("buildRoutineTemplatesFromRoutines", () => {
  it("ルーティンからテンプレート配列を生成する", () => {
    expect(buildRoutineTemplatesFromRoutines([createRoutine()])).toEqual([
      {
        title: "朝食",
        startTime: "07:00",
        duration: 30,
        category: "life",
        description: undefined,
        notificationMinutes: undefined,
      },
    ]);
  });

  it("テンプレートにid・daysOfWeekなど雛形に不要なフィールドを含めない", () => {
    const [templateItem] = buildRoutineTemplatesFromRoutines([createRoutine()]);

    expect(templateItem).not.toHaveProperty("id");
    expect(templateItem).not.toHaveProperty("daysOfWeek");
    expect(templateItem).not.toHaveProperty("sortOrder");
    expect(templateItem).not.toHaveProperty("isCompleted");
  });

  it("description・notificationMinutesは指定があれば引き継ぐ", () => {
    const [templateItem] = buildRoutineTemplatesFromRoutines([
      createRoutine({ description: "メモ", notificationMinutes: 10 }),
    ]);

    expect(templateItem.description).toBe("メモ");
    expect(templateItem.notificationMinutes).toBe(10);
  });

  it("空配列なら空配列を返す", () => {
    expect(buildRoutineTemplatesFromRoutines([])).toEqual([]);
  });
});
