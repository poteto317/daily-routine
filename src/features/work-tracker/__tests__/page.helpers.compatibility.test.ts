import * as helpers from "../page/helpers";
import * as sessionHistory from "../page/sessionHistoryPresentation";
import * as templateInsights from "../page/templateInsightsPresentation";
import * as templateSearch from "../page/templateSearch";
import * as todaySummary from "../page/todaySummaryPresentation";

describe("work tracker page helpers compatibility exports", () => {
  it("責務別moduleの公開関数を既存経路から再exportする", () => {
    expect(helpers.getTotalTimeToday).toBe(todaySummary.getTotalTimeToday);
    expect(helpers.getFilteredTemplates).toBe(
      templateSearch.getFilteredTemplates,
    );
    expect(helpers.getSessionHistoryMeta).toBe(
      sessionHistory.getSessionHistoryMeta,
    );
    expect(helpers.getTemplateInsightCards).toBe(
      templateInsights.getTemplateInsightCards,
    );
  });
});
