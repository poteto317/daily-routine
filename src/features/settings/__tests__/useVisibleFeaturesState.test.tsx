import { act, renderHook } from "@testing-library/react";

jest.mock("../state/featureVisibility", () => ({
  getInitialVisibleFeatures: jest.fn(),
}));

jest.mock("../state/visibleFeaturesStateResult", () => ({
  createVisibleFeaturesStateResult: jest.fn(),
}));

import { getInitialVisibleFeatures } from "../state/featureVisibility";
import { createVisibleFeaturesStateResult } from "../state/visibleFeaturesStateResult";
import { useVisibleFeaturesState } from "../state/useVisibleFeaturesState";

describe("useVisibleFeaturesState", () => {
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
    weather: true,
    preset: true,
    todoLists: true,
    syncManagement: true,
    testMatrix: true,
    accountAdmin: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getInitialVisibleFeatures as jest.Mock).mockReturnValue(visibleFeatures);
    (createVisibleFeaturesStateResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("初期 state を feature visibility から作り更新できる", () => {
    const { result } = renderHook(() => useVisibleFeaturesState());

    expect(createVisibleFeaturesStateResult).toHaveBeenCalledWith({
      visibleFeatures,
      setVisibleFeatures: expect.any(Function),
    });
    expect(result.current.visibleFeatures).toEqual(visibleFeatures);

    act(() => {
      result.current.setVisibleFeatures({
        ...visibleFeatures,
        weather: false,
      });
    });

    expect(result.current.visibleFeatures.weather).toBe(false);
    expect(createVisibleFeaturesStateResult).toHaveBeenLastCalledWith({
      visibleFeatures: {
        ...visibleFeatures,
        weather: false,
      },
      setVisibleFeatures: expect.any(Function),
    });
  });
});
