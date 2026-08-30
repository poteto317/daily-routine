import {
  formatRoutineTemplateSummary,
  getDayButtonClassName,
  getPresetCardClassName,
  isApplyButtonDisabled,
  PRESET_APPLY_LABEL,
  PRESET_DELETE_LABEL,
  PRESET_DUPLICATE_LABEL,
  PRESET_EDIT_LABEL,
  PRESET_ROUTINE_COUNT_SUFFIX,
} from "../presetCardPresentation";
import {
  getPresetCreateToggleLabel,
  PRESET_CREATE_CANCEL_LABEL,
  PRESET_CREATE_OPEN_LABEL,
} from "../presetCreatePresentation";
import { PRESET_LIST_SECTION_TEXT } from "../presetListPresentation";
import {
  PRESET_MANAGER_MESSAGES,
  PRESET_MANAGER_TEXT,
} from "../presetManagerPresentation";

describe("preset presentation", () => {
  it("表示状態と文言を生成する", () => {
    expect(PRESET_MANAGER_TEXT.title).toBeTruthy();
    expect(PRESET_MANAGER_MESSAGES.alertMissingFields).toBeTruthy();
    expect(PRESET_LIST_SECTION_TEXT.title).toBeTruthy();
    expect(PRESET_ROUTINE_COUNT_SUFFIX).toContain("件");
    expect(PRESET_APPLY_LABEL).toBeTruthy();
    expect(PRESET_EDIT_LABEL).toBe("✏️ 編集");
    expect(PRESET_DELETE_LABEL).toBe("🗑️ 削除");
    expect(PRESET_DUPLICATE_LABEL).toBe("📄 コピー");
    expect(PRESET_CREATE_OPEN_LABEL).toBe("➕");
    expect(PRESET_CREATE_CANCEL_LABEL).toBeTruthy();
    expect(getPresetCardClassName(true)).toContain("border-blue-500");
    expect(getPresetCardClassName(false)).toContain("border-gray-200");
    expect(getDayButtonClassName(true, true)).toContain("bg-red-500");
    expect(getDayButtonClassName(false, false)).toContain("bg-gray-200");
    expect(isApplyButtonDisabled(0, 2)).toBe(true);
    expect(isApplyButtonDisabled(1, 0)).toBe(true);
    expect(isApplyButtonDisabled(1, 2)).toBe(false);
    expect(getPresetCreateToggleLabel(true)).toBe(PRESET_CREATE_CANCEL_LABEL);
    expect(getPresetCreateToggleLabel(false)).toBe(PRESET_CREATE_OPEN_LABEL);
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
