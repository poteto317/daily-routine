import type { Routine, RoutinePreset } from "@/types/routine";

jest.mock("@/features/preset/storage", () => ({
  addPreset: jest.fn(),
  createPresetFromRoutines: jest.fn(),
  createRoutinesFromPreset: jest.fn(),
  deletePreset: jest.fn(),
  getPresets: jest.fn(),
  updatePreset: jest.fn(),
}));

import {
  addPreset,
  createPresetFromRoutines,
  createRoutinesFromPreset,
  deletePreset,
  getPresets,
  updatePreset,
} from "@/features/preset/storage";
import {
  applyPresetSelection,
  cancelPresetEdit,
  createPresetAndReload,
  deletePresetAndReload,
  loadPresetList,
  resolveCreateFilterSelection,
  savePresetEditAndReload,
  startPresetEdit,
  togglePresetSelection,
} from "../presetManagerStateActions";

const currentRoutines: Routine[] = [
  {
    id: "r1",
    title: "朝食",
    startTime: "07:00",
    duration: 30,
    category: "life",
    daysOfWeek: [1, 2],
    isCompleted: false,
    sortOrder: 0,
    createdAt: "2026-03-07T00:00:00.000Z",
    updatedAt: "2026-03-07T00:00:00.000Z",
  },
];

const preset: RoutinePreset = {
  id: "p1",
  name: "朝ルーティン",
  description: "desc",
  routineTemplates: [
    { title: "朝食", startTime: "07:00", duration: 30, category: "life" },
  ],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

describe("presetManagerStateActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getPresets as jest.Mock).mockReturnValue([preset]);
    (createPresetFromRoutines as jest.Mock).mockReturnValue(preset);
    (createRoutinesFromPreset as jest.Mock).mockReturnValue([
      {
        title: "朝食",
        startTime: "07:00",
        duration: 30,
        category: "life",
        daysOfWeek: [1],
        isCompleted: false,
      },
    ]);
  });

  it("一覧読み込みと選択切替を行う", () => {
    expect(loadPresetList()).toEqual([preset]);
    expect(Array.from(togglePresetSelection(new Set<string>(), "r1"))).toEqual([
      "r1",
    ]);
  });

  it("作成/削除を処理する", () => {
    const alertFn = jest.fn();
    expect(
      createPresetAndReload({
        currentRoutines,
        newPresetName: "",
        newPresetDescription: "",
        selectedRoutines: new Set(),
        alertFn,
      }),
    ).toEqual({ presets: [preset], created: false });

    expect(
      createPresetAndReload({
        currentRoutines,
        newPresetName: "朝",
        newPresetDescription: "",
        selectedRoutines: new Set(["r1"]),
      }),
    ).toEqual({ presets: [preset], created: true });
    expect(addPreset).toHaveBeenCalledWith(preset);

    expect(deletePresetAndReload("p1", () => false)).toEqual({
      presets: [preset],
      deleted: false,
    });
    expect(deletePresetAndReload("p1", () => true)).toEqual({
      presets: [preset],
      deleted: true,
    });
    expect(deletePreset).toHaveBeenCalledWith("p1");
  });

  it("曜日フィルターで選択した重複ルーティンは1件だけ保存対象になる", () => {
    // 複数曜日で作成されたルーティンは曜日ごとに別レコードへ分解されるため、
    // 曜日フィルター選択 → プリセット作成の一連の流れで
    // title+startTimeが同じテンプレートが重複保存されないことを検証する。
    const splitRoutines: Routine[] = [1, 3, 5].map((day, index) => ({
      ...currentRoutines[0],
      id: `r-${day}`,
      daysOfWeek: [day],
      sortOrder: index,
    }));

    // 同一グループに属する複数の曜日を続けて選択する。統合前の実装では
    // 曜日ごとに別レコードのidが加算され、重複テンプレートが保存されていた。
    const firstToggle = resolveCreateFilterSelection({
      currentRoutines: splitRoutines,
      createFilterDays: new Set<number>(),
      selectedRoutines: new Set<string>(),
      day: 1,
    });
    const secondToggle = resolveCreateFilterSelection({
      currentRoutines: splitRoutines,
      createFilterDays: firstToggle.nextFilterDays,
      selectedRoutines: firstToggle.nextSelectedRoutines,
      day: 3,
    });

    expect(secondToggle.nextSelectedRoutines.size).toBe(1);

    createPresetAndReload({
      currentRoutines: splitRoutines,
      newPresetName: "朝",
      newPresetDescription: "",
      selectedRoutines: secondToggle.nextSelectedRoutines,
    });

    const savedRoutines = (createPresetFromRoutines as jest.Mock).mock
      .calls[0][1] as Routine[];
    expect(savedRoutines).toHaveLength(1);
    expect(savedRoutines[0].title).toBe("朝食");
    expect(savedRoutines[0].startTime).toBe("07:00");
  });

  it("適用を処理する", () => {
    const alertFn = jest.fn();
    const onApplyPreset = jest.fn();

    expect(
      applyPresetSelection({
        presets: [preset],
        selectedPresetId: null,
        selectedDays: new Set(),
        onApplyPreset,
        alertFn,
      }),
    ).toEqual({ applied: false, presetName: null });

    expect(
      applyPresetSelection({
        presets: [preset],
        selectedPresetId: "p1",
        selectedDays: new Set([1]),
        onApplyPreset,
        alertFn,
      }),
    ).toEqual({ applied: true, presetName: "朝ルーティン" });
    expect(onApplyPreset).toHaveBeenCalled();
    expect(alertFn).toHaveBeenCalled();
  });

  it("編集開始/キャンセル/保存を処理する", () => {
    expect(startPresetEdit([preset], "missing")).toEqual({
      editingPresetId: null,
      editPresetName: "",
      editPresetDescription: "",
      editSelectedRoutines: new Set(),
    });

    expect(startPresetEdit([preset], "p1")).toEqual({
      editingPresetId: "p1",
      editPresetName: "朝ルーティン",
      editPresetDescription: "desc",
      editSelectedRoutines: new Set(),
    });

    expect(cancelPresetEdit()).toEqual({
      editingPresetId: null,
      editPresetName: "",
      editPresetDescription: "",
      editSelectedRoutines: new Set(),
    });

    const alertFn = jest.fn();
    expect(
      savePresetEditAndReload({
        presets: [preset],
        editingPresetId: "p1",
        editPresetName: "   ",
        editPresetDescription: "",
        editSelectedRoutines: new Set(),
        currentRoutines,
        alertFn,
      }),
    ).toEqual({ presets: [preset], saved: false });

    expect(
      savePresetEditAndReload({
        presets: [preset],
        editingPresetId: "p1",
        editPresetName: "更新後",
        editPresetDescription: "desc2",
        editSelectedRoutines: new Set(["r1"]),
        currentRoutines,
        alertFn,
      }),
    ).toEqual({ presets: [preset], saved: true });
    expect(updatePreset).toHaveBeenCalled();
  });

  it("編集保存時も重複ルーティンからテンプレートを1件だけ生成する", () => {
    // 編集画面は代表ルーティンのidのみを選択対象にするため、曜日分解された
    // 重複レコードがあってもテンプレートは1件に統合される。
    const splitRoutines: Routine[] = [1, 3, 5].map((day, index) => ({
      ...currentRoutines[0],
      id: `r-${day}`,
      daysOfWeek: [day],
      sortOrder: index,
    }));

    savePresetEditAndReload({
      presets: [preset],
      editingPresetId: "p1",
      editPresetName: "更新後",
      editPresetDescription: "",
      editSelectedRoutines: new Set(["r-1"]),
      currentRoutines: splitRoutines,
      alertFn: jest.fn(),
    });

    const saved = (updatePreset as jest.Mock).mock
      .calls[0][0] as RoutinePreset;
    expect(saved.routineTemplates).toHaveLength(1);
    expect(saved.routineTemplates[0]).toMatchObject({
      title: "朝食",
      startTime: "07:00",
    });
  });
});
