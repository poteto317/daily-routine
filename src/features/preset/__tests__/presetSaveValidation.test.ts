import { isPresetSourceSaveDisabled } from "../presetSaveValidation";

describe("isPresetSourceSaveDisabled", () => {
  it.each([
    ["プリセット", 1, false],
    ["   ", 1, true],
    ["プリセット", 0, true],
  ])(
    "名前 '%s'・対象件数 %s から作成と編集に共通の保存可否を返す",
    (name, sourceRoutineCount, expected) => {
      expect(isPresetSourceSaveDisabled(name, sourceRoutineCount)).toBe(
        expected,
      );
    },
  );
});
