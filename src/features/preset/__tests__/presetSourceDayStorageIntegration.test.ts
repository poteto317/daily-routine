import type { Routine } from "@/types/routine";
import { createPresetAndReload } from "../presetCreateWorkflow";
import { savePresetEditAndReload } from "../presetEditSaveWorkflow";
import { getPresets, savePresets } from "../storage";
import { createPreset, createRoutineFixture } from "./storageTestFixtures";

const createRoutineWithInvalidStartTime = (id: string): Routine => {
  const routine = createRoutineFixture({ id, daysOfWeek: [1] });
  (routine as unknown as { startTime: unknown }).startTime = null;
  return routine;
};

const createRoutineWithInvalidField = (
  id: string,
  field: keyof Routine,
  value: unknown,
): Routine => {
  const routine = createRoutineFixture({ id, daysOfWeek: [1] });
  (routine as unknown as Record<keyof Routine, unknown>)[field] = value;
  return routine;
};

describe("元曜日からの保存と実 storage の整合性", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("作成時に保存可能なルーティンが0件なら空プリセットを保存しない", () => {
    const result = createPresetAndReload({
      currentRoutines: [createRoutineWithInvalidStartTime("invalid")],
      newPresetName: "不正データのみ",
      newPresetDescription: "",
      sourceDay: 1,
    });

    expect(result.created).toBe(false);
    expect(getPresets()).toEqual([]);
  });

  it.each([
    ["duration", null],
    ["duration", "30"],
    ["category", "unknown"],
    ["title", "   "],
    ["startTime", "24:00"],
  ] as const)(
    "作成時に %s が %p のルーティンだけなら保存しない",
    (field, value) => {
      const result = createPresetAndReload({
        currentRoutines: [
          createRoutineWithInvalidField("invalid", field, value),
        ],
        newPresetName: "不正データのみ",
        newPresetDescription: "",
        sourceDay: 1,
      });

      expect(result.created).toBe(false);
      expect(getPresets()).toEqual([]);
    },
  );

  it("作成時に有効・不正ルーティンが混在すると有効分だけを保存し再読込後も維持する", () => {
    const validRoutine = createRoutineFixture({
      id: "valid",
      title: "有効な朝食",
      daysOfWeek: [1],
    });

    const result = createPresetAndReload({
      currentRoutines: [
        createRoutineWithInvalidStartTime("invalid"),
        validRoutine,
      ],
      newPresetName: "月曜日",
      newPresetDescription: "",
      sourceDay: 1,
    });

    expect(result.created).toBe(true);
    expect(result.presets[0].routineTemplates).toEqual([
      expect.objectContaining({ title: "有効な朝食", startTime: "07:00" }),
    ]);
    expect(getPresets()[0].routineTemplates).toEqual(
      result.presets[0].routineTemplates,
    );
    expect(
      JSON.parse(localStorage.getItem("routine-presets") ?? "[]")[0]
        .routineTemplates,
    ).toHaveLength(1);
  });

  it("作成時の永続化に失敗したら未作成としてフォーム入力を維持できる結果を返す", () => {
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });

    const result = createPresetAndReload({
      currentRoutines: [createRoutineFixture({ daysOfWeek: [1] })],
      newPresetName: "月曜日",
      newPresetDescription: "朝用",
      sourceDay: 1,
    });

    expect(result).toEqual({
      presets: [],
      created: false,
      failureReason: "storage-failure",
    });
  });

  it("notificationMinutes 0 のルーティンも元曜日の全件として保存する", () => {
    const result = createPresetAndReload({
      currentRoutines: [
        createRoutineFixture({
          daysOfWeek: [1],
          notificationMinutes: 0,
        }),
      ],
      newPresetName: "月曜日",
      newPresetDescription: "",
      sourceDay: 1,
    });

    expect(result.created).toBe(true);
    expect(result.presets[0].routineTemplates[0].notificationMinutes).toBe(0);
  });

  it("編集時に保存可能なルーティンが0件なら既存テンプレートを空全置換しない", () => {
    const originalPreset = createPreset({
      id: "preset-1",
      routineTemplates: [
        { title: "既存", startTime: "06:00", duration: 10, category: "life" },
      ],
    });
    savePresets([originalPreset]);

    const result = savePresetEditAndReload({
      presets: getPresets(),
      editingPresetId: originalPreset.id,
      editingPresetUpdatedAt: originalPreset.updatedAt,
      editPresetName: "更新後",
      editPresetDescription: "",
      sourceDay: 1,
      currentRoutines: [createRoutineWithInvalidStartTime("invalid")],
    });

    expect(result.saved).toBe(false);
    expect(getPresets()[0]).toEqual(originalPreset);
  });

  it.each([
    ["duration", null],
    ["category", "unknown"],
    ["startTime", "24:00"],
  ] as const)(
    "編集時に %s が %p のルーティンだけなら既存プリセットを維持する",
    (field, value) => {
      const originalPreset = createPreset({
        id: "preset-1",
        routineTemplates: [
          {
            title: "既存",
            startTime: "06:00",
            duration: 10,
            category: "life",
          },
        ],
      });
      savePresets([originalPreset]);

      const result = savePresetEditAndReload({
        presets: getPresets(),
        editingPresetId: originalPreset.id,
        editingPresetUpdatedAt: originalPreset.updatedAt,
        editPresetName: "更新後",
        editPresetDescription: "",
        sourceDay: 1,
        currentRoutines: [
          createRoutineWithInvalidField("invalid", field, value),
        ],
      });

      expect(result.saved).toBe(false);
      expect(getPresets()[0]).toEqual(originalPreset);
    },
  );

  it("編集時に有効・不正ルーティンが混在すると有効分だけで全置換し再読込後も維持する", () => {
    const originalPreset = createPreset({
      id: "preset-1",
      routineTemplates: [
        { title: "既存", startTime: "06:00", duration: 10, category: "life" },
      ],
    });
    const validRoutine = createRoutineFixture({
      id: "valid",
      title: "有効な朝食",
      daysOfWeek: [1],
    });
    savePresets([originalPreset]);

    const result = savePresetEditAndReload({
      presets: getPresets(),
      editingPresetId: originalPreset.id,
      editingPresetUpdatedAt: originalPreset.updatedAt,
      editPresetName: "更新後",
      editPresetDescription: "",
      sourceDay: 1,
      currentRoutines: [
        createRoutineWithInvalidStartTime("invalid"),
        validRoutine,
      ],
    });

    expect(result.saved).toBe(true);
    expect(result.presets[0].routineTemplates).toEqual([
      expect.objectContaining({ title: "有効な朝食", startTime: "07:00" }),
    ]);
    expect(getPresets()[0].routineTemplates).toEqual(
      result.presets[0].routineTemplates,
    );
    expect(
      JSON.parse(localStorage.getItem("routine-presets") ?? "[]")[0]
        .routineTemplates,
    ).toHaveLength(1);
  });

  it("編集対象が保存先から消えていたら未保存として編集状態を維持できる結果を返す", () => {
    const originalPreset = createPreset({ id: "preset-1" });

    const result = savePresetEditAndReload({
      presets: [originalPreset],
      editingPresetId: originalPreset.id,
      editingPresetUpdatedAt: originalPreset.updatedAt,
      editPresetName: "更新後",
      editPresetDescription: "",
      sourceDay: 1,
      currentRoutines: [createRoutineFixture({ daysOfWeek: [1] })],
    });

    expect(result).toEqual({
      presets: [],
      saved: false,
      failureReason: "preset-not-found",
    });
  });

  it("編集時の永続化に失敗したら未保存として編集状態を維持できる結果を返す", () => {
    const originalPreset = createPreset({ id: "preset-1" });
    savePresets([originalPreset]);
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });

    const result = savePresetEditAndReload({
      presets: [originalPreset],
      editingPresetId: originalPreset.id,
      editingPresetUpdatedAt: originalPreset.updatedAt,
      editPresetName: "更新後",
      editPresetDescription: "",
      sourceDay: 1,
      currentRoutines: [createRoutineFixture({ daysOfWeek: [1] })],
    });

    expect(result).toEqual({
      presets: [originalPreset],
      saved: false,
      failureReason: "storage-failure",
    });
  });

  it("編集開始後に同じプリセットが外部更新されたら古い内容で上書きしない", () => {
    const originalPreset = createPreset({
      id: "preset-1",
      name: "編集開始時",
      updatedAt: "2026-03-07T00:00:00.000Z",
    });
    const externallyUpdatedPreset = {
      ...originalPreset,
      name: "同期後",
      updatedAt: "2026-03-08T00:00:00.000Z",
    };
    savePresets([externallyUpdatedPreset]);
    const saveWithExpectedVersion = savePresetEditAndReload as unknown as (
      params: Parameters<typeof savePresetEditAndReload>[0] & {
        editingPresetUpdatedAt: string | null;
      },
    ) => ReturnType<typeof savePresetEditAndReload>;

    const result = saveWithExpectedVersion({
      presets: [originalPreset],
      editingPresetId: originalPreset.id,
      editingPresetUpdatedAt: originalPreset.updatedAt,
      editPresetName: "古い編集内容",
      editPresetDescription: "",
      sourceDay: 1,
      currentRoutines: [createRoutineFixture({ daysOfWeek: [1] })],
    });

    expect(result).toEqual({
      presets: [externallyUpdatedPreset],
      saved: false,
      failureReason: "preset-conflict",
    });
    expect(getPresets()).toEqual([externallyUpdatedPreset]);
  });

  it("空文字の更新日時を持つ旧プリセットも開始時versionとして編集保存できる", () => {
    const legacyPreset = createPreset({
      id: "preset-1",
      name: "旧プリセット",
      updatedAt: "",
    });
    savePresets([legacyPreset]);

    const result = savePresetEditAndReload({
      presets: getPresets(),
      editingPresetId: legacyPreset.id,
      editingPresetUpdatedAt: "",
      editPresetName: "更新後",
      editPresetDescription: "",
      sourceDay: 1,
      currentRoutines: [createRoutineFixture({ daysOfWeek: [1] })],
    });

    expect(result.saved).toBe(true);
    expect(result.failureReason).toBeNull();
    expect(getPresets()[0].name).toBe("更新後");
  });
});
