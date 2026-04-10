import type { Routine, RoutinePreset } from "@/types/routine";
import {
  canApplyPreset,
  canCreatePreset,
  findPresetById,
  getRoutinesFilteredByDays,
  getSelectedRoutinesForPreset,
  toggleSetSelection,
} from "../presetStateHelpers";
import {
  formatRoutineTemplateSummary,
  getDayButtonClassName,
  getPresetCardClassName,
  getPresetCreateToggleLabel,
  isApplyButtonDisabled,
  isPresetCreateDisabled,
  isPresetEditSaveDisabled,
  PRESET_APPLY_LABEL,
  PRESET_CREATE_CANCEL_LABEL,
  PRESET_CREATE_OPEN_LABEL,
  PRESET_EDIT_LABEL,
  PRESET_LIST_SECTION_TEXT,
  PRESET_MANAGER_MESSAGES,
  PRESET_MANAGER_TEXT,
  PRESET_ROUTINE_COUNT_SUFFIX,
} from "../helpers";

const routines: Routine[] = [
  {
    id: "r1",
    title: "朝食",
    startTime: "07:00",
    duration: 30,
    category: "life",
    daysOfWeek: [1],
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

const presets: RoutinePreset[] = [
  {
    id: "p1",
    name: "朝ルーティン",
    description: "desc",
    routineTemplates: [],
    createdAt: "2026-03-07T00:00:00.000Z",
    updatedAt: "2026-03-07T00:00:00.000Z",
  },
];

describe("preset helpers and state helpers", () => {
  it("Set 選択をトグルする", () => {
    expect(Array.from(toggleSetSelection(new Set<string>(), "a"))).toEqual([
      "a",
    ]);
    expect(Array.from(toggleSetSelection(new Set<string>(["a"]), "a"))).toEqual(
      [],
    );
  });

  it("作成・適用条件を判定する", () => {
    expect(canCreatePreset("名前", new Set(["r1"]))).toBe(true);
    expect(canCreatePreset("   ", new Set(["r1"]))).toBe(false);
    expect(canApplyPreset("p1", new Set([1]))).toBe(true);
    expect(canApplyPreset(null, new Set([1]))).toBe(false);
  });

  it("ルーティン抽出とプリセット検索と曜日絞り込みを行う", () => {
    expect(getSelectedRoutinesForPreset(routines, new Set(["r2"]))).toEqual([
      routines[1],
    ]);
    expect(findPresetById(presets, "p1")).toEqual(presets[0]);
    expect(findPresetById(presets, null)).toBeUndefined();
    expect(getRoutinesFilteredByDays(routines, new Set())).toEqual(routines);
    expect(getRoutinesFilteredByDays(routines, new Set([1]))).toEqual([
      routines[0],
    ]);
  });

  it("preset 表示用 helper と文言定数を返す", () => {
    expect(PRESET_MANAGER_TEXT.title).toBeTruthy();
    expect(PRESET_MANAGER_MESSAGES.alertMissingFields).toBeTruthy();
    expect(PRESET_LIST_SECTION_TEXT.title).toBeTruthy();
    expect(PRESET_ROUTINE_COUNT_SUFFIX).toContain("件");
    expect(PRESET_APPLY_LABEL).toBeTruthy();
    expect(PRESET_EDIT_LABEL).toBeTruthy();
    expect(PRESET_CREATE_OPEN_LABEL).toBe("➕");
    expect(PRESET_CREATE_CANCEL_LABEL).toBeTruthy();
    expect(getPresetCardClassName(true)).toContain("border-blue-500");
    expect(getPresetCardClassName(false)).toContain("border-gray-200");
    expect(getDayButtonClassName(true, true)).toContain("bg-red-500");
    expect(getDayButtonClassName(false, false)).toContain("bg-gray-200");
    expect(isApplyButtonDisabled(0)).toBe(true);
    expect(isPresetCreateDisabled("name", 0)).toBe(true);
    expect(isPresetCreateDisabled("name", 1)).toBe(false);
    expect(getPresetCreateToggleLabel(true)).toBe(PRESET_CREATE_CANCEL_LABEL);
    expect(getPresetCreateToggleLabel(false)).toBe(PRESET_CREATE_OPEN_LABEL);
    expect(isPresetEditSaveDisabled("   ")).toBe(true);
    expect(
      formatRoutineTemplateSummary({
        categoryEmoji: "🍽️",
        title: "朝食",
        startTime: "07:00",
        duration: 30,
      }),
    ).toBe("🍽️ 朝食 (07:00, 30分)");
  });
});
