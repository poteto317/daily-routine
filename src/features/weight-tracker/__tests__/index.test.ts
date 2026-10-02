import * as weightTrackerModule from "../index";

describe("weight-tracker index exports", () => {
  it("WeightTrackerPage and storage functions are exported", () => {
    expect(weightTrackerModule.WeightTrackerPage).toBeDefined();
    expect(weightTrackerModule.getWeightHistory).toBeDefined();
    expect(weightTrackerModule.saveWeightHistory).toBeDefined();
    expect(weightTrackerModule.getWeightRecord).toBeDefined();
    expect(weightTrackerModule.getTodayWeightRecord).toBeDefined();
    expect(weightTrackerModule.saveWeightRecord).toBeDefined();
    expect(weightTrackerModule.deleteWeightRecord).toBeDefined();
    expect(weightTrackerModule.getWeightRecordsByPeriod).toBeDefined();
    expect(weightTrackerModule.getLatestWeightRecord).toBeDefined();
  });
});
