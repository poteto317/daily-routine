import type { Routine, RoutinePreset } from "@/types/routine";
import {
  buildRoutineTemplatesFromRoutines,
  buildUpdatedPreset,
  resolveCreateFilterSelection,
} from "../presetManagerLogic";

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

describe("presetManagerLogic", () => {
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

  it("作成フィルター曜日を追加すると該当ルーティンを選択する", () => {
    const result = resolveCreateFilterSelection({
      currentRoutines: [
        createRoutine({ id: "r1", daysOfWeek: [1] }),
        createRoutine({ id: "r2", daysOfWeek: [2] }),
      ],
      createFilterDays: new Set<number>(),
      selectedRoutines: new Set<string>(),
      day: 1,
    });

    expect(Array.from(result.nextFilterDays)).toEqual([1]);
    expect(Array.from(result.nextSelectedRoutines)).toEqual(["r1"]);
  });

  it("作成フィルター曜日を解除すると他曜日でカバーされない選択だけ外す", () => {
    const result = resolveCreateFilterSelection({
      currentRoutines: [
        createRoutine({ id: "r1", daysOfWeek: [1, 2] }),
        createRoutine({ id: "r2", daysOfWeek: [1] }),
      ],
      createFilterDays: new Set<number>([1, 2]),
      selectedRoutines: new Set<string>(["r1", "r2"]),
      day: 1,
    });

    expect(Array.from(result.nextFilterDays)).toEqual([2]);
    expect(Array.from(result.nextSelectedRoutines)).toEqual(["r1"]);
  });
});
