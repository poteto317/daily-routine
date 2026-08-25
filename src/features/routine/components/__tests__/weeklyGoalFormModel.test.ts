import {
  buildWeeklyGoal,
  isWeeklyGoalTargetInputValid,
} from "../weeklyGoalFormModel";

describe("isWeeklyGoalTargetInputValid", () => {
  it.each(["", "1", "3", "7"])("%s を有効とする", (value) => {
    expect(isWeeklyGoalTargetInputValid(value)).toBe(true);
  });

  it.each(["0", "8", "1.5", "abc", " 3 "])("%s を無効とする", (value) => {
    expect(isWeeklyGoalTargetInputValid(value)).toBe(false);
  });
});

describe("buildWeeklyGoal", () => {
  const now = "2026-08-22T00:00:00.000Z";

  it("空欄なら週間目標を解除する", () => {
    expect(
      buildWeeklyGoal(
        "",
        { targetPerWeek: 3, startedAt: "2026-08-01T00:00:00.000Z" },
        now,
      ),
    ).toBeUndefined();
  });

  it("同じ目標値なら開始時刻を保持する", () => {
    const current = {
      targetPerWeek: 3,
      startedAt: "2026-08-01T00:00:00.000Z",
    };

    expect(buildWeeklyGoal("3", current, now)).toBe(current);
  });

  it("目標値を変えると開始時刻を更新する", () => {
    expect(
      buildWeeklyGoal(
        "4",
        { targetPerWeek: 3, startedAt: "2026-08-01T00:00:00.000Z" },
        now,
      ),
    ).toEqual({ targetPerWeek: 4, startedAt: now });
  });

  it("不正な入力は現在の目標を維持する", () => {
    const current = {
      targetPerWeek: 3,
      startedAt: "2026-08-01T00:00:00.000Z",
    };

    expect(buildWeeklyGoal("8", current, now)).toBe(current);
  });
});
