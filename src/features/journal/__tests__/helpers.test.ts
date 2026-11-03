import { getJournalTodayCardHeading } from "../helpers";

describe("getJournalTodayCardHeading", () => {
  it("今日なら「今日の記録 (日付)」", () => {
    expect(getJournalTodayCardHeading("2024-01-12", "2024-01-12")).toBe(
      "今日の記録 (2024年1月12日(金))",
    );
  });

  it("今日以外なら「<日付> の記録」", () => {
    expect(getJournalTodayCardHeading("2024-01-10", "2024-01-12")).toBe(
      "2024年1月10日(水) の記録",
    );
  });

  it("未来の日付も見出しには出す（保存の拒否は別の処理）", () => {
    expect(getJournalTodayCardHeading("2024-01-13", "2024-01-12")).toBe(
      "2024年1月13日(土) の記録",
    );
  });

  it.each(["", "123456-01-01", "2024-02-30", "2024/01/10"])(
    "空・不正（%s）なら日付を出さず「今日の記録」だけ",
    (date) => {
      expect(getJournalTodayCardHeading(date, "2024-01-12")).toBe("今日の記録");
    },
  );
});
