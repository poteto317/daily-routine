import { createVisibleFeaturesStateResult } from "../state/visibleFeaturesStateResult";

describe("createVisibleFeaturesStateResult", () => {
  it("visible features state の公開 shape を返す", () => {
    const visibleFeatures = {
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
      weather: false,
      preset: true,
      todoLists: true,
      syncManagement: true,
      testMatrix: true,
      accountAdmin: true,
    };
    const setVisibleFeatures = jest.fn();

    expect(
      createVisibleFeaturesStateResult({
        visibleFeatures,
        setVisibleFeatures,
      }),
    ).toEqual({
      visibleFeatures,
      setVisibleFeatures,
    });
  });
});
