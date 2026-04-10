import { act, renderHook } from "@testing-library/react";
import { usePresetManagerState } from "../usePresetManagerState";

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

const mockAddPreset = addPreset as jest.MockedFunction<typeof addPreset>;
const mockCreatePresetFromRoutines =
  createPresetFromRoutines as jest.MockedFunction<
    typeof createPresetFromRoutines
  >;
const mockCreateRoutinesFromPreset =
  createRoutinesFromPreset as jest.MockedFunction<
    typeof createRoutinesFromPreset
  >;
const mockDeletePreset = deletePreset as jest.MockedFunction<
  typeof deletePreset
>;
const mockGetPresets = getPresets as jest.MockedFunction<typeof getPresets>;
const mockUpdatePreset = updatePreset as jest.MockedFunction<
  typeof updatePreset
>;

const currentRoutines = [
  {
    id: "r1",
    title: "朝食",
    startTime: "07:00",
    duration: 30,
    category: "life" as const,
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
    category: "health" as const,
    daysOfWeek: [2],
    isCompleted: false,
    sortOrder: 1,
    createdAt: "2026-03-07T00:00:00.000Z",
    updatedAt: "2026-03-07T00:00:00.000Z",
  },
];

const preset = {
  id: "p1",
  name: "朝ルーティン",
  description: "desc",
  routineTemplates: [
    {
      title: "朝食",
      startTime: "07:00",
      duration: 30,
      category: "life" as const,
    },
  ],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

describe("usePresetManagerState", () => {
  const onApplyPreset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPresets.mockReturnValue([preset]);
    mockCreatePresetFromRoutines.mockReturnValue(preset);
    mockCreateRoutinesFromPreset.mockReturnValue([
      {
        title: "朝食",
        startTime: "07:00",
        duration: 30,
        category: "life",
        daysOfWeek: [1],
        isCompleted: false,
      },
    ]);
    jest.spyOn(window, "alert").mockImplementation(() => undefined);
    jest.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    (window.alert as jest.Mock).mockRestore();
    (window.confirm as jest.Mock).mockRestore();
  });

  it("無効な状態ではプリセット作成時にアラートを出す", () => {
    const { result } = renderHook(() =>
      usePresetManagerState({ currentRoutines, onApplyPreset }),
    );

    act(() => {
      result.current.handleCreatePreset();
    });

    expect(window.alert).toHaveBeenCalled();
    expect(mockAddPreset).not.toHaveBeenCalled();
  });

  it("プリセットを作成して状態をリセットする", () => {
    const { result } = renderHook(() =>
      usePresetManagerState({ currentRoutines, onApplyPreset }),
    );

    act(() => {
      result.current.setIsCreating(true);
      result.current.setNewPresetName("朝");
      result.current.toggleRoutineSelection("r1");
    });

    act(() => {
      result.current.handleCreatePreset();
    });

    expect(mockCreatePresetFromRoutines).toHaveBeenCalledWith(
      "朝",
      [currentRoutines[0]],
      undefined,
    );
    expect(mockAddPreset).toHaveBeenCalledWith(preset);
    expect(result.current.isCreating).toBe(false);
    expect(result.current.newPresetName).toBe("");
    expect(result.current.selectedRoutines.size).toBe(0);
  });

  it("プリセット削除時に確認後だけ削除する", () => {
    const { result } = renderHook(() =>
      usePresetManagerState({ currentRoutines, onApplyPreset }),
    );

    act(() => {
      result.current.handleDeletePreset("p1");
    });

    expect(mockDeletePreset).toHaveBeenCalledWith("p1");
  });

  it("選択不足では適用時にアラートを出す", () => {
    const { result } = renderHook(() =>
      usePresetManagerState({ currentRoutines, onApplyPreset }),
    );

    act(() => {
      result.current.handleApplyPreset();
    });

    expect(window.alert).toHaveBeenCalled();
    expect(onApplyPreset).not.toHaveBeenCalled();
  });

  it("プリセットを適用して選択状態をリセットする", () => {
    const { result } = renderHook(() =>
      usePresetManagerState({ currentRoutines, onApplyPreset }),
    );

    act(() => {
      result.current.setSelectedPresetId("p1");
      result.current.toggleDaySelection(1);
    });

    act(() => {
      result.current.handleApplyPreset();
    });

    expect(mockCreateRoutinesFromPreset).toHaveBeenCalledWith(preset, [1]);
    expect(onApplyPreset).toHaveBeenCalledWith(
      mockCreateRoutinesFromPreset.mock.results[0].value,
      [1],
    );
    expect(result.current.selectedPresetId).toBeNull();
    expect(result.current.selectedDays.size).toBe(0);
  });

  it("作成フィルター曜日の切替で対象ルーティン選択を更新する", () => {
    const { result } = renderHook(() =>
      usePresetManagerState({ currentRoutines, onApplyPreset }),
    );

    act(() => {
      result.current.toggleCreateFilterDay(1);
    });
    expect(Array.from(result.current.createFilterDays)).toEqual([1]);
    expect(Array.from(result.current.selectedRoutines)).toEqual(["r1"]);

    act(() => {
      result.current.toggleCreateFilterDay(2);
    });

    act(() => {
      result.current.toggleCreateFilterDay(1);
    });
    expect(Array.from(result.current.createFilterDays)).toEqual([2]);
    expect(Array.from(result.current.selectedRoutines)).toEqual(["r1", "r2"]);
  });

  it("編集開始と保存を行える", () => {
    const { result } = renderHook(() =>
      usePresetManagerState({ currentRoutines, onApplyPreset }),
    );

    act(() => {
      result.current.handleStartEdit("p1");
      result.current.setEditPresetName("更新後");
      result.current.toggleEditRoutineSelection("r2");
    });

    act(() => {
      result.current.handleSaveEdit();
    });

    expect(mockUpdatePreset).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "p1",
        name: "更新後",
        routineTemplates: [expect.objectContaining({ title: "運動" })],
      }),
    );
    expect(window.alert).toHaveBeenCalled();
    expect(result.current.editingPresetId).toBeNull();
  });

  it("編集名が空なら保存せずアラートを出す", () => {
    const { result } = renderHook(() =>
      usePresetManagerState({ currentRoutines, onApplyPreset }),
    );

    act(() => {
      result.current.handleStartEdit("p1");
      result.current.setEditPresetName("   ");
    });

    act(() => {
      result.current.handleSaveEdit();
    });

    expect(mockUpdatePreset).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalled();
  });
});
