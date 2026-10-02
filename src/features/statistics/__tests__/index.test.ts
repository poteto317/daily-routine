import * as statsModule from "../index";

describe("statistics index exports", () => {
  it("StatisticsPage and calculation functions are exported", () => {
    expect(statsModule.StatisticsPage).toBeDefined();
    expect(statsModule.calculateDailyStats).toBeDefined();
    expect(statsModule.calculateWeeklyStats).toBeDefined();
    expect(statsModule.calculateMonthlyStats).toBeDefined();
    expect(statsModule.calculatePeriodStats).toBeDefined();
    expect(statsModule.calculateCategoryStats).toBeDefined();
  });
});
