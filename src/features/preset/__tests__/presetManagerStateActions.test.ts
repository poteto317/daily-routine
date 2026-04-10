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
});
