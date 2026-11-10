import { createSettingsPersistenceStateResult } from "../state/settingsPersistenceStateResult";

describe("settingsPersistenceStateResult", () => {
  it("settings persistence state の公開 shape を組み立てる", () => {
    const visibleFeaturesState = {
      visibleFeatures: {
        journal: true,
        weeklyLog: true,
        calendar: true,
        statistics: true,
        pomodoro: true,
        worktracker: true,
        weightTracker: true,
        workoutTracker: true,
        meal: true,
        budget: true,
        weather: true,
        preset: true,
        todoLists: true,
        syncManagement: true,
        testMatrix: true,
        accountAdmin: true,
      },
      setVisibleFeatures: jest.fn(),
    };
    const menuOrderState = {
      menuOrder: ["weather", "journal"],
      setMenuOrder: jest.fn(),
    };

    expect(
      createSettingsPersistenceStateResult({
        menuOrderState,
        visibleFeaturesState,
      }),
    ).toEqual({
      ...visibleFeaturesState,
      ...menuOrderState,
    });
  });
});
