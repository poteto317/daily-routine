import * as helpers from "../helpers";

describe("statistics helpers re-exports", () => {
  it("all statistics presentation helpers are exported", () => {
    expect(helpers.formatCategoryCompletionLabel).toBeDefined();
    expect(helpers.STATISTICS_CHART_PANEL_TEXT).toBeDefined();
    expect(helpers.STATISTICS_MODE_OPTIONS).toBeDefined();
    expect(helpers.STATISTICS_PAGE_DESCRIPTION).toBeDefined();
    expect(helpers.STATISTICS_PAGE_TITLE).toBeDefined();
    expect(helpers.getCurrentPeriodLabel).toBeDefined();
    expect(helpers.getStatisticsPeriodLabel).toBeDefined();
    expect(helpers.STATISTICS_PERIOD_NEXT_LABEL).toBeDefined();
    expect(helpers.STATISTICS_PERIOD_PREVIOUS_LABEL).toBeDefined();
    expect(helpers.getCategoryCountLabel).toBeDefined();
    expect(helpers.getCategorySummaryLabel).toBeDefined();
    expect(helpers.getMonthlySummaryCards).toBeDefined();
    expect(helpers.getWeeklySummaryCards).toBeDefined();
    expect(helpers.STATISTICS_WEEKLY_GOALS_TEXT).toBeDefined();
  });
});
