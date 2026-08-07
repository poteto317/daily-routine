import type { Routine, RoutinePreset } from "@/types/routine";
import {
  buildRoutineTemplatesFromRoutines,
  buildUpdatedPreset,
} from "../presetTemplateBuilder";

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

const createPreset = (
  overrides: Partial<RoutinePreset> = {},
): RoutinePreset => ({
  id: "preset-1",
  name: "朝ルーティン",
  description: "説明",
  routineTemplates: [
    {
      title: "既存",
      startTime: "06:00",
      duration: 10,
      category: "life",
    },
  ],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
  ...overrides,
});

describe("presetTemplateBuilder", () => {
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

  it("編集用プリセットを組み立てる", () => {
    const result = buildUpdatedPreset({
      preset: createPreset(),
      name: "  更新後  ",
      description: "  新しい説明  ",
      routinesToSave: [createRoutine({ title: "運動", category: "health" })],
    });

    expect(result.name).toBe("更新後");
    expect(result.description).toBe("新しい説明");
    expect(result.routineTemplates).toEqual([
      expect.objectContaining({ title: "運動", category: "health" }),
    ]);
  });

  it("保存対象ルーティンが空なら既存テンプレートを維持する", () => {
    const preset = createPreset();

    expect(
      buildUpdatedPreset({
        preset,
        name: "名前",
        description: "",
        routinesToSave: [],
      }).routineTemplates,
    ).toBe(preset.routineTemplates);
  });
});
