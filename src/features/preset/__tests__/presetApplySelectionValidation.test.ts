import { canApplyPreset } from "../presetApplySelectionValidation";

describe("canApplyPreset", () => {
  it.each([
    ["preset-1", new Set([1]), true],
    [null, new Set([1]), false],
    ["preset-1", new Set<number>(), false],
  ])(
    "プリセットID %s・適用曜日 %p の適用可否を返す",
    (selectedPresetId, selectedDays, expected) => {
      expect(canApplyPreset(selectedPresetId, selectedDays)).toBe(expected);
    },
  );
});
