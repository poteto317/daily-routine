import {
  STATISTICS_MODE_OPTIONS,
  STATISTICS_PAGE_DESCRIPTION,
  STATISTICS_PAGE_TITLE,
} from "../statisticsPagePresentation";
import {
  getCurrentPeriodLabel,
  getStatisticsPeriodLabel,
} from "../statisticsPeriodPresentation";
import {
  getCategoryCountLabel,
  getCategorySummaryLabel,
  getMonthlySummaryCards,
  getWeeklySummaryCards,
} from "../statisticsSummaryPresentation";
import {
  formatCategoryCompletionLabel,
  STATISTICS_CHART_PANEL_TEXT,
} from "../statisticsChartPresentation";
import { STATISTICS_WEEKLY_GOALS_TEXT } from "../weeklyGoalsPresentation";

describe("statistics presentation modules", () => {
  it("ページ固有の見出しと表示モードを提供する", () => {
    expect(STATISTICS_PAGE_TITLE).toBe("📊 統計・レポート");
    expect(STATISTICS_PAGE_DESCRIPTION).toBe("あなたの達成記録を分析します");
    expect(STATISTICS_MODE_OPTIONS.map(({ mode }) => mode)).toEqual([
      "week",
      "month",
      "category",
    ]);
  });

  it("期間表示をview modeごとに構築する", () => {
    expect(
      getStatisticsPeriodLabel({
        viewMode: "week",
        weekStart: "2026/8/17",
        weekEnd: "2026/8/23",
        year: 2026,
        month: 8,
      }),
    ).toBe("2026/8/17 〜 2026/8/23");
    expect(
      getStatisticsPeriodLabel({
        viewMode: "month",
        weekStart: "",
        weekEnd: "",
        year: 2026,
        month: 8,
      }),
    ).toBe("2026年 8月");
    expect(getCurrentPeriodLabel("week")).toBe("今週");
    expect(getCurrentPeriodLabel("month")).toBe("今月");
  });

  it("サマリーカードとカテゴリ文言を構築する", () => {
    const weeklyCards = getWeeklySummaryCards({
      weekStart: "2026/8/17",
      weekEnd: "2026/8/23",
      days: [],
      averageAchievementRate: 75.25,
      totalCompleted: 9,
      totalRoutines: 12,
    });
    const monthlyCards = getMonthlySummaryCards({
      year: 2026,
      month: 8,
      days: [],
      averageAchievementRate: 60,
      totalCompleted: 6,
      totalRoutines: 10,
      bestDay: null,
      worstDay: null,
    });

    expect(weeklyCards.map(({ value }) => value)).toEqual(["75.3%", "9", "12"]);
    expect(monthlyCards.map(({ value }) => value)).toEqual([
      "60.0%",
      "データなし",
      "データなし",
    ]);
    expect(getCategorySummaryLabel(2026, 8)).toBe(
      "2026年8月のカテゴリ別達成状況",
    );
    expect(getCategoryCountLabel([])).toBe("0 カテゴリ");
  });

  it("チャートと週間目標の文言を個別に提供する", () => {
    expect(STATISTICS_CHART_PANEL_TEXT.noCategoryData).toBe(
      "カテゴリ別のデータがありません",
    );
    expect(formatCategoryCompletionLabel(2, 3)).toBe("2 / 3 完了");
    expect(STATISTICS_WEEKLY_GOALS_TEXT.title).toBe("週間目標");
  });
});
