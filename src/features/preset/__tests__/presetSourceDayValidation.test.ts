import { isPresetSourceDay } from "../presetSourceDayValidation";

describe("preset source-day validation", () => {
  it.each([
    [0, true],
    [7, true],
    [-1, false],
    [8, false],
    [1.5, false],
    [Number.NaN, false],
    [null, false],
  ])("元曜日値 %s の有効性を判定する", (value, expected) => {
    expect(isPresetSourceDay(value)).toBe(expected);
  });
});
