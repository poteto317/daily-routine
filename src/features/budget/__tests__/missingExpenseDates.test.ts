import type { Expense } from "@/types/routine";
import {
  formatMissingDayFullLabel,
  formatMissingDayLabel,
  listMissingExpenseDates,
} from "../utils/missingExpenseDates";

const expense = (id: string, date: string, amount = 1000): Expense => ({
  id,
  date,
  amount,
  createdAt: "2026-01-01T00:00:00.000Z",
});

/** "YYYY-MM" の from 日〜to 日の "YYYY-MM-DD" を昇順で返す（期待値の組み立て用） */
const dateRange = (monthKey: string, from: number, to: number): string[] =>
  Array.from(
    { length: to - from + 1 },
    (_, index) => `${monthKey}-${String(from + index).padStart(2, "0")}`,
  );

describe("listMissingExpenseDates", () => {
  describe("表示中の月が今日の月", () => {
    it("記録が 0 件なら、1 日〜昨日を返す（今日は含めない）", () => {
      expect(listMissingExpenseDates("2026-03", [], "2026-03-07")).toEqual(
        dateRange("2026-03", 1, 6),
      );
    });

    it("今日が 1 日なら、過ぎた日が無いので [] を返す", () => {
      expect(listMissingExpenseDates("2026-03", [], "2026-03-01")).toEqual([]);
    });

    it("今日の記録の有無で結果が変わらない（今日は常に対象外）", () => {
      const withToday = [expense("e1", "2026-03-07")];

      expect(
        listMissingExpenseDates("2026-03", withToday, "2026-03-07"),
      ).toEqual(dateRange("2026-03", 1, 6));
    });

    it("記録のある日を除く。同じ日に複数の記録があっても 1 日分として扱う", () => {
      const expenses = [
        expense("e1", "2026-03-01"),
        expense("e2", "2026-03-03"),
        expense("e3", "2026-03-03", 500),
        expense("e4", "2026-03-03", 200),
      ];

      expect(
        listMissingExpenseDates("2026-03", expenses, "2026-03-07"),
      ).toEqual(["2026-03-02", "2026-03-04", "2026-03-05", "2026-03-06"]);
    });

    it("0 円の記録の日は入力済みとして除く。0 円と金額ありが同じ日でも 1 日分", () => {
      const expenses = [
        expense("e1", "2026-03-02", 0),
        expense("e2", "2026-03-04", 0),
        expense("e3", "2026-03-04", 300),
      ];

      expect(
        listMissingExpenseDates("2026-03", expenses, "2026-03-07"),
      ).toEqual(["2026-03-01", "2026-03-03", "2026-03-05", "2026-03-06"]);
    });

    it("過ぎた日すべてに記録があれば [] を返す", () => {
      const expenses = dateRange("2026-03", 1, 6).map((date, index) =>
        expense(`e${index}`, date),
      );

      expect(
        listMissingExpenseDates("2026-03", expenses, "2026-03-07"),
      ).toEqual([]);
    });

    it("今日が月末（31 日）で記録が 0 件なら、1〜30 日の 30 件を返す", () => {
      const result = listMissingExpenseDates("2026-03", [], "2026-03-31");

      expect(result).toHaveLength(30);
      expect(result).toEqual(dateRange("2026-03", 1, 30));
    });

    it("結果は日付の昇順（記録の並び順に依存しない）", () => {
      const expenses = [
        expense("e1", "2026-03-05"),
        expense("e2", "2026-03-01"),
      ];

      expect(
        listMissingExpenseDates("2026-03", expenses, "2026-03-07"),
      ).toEqual(["2026-03-02", "2026-03-03", "2026-03-04", "2026-03-06"]);
    });
  });

  describe("月の日数（うるう年・平年）", () => {
    it("うるう年の 2 月は 29 日まで対象にする", () => {
      const result = listMissingExpenseDates("2028-02", [], "2028-03-01");

      expect(result).toHaveLength(29);
      expect(result[result.length - 1]).toBe("2028-02-29");
    });

    it("平年の 2 月は 28 日まで対象にする", () => {
      const result = listMissingExpenseDates("2026-02", [], "2026-03-07");

      expect(result).toHaveLength(28);
      expect(result[result.length - 1]).toBe("2026-02-28");
    });
  });

  describe("表示中の月が今日の月と違う", () => {
    it("過去の月は、その月の全日のうち記録の無い日を返す", () => {
      const expenses = [expense("e1", "2026-02-10")];
      const result = listMissingExpenseDates("2026-02", expenses, "2026-03-07");

      expect(result).toHaveLength(27);
      expect(result).not.toContain("2026-02-10");
    });

    it("年をまたぐ過去の月（前年 12 月）は、12 月の全日を返す", () => {
      expect(listMissingExpenseDates("2025-12", [], "2026-01-05")).toEqual(
        dateRange("2025-12", 1, 31),
      );
    });

    it("未来の月は [] を返す", () => {
      expect(listMissingExpenseDates("2026-04", [], "2026-03-07")).toEqual([]);
    });

    it("年をまたぐ未来の月（翌年 1 月）は [] を返す", () => {
      expect(listMissingExpenseDates("2027-01", [], "2026-12-15")).toEqual([]);
    });
  });

  it("表示中の月以外の日付を持つ記録は無視する（別の月の同じ日を入力済みにしない）", () => {
    const expenses = [
      expense("e1", "2026-02-03"),
      expense("e2", "2026-04-03"),
      expense("e3", "2025-03-03"),
    ];

    expect(listMissingExpenseDates("2026-03", expenses, "2026-03-07")).toEqual(
      dateRange("2026-03", 1, 6),
    );
  });
});

describe("formatMissingDayLabel", () => {
  it("日と曜日の短い表記にする", () => {
    expect(formatMissingDayLabel("2026-11-03")).toBe("3日(火)");
    expect(formatMissingDayLabel("2026-11-30")).toBe("30日(月)");
  });
});

describe("formatMissingDayFullLabel", () => {
  it("月・日・曜日の表記にする", () => {
    expect(formatMissingDayFullLabel("2026-11-03")).toBe("11月3日(火)");
    expect(formatMissingDayFullLabel("2028-02-29")).toBe("2月29日(火)");
  });
});
