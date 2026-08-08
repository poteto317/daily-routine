import {
  isIndentButtonDisabled,
  isOutdentButtonDisabled,
} from "../todoListItemIndentButtonDisabledState";

describe("isOutdentButtonDisabled", () => {
  it("currentIndent が 0 のとき true を返す", () => {
    expect(isOutdentButtonDisabled(0, false)).toBe(true);
  });

  it("sortModeActive が true のとき true を返す", () => {
    expect(isOutdentButtonDisabled(2, true)).toBe(true);
  });

  it("currentIndent が 0 かつ sortModeActive が true のとき true を返す", () => {
    expect(isOutdentButtonDisabled(0, true)).toBe(true);
  });

  it("currentIndent が 0 より大きく sortModeActive が false のとき false を返す", () => {
    expect(isOutdentButtonDisabled(1, false)).toBe(false);
  });
});

describe("isIndentButtonDisabled", () => {
  it("currentIndent が maxIndent と等しいとき true を返す", () => {
    expect(isIndentButtonDisabled(3, 3, false)).toBe(true);
  });

  it("currentIndent が maxIndent を超えているとき true を返す", () => {
    expect(isIndentButtonDisabled(4, 3, false)).toBe(true);
  });

  it("sortModeActive が true のとき true を返す", () => {
    expect(isIndentButtonDisabled(0, 3, true)).toBe(true);
  });

  it("currentIndent が maxIndent 未満かつ sortModeActive が false のとき false を返す", () => {
    expect(isIndentButtonDisabled(1, 3, false)).toBe(false);
  });
});
