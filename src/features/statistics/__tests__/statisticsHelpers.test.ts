import { STATISTICS_WEEKLY_GOALS_TEXT } from "../helpers";

describe("statistics helpers", () => {
  it("週間目標パネルの文言を集約して公開する", () => {
    expect(STATISTICS_WEEKLY_GOALS_TEXT).toEqual({
      title: "週間目標",
      empty: "この週に設定された週間目標はありません",
      completed: "✓ 達成",
      remainingTemplate: "あと{count}回",
      progressTemplate: "{completed} / {target}回",
      currentStreakTemplate: "現在 {count}週",
      longestStreakTemplate: "最長 {count}週",
      progressAriaTemplate: "{title}の進捗",
    });
  });
});
