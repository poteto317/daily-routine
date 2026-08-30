import { act, renderHook } from "@testing-library/react";
import type { Routine, RoutinePreset } from "@/types/routine";
import { getPresets, savePresets } from "../storage";
import { usePresetManagerState } from "../usePresetManagerState";

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
  {
    id: "r2",
    title: "運動",
    startTime: "08:00",
    duration: 20,
    category: "health",
    daysOfWeek: [2],
    isCompleted: false,
    sortOrder: 1,
    createdAt: "2026-03-07T00:00:00.000Z",
    updatedAt: "2026-03-07T00:00:00.000Z",
  },
];

const preset: RoutinePreset = {
  id: "p1",
  name: "朝ルーティン",
  description: "desc",
  routineTemplates: [
    {
      title: "朝食",
      startTime: "07:00",
      duration: 30,
      category: "life",
    },
  ],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

describe("usePresetManagerState", () => {
  const onApplyPreset = jest.fn();
  let alertSpy: jest.SpyInstance;
  let confirmSpy: jest.SpyInstance;

  beforeEach(() => {
    localStorage.clear();
    savePresets([preset]);
    onApplyPreset.mockClear();
    alertSpy = jest.spyOn(window, "alert").mockImplementation(() => undefined);
    confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    alertSpy.mockRestore();
    confirmSpy.mockRestore();
  });

  it("無効な状態ではプリセットを作成せず通知する", () => {
    const { result } = renderHook(() =>
      usePresetManagerState({ currentRoutines, onApplyPreset }),
    );

    act(() => result.current.handleCreatePreset());

    expect(window.alert).toHaveBeenCalledTimes(1);
    expect(getPresets()).toEqual([preset]);
  });

  it("選択曜日の全ルーティンからプリセットを作成して状態をリセットする", () => {
    const { result } = renderHook(() =>
      usePresetManagerState({ currentRoutines, onApplyPreset }),
    );

    act(() => {
      result.current.setIsCreating(true);
      result.current.setNewPresetName("  月曜の朝  ");
      result.current.setSourceDay(1);
    });
    act(() => result.current.handleCreatePreset());

    const createdPreset = getPresets().find(({ id }) => id !== preset.id);
    expect(createdPreset).toEqual(
      expect.objectContaining({
        name: "月曜の朝",
        routineTemplates: [expect.objectContaining({ title: "朝食" })],
      }),
    );
    expect(result.current.isCreating).toBe(false);
    expect(result.current.newPresetName).toBe("");
    expect(result.current.sourceDay).toBeNull();
  });

  it("確認後にプリセットを削除して公開stateと保存値を更新する", () => {
    const { result } = renderHook(() =>
      usePresetManagerState({ currentRoutines, onApplyPreset }),
    );

    act(() => result.current.handleDeletePreset(preset.id));

    expect(result.current.presets).toEqual([]);
    expect(getPresets()).toEqual([]);
  });

  it("プリセットを複製して公開stateと保存値へ追加する", () => {
    const { result } = renderHook(() =>
      usePresetManagerState({ currentRoutines, onApplyPreset }),
    );

    act(() => result.current.handleDuplicatePreset(preset.id));

    expect(result.current.presets).toHaveLength(2);
    expect(getPresets()).toHaveLength(2);
    expect(result.current.presets[1].name).toBe("朝ルーティンのコピー");
  });

  it("選択不足では適用せず通知する", () => {
    const { result } = renderHook(() =>
      usePresetManagerState({ currentRoutines, onApplyPreset }),
    );

    act(() => result.current.handleApplyPreset());

    expect(window.alert).toHaveBeenCalledTimes(1);
    expect(onApplyPreset).not.toHaveBeenCalled();
  });

  it("プリセットを適用し、callbackへ生成結果を渡して選択状態をリセットする", () => {
    const { result } = renderHook(() =>
      usePresetManagerState({ currentRoutines, onApplyPreset }),
    );

    act(() => {
      result.current.setSelectedPresetId(preset.id);
      result.current.toggleDaySelection(1);
    });
    act(() => result.current.handleApplyPreset());

    expect(onApplyPreset).toHaveBeenCalledWith(
      [
        {
          title: "朝食",
          startTime: "07:00",
          duration: 30,
          category: "life",
          description: undefined,
          notificationMinutes: undefined,
          daysOfWeek: [1],
          isCompleted: false,
        },
      ],
      [1],
    );
    expect(result.current.selectedPresetId).toBeNull();
    expect(result.current.selectedDays.size).toBe(0);
  });

  it("作成元曜日は単一の曜日に置き換わる", () => {
    const { result } = renderHook(() =>
      usePresetManagerState({ currentRoutines, onApplyPreset }),
    );

    act(() => result.current.setSourceDay(1));
    act(() => result.current.setSourceDay(2));

    expect(result.current.sourceDay).toBe(2);
  });

  it("選択曜日の全ルーティンで既存プリセットを編集し状態をリセットする", () => {
    const { result } = renderHook(() =>
      usePresetManagerState({ currentRoutines, onApplyPreset }),
    );

    act(() => {
      result.current.handleStartEdit(preset.id);
      result.current.setEditPresetName("  更新後  ");
      result.current.setEditSourceDay(2);
    });
    act(() => result.current.handleSaveEdit());

    expect(getPresets()[0]).toEqual(
      expect.objectContaining({
        name: "更新後",
        routineTemplates: [
          expect.objectContaining({ title: "朝食" }),
          expect.objectContaining({ title: "運動" }),
        ],
      }),
    );
    expect(window.alert).toHaveBeenCalledTimes(1);
    expect(result.current.editingPresetId).toBeNull();
  });

  it("編集名が空なら保存せず通知する", () => {
    const { result } = renderHook(() =>
      usePresetManagerState({ currentRoutines, onApplyPreset }),
    );

    act(() => {
      result.current.handleStartEdit(preset.id);
      result.current.setEditPresetName("   ");
      result.current.setEditSourceDay(1);
    });
    act(() => result.current.handleSaveEdit());

    expect(getPresets()[0].name).toBe(preset.name);
    expect(window.alert).toHaveBeenCalledTimes(1);
  });
});
