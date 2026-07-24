import {
  buildAdjacentMonthOptions,
  buildExpenseDayOptions,
} from "../budgetExpenseDateOptions";

describe("budgetExpenseDateOptions", () => {
  describe("buildAdjacentMonthOptions", () => {
    it("前月・当月・翌月の選択肢を返す", () => {
      expect(
        buildAdjacentMonthOptions(new Date("2026-03-15T00:00:00+09:00")),
      ).toEqual([
        { value: "2026-02", label: "2026年 2月" },
        { value: "2026-03", label: "2026年 3月" },
        { value: "2026-04", label: "2026年 4月" },
      ]);
    });

    it("年をまたぐ場合も正しい年になる", () => {
      expect(
        buildAdjacentMonthOptions(new Date("2026-01-15T00:00:00+09:00")),
      ).toEqual([
        { value: "2025-12", label: "2025年 12月" },
        { value: "2026-01", label: "2026年 1月" },
        { value: "2026-02", label: "2026年 2月" },
      ]);
    });

    it("基準日が月末日（31日）でも、前後の月が重複・欠落しない", () => {
      // shiftMonthToFirstDayの日オーバーフロー対策の回帰テスト。3/31を基準にすると
      // 素朴な実装では前月/翌月の計算がずれて2月または4月が欠落し、
      // 代わりに3月が重複して現れてしまう。
      expect(
        buildAdjacentMonthOptions(new Date("2026-03-31T00:00:00+09:00")),
      ).toEqual([
        { value: "2026-02", label: "2026年 2月" },
        { value: "2026-03", label: "2026年 3月" },
        { value: "2026-04", label: "2026年 4月" },
      ]);
    });

    it("7/31を基準にしても前月(6月)・翌月(8月)を正しく返す", () => {
      expect(
        buildAdjacentMonthOptions(new Date("2026-07-31T00:00:00+09:00")),
      ).toEqual([
        { value: "2026-06", label: "2026年 6月" },
        { value: "2026-07", label: "2026年 7月" },
        { value: "2026-08", label: "2026年 8月" },
      ]);
    });
  });

  describe("buildExpenseDayOptions", () => {
    it("月キーからその月の日数分の日選択肢を生成する", () => {
      const options = buildExpenseDayOptions("2026-04");

      expect(options).toHaveLength(30);
      expect(options[0]).toEqual({ value: "2026-04-01", label: "1日" });
      expect(options[29]).toEqual({ value: "2026-04-30", label: "30日" });
    });

    it("うるう年の2月は29日分の選択肢を生成する", () => {
      expect(buildExpenseDayOptions("2024-02")).toHaveLength(29);
      expect(buildExpenseDayOptions("2026-02")).toHaveLength(28);
    });
  });
});
