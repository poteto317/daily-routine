import type { Routine, RoutinePreset } from "@/types/routine";

jest.mock("@/features/preset/storage", () => ({
  addPreset: jest.fn(),
  createPresetFromRoutines: jest.fn(),
  getPresets: jest.fn(),
  updatePreset: jest.fn(),
}));

import {
  addPreset,
  createPresetFromRoutines,
  getPresets,
  updatePreset,
} from "@/features/preset/storage";
import { createPresetAndReload } from "../presetCreateWorkflow";
import { savePresetEditAndReload } from "../presetEditSaveWorkflow";
import { startPresetEdit } from "../presetEditStateActions";

const routines: Routine[] = [
  {
    id: "late",
    title: "夜食",
    startTime: "22:00",
    duration: 30,
    category: "life",
    daysOfWeek: [1],
    isCompleted: false,
    sortOrder: 0,
    createdAt: "2026-03-07T00:00:00.000Z",
    updatedAt: "2026-03-07T00:00:00.000Z",
  },
  {
    id: "early",
    title: "朝食",
    startTime: "06:00",
    duration: 30,
    category: "life",
    daysOfWeek: [1],
    isCompleted: false,
    sortOrder: 1,
    createdAt: "2026-03-07T00:00:00.000Z",
    updatedAt: "2026-03-07T00:00:00.000Z",
  },
];

const preset: RoutinePreset = {
  id: "p1",
  name: "既存",
  routineTemplates: [
    { title: "古い", startTime: "08:00", duration: 30, category: "life" },
  ],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

describe("preset source-day actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getPresets as jest.Mock).mockReturnValue([preset]);
    (createPresetFromRoutines as jest.Mock).mockReturnValue(preset);
    (addPreset as jest.Mock).mockReturnValue(true);
    (updatePreset as jest.Mock).mockReturnValue("updated");
  });

  it("作成時は選択曜日の全ルーティンを時刻順で保存する", () => {
    createPresetAndReload({
      currentRoutines: routines,
      newPresetName: "月曜",
      newPresetDescription: "",
      sourceDay: 1,
    });

    expect(createPresetFromRoutines).toHaveBeenCalledWith(
      "月曜",
      [routines[1], routines[0]],
      undefined,
    );
    expect(addPreset).toHaveBeenCalledWith(preset);
  });

  it("編集開始時は既存テンプレートにかかわらず元曜日を未選択にし、保存時は全置換する", () => {
    expect(startPresetEdit([preset], "p1")).toEqual({
      editingPresetId: "p1",
      editingPresetUpdatedAt: "2026-03-07T00:00:00.000Z",
      editPresetName: "既存",
      editPresetDescription: "",
      editSourceDay: null,
    });

    savePresetEditAndReload({
      presets: [preset],
      editingPresetId: "p1",
      editingPresetUpdatedAt: preset.updatedAt,
      editPresetName: "更新",
      editPresetDescription: "",
      sourceDay: 1,
      currentRoutines: routines,
    });

    expect(updatePreset).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "更新",
        routineTemplates: [
          expect.objectContaining({ title: "朝食", startTime: "06:00" }),
          expect.objectContaining({ title: "夜食", startTime: "22:00" }),
        ],
      }),
      preset.updatedAt,
    );
  });

  it("未選択または空曜日は作成・編集を保存しない", () => {
    const createResult = createPresetAndReload({
      currentRoutines: routines,
      newPresetName: "月曜",
      newPresetDescription: "",
      sourceDay: null,
    });
    expect(createResult.created).toBe(false);

    const editResult = savePresetEditAndReload({
      presets: [preset],
      editingPresetId: "p1",
      editingPresetUpdatedAt: preset.updatedAt,
      editPresetName: "更新",
      editPresetDescription: "",
      sourceDay: 0,
      currentRoutines: routines,
    });
    expect(editResult).toEqual({
      presets: [preset],
      saved: false,
      failureReason: "invalid-input",
    });
  });

  it("祝日を元曜日にすると祝日の全ルーティンだけを保存する", () => {
    const holidayRoutine = { ...routines[0], id: "holiday", daysOfWeek: [7] };

    createPresetAndReload({
      currentRoutines: [...routines, holidayRoutine],
      newPresetName: "祝日",
      newPresetDescription: "",
      sourceDay: 7,
    });

    expect(createPresetFromRoutines).toHaveBeenLastCalledWith(
      "祝日",
      [holidayRoutine],
      undefined,
    );
  });

  it.each([8, -1, 1.5, Number.NaN])(
    "作成時は不正な元曜日 %s に属するルーティンがあっても保存しない",
    (sourceDay) => {
      const invalidDayRoutine = {
        ...routines[0],
        id: `invalid-${String(sourceDay)}`,
        daysOfWeek: [sourceDay],
      };

      const result = createPresetAndReload({
        currentRoutines: [invalidDayRoutine],
        newPresetName: "不正曜日",
        newPresetDescription: "",
        sourceDay,
      });

      expect(result.created).toBe(false);
      expect(addPreset).not.toHaveBeenCalled();
    },
  );

  it.each([8, -1, 1.5, Number.NaN])(
    "編集時は不正な元曜日 %s に属するルーティンがあっても保存しない",
    (sourceDay) => {
      const invalidDayRoutine = {
        ...routines[0],
        id: `invalid-${String(sourceDay)}`,
        daysOfWeek: [sourceDay],
      };

      const result = savePresetEditAndReload({
        presets: [preset],
        editingPresetId: "p1",
        editingPresetUpdatedAt: preset.updatedAt,
        editPresetName: "更新",
        editPresetDescription: "",
        sourceDay,
        currentRoutines: [invalidDayRoutine],
      });

      expect(result.saved).toBe(false);
      expect(updatePreset).not.toHaveBeenCalled();
    },
  );

  it.each([0, 7])("作成時は境界値の元曜日 %s を保存できる", (sourceDay) => {
    const boundaryRoutine = {
      ...routines[0],
      id: `boundary-${sourceDay}`,
      daysOfWeek: [sourceDay],
    };

    const result = createPresetAndReload({
      currentRoutines: [boundaryRoutine],
      newPresetName: "境界曜日",
      newPresetDescription: "",
      sourceDay,
    });

    expect(result.created).toBe(true);
    expect(createPresetFromRoutines).toHaveBeenLastCalledWith(
      "境界曜日",
      [boundaryRoutine],
      undefined,
    );
  });

  it.each([0, 7])("編集時は境界値の元曜日 %s を保存できる", (sourceDay) => {
    const boundaryRoutine = {
      ...routines[0],
      id: `boundary-${sourceDay}`,
      daysOfWeek: [sourceDay],
    };

    const result = savePresetEditAndReload({
      presets: [preset],
      editingPresetId: "p1",
      editingPresetUpdatedAt: preset.updatedAt,
      editPresetName: "境界曜日",
      editPresetDescription: "",
      sourceDay,
      currentRoutines: [boundaryRoutine],
    });

    expect(result.saved).toBe(true);
    expect(updatePreset).toHaveBeenLastCalledWith(
      expect.objectContaining({
        name: "境界曜日",
        routineTemplates: [
          expect.objectContaining({ title: boundaryRoutine.title }),
        ],
      }),
      preset.updatedAt,
    );
  });
});
