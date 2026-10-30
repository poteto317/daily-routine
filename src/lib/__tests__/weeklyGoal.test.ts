import { isValidWeeklyGoal } from "../weeklyGoal";

const STARTED_AT = "2026-10-26T00:00:00.000Z";

describe("isValidWeeklyGoal", () => {
  it.each([1, 4, 7])("週 %i 回の目標は有効", (targetPerWeek) => {
    expect(isValidWeeklyGoal({ targetPerWeek, startedAt: STARTED_AT })).toBe(
      true,
    );
  });

  it.each([0, 8, -1])("週 %i 回は範囲外（1〜7）なので無効", (targetPerWeek) => {
    expect(isValidWeeklyGoal({ targetPerWeek, startedAt: STARTED_AT })).toBe(
      false,
    );
  });

  it.each([1.5, Number.NaN, Number.POSITIVE_INFINITY, "3", null])(
    "targetPerWeek が整数でない値 %p は無効",
    (targetPerWeek) => {
      expect(isValidWeeklyGoal({ targetPerWeek, startedAt: STARTED_AT })).toBe(
        false,
      );
    },
  );

  it("日付だけの startedAt も日時として解釈できれば有効", () => {
    expect(
      isValidWeeklyGoal({ targetPerWeek: 3, startedAt: "2026-10-26" }),
    ).toBe(true);
  });

  it.each([
    ["日時として解釈できない文字列", "not-a-date"],
    ["空文字", ""],
    ["数値", 1761436800000],
    ["未設定", undefined],
  ])("startedAt が%sなら無効", (_label, startedAt) => {
    expect(isValidWeeklyGoal({ targetPerWeek: 3, startedAt })).toBe(false);
  });

  it.each([null, undefined, 3, "goal", true])(
    "オブジェクトでない値 %p は無効",
    (value) => {
      expect(isValidWeeklyGoal(value)).toBe(false);
    },
  );

  it.each([
    ["空のオブジェクト", {}],
    ["targetPerWeek だけ", { targetPerWeek: 3 }],
    ["startedAt だけ", { startedAt: STARTED_AT }],
    ["配列", [3, STARTED_AT]],
  ])("必須項目のキーが無い値（%s）は無効", (_label, value) => {
    expect(isValidWeeklyGoal(value)).toBe(false);
  });

  it("余分なプロパティがあっても必須項目がそろえば有効", () => {
    expect(
      isValidWeeklyGoal({
        targetPerWeek: 2,
        startedAt: STARTED_AT,
        extra: "ignored",
      }),
    ).toBe(true);
  });
});
