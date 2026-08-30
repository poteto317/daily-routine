import type { Routine, RoutinePreset } from "@/types/routine";
import { buildUpdatedPreset } from "../presetTemplateBuilder";

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
  it("名前・説明をtrimしてプリセットを組み立てる", () => {
    const routine = createRoutine({ title: "運動", category: "health" });
    const result = buildUpdatedPreset({
      preset: createPreset(),
      name: "  更新後  ",
      description: "  新しい説明  ",
      routinesToSave: [routine],
    });

    expect(result.name).toBe("更新後");
    expect(result.description).toBe("新しい説明");
    // 元曜日から渡されたルーティンだけでテンプレートを組み立てる
    expect(result.routineTemplates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "運動", category: "health" }),
      ]),
    );
  });

  it("説明が空白のみならundefinedにする", () => {
    const routine = createRoutine();
    const result = buildUpdatedPreset({
      preset: createPreset(),
      name: "名前",
      description: "   ",
      routinesToSave: [routine],
    });

    expect(result.description).toBeUndefined();
  });

  it("id・createdAtなど既存フィールドは維持する", () => {
    const preset = createPreset();
    const routine = createRoutine();
    const result = buildUpdatedPreset({
      preset,
      name: "名前",
      description: "",
      routinesToSave: [routine],
    });

    expect(result.id).toBe(preset.id);
    expect(result.createdAt).toBe(preset.createdAt);
  });

  it("選択した元曜日のルーティンでテンプレートを全置換する", () => {
    const preset = createPreset();
    const routine = createRoutine();

    expect(
      buildUpdatedPreset({
        preset,
        name: "名前",
        description: "",
        routinesToSave: [routine],
      }).routineTemplates,
    ).toEqual([expect.objectContaining({ title: "朝食", startTime: "07:00" })]);
  });
});
