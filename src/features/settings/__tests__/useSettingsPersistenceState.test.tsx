import { renderHook } from "@testing-library/react";

jest.mock("../state/useVisibleFeaturesState", () => ({
  useVisibleFeaturesState: jest.fn(),
}));

jest.mock("../state/useMenuOrderState", () => ({
  useMenuOrderState: jest.fn(),
}));

jest.mock("../state/settingsPersistenceStateResult", () => ({
  createSettingsPersistenceStateResult: jest.fn(),
}));

import { useMenuOrderState } from "../state/useMenuOrderState";
import { createSettingsPersistenceStateResult } from "../state/settingsPersistenceStateResult";
import { useSettingsPersistenceState } from "../state/useSettingsPersistenceState";
import { useVisibleFeaturesState } from "../state/useVisibleFeaturesState";

describe("useSettingsPersistenceState", () => {
  const visibleFeatures = {
    journal: true,
    calendar: true,
    statistics: true,
    pomodoro: true,
    worktracker: true,
    weightTracker: true,
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
    (useVisibleFeaturesState as jest.Mock).mockReturnValue({
      visibleFeatures,
      setVisibleFeatures: jest.fn(),
    });
    (useMenuOrderState as jest.Mock).mockReturnValue({
      menuOrder: ["weather", "journal"],
      setMenuOrder: jest.fn(),
    });
    (createSettingsPersistenceStateResult as jest.Mock).mockImplementation(
      ({ menuOrderState, visibleFeaturesState }) => ({
        ...visibleFeaturesState,
        ...menuOrderState,
      }),
    );
  });

  it("visible features/menu order state hooks を compose し result builder へ委譲する", () => {
    const { result } = renderHook(() => useSettingsPersistenceState());

    expect(useVisibleFeaturesState).toHaveBeenCalledWith();
    expect(useMenuOrderState).toHaveBeenCalledWith();
    expect(createSettingsPersistenceStateResult).toHaveBeenCalledWith({
      menuOrderState: (useMenuOrderState as jest.Mock).mock.results[0].value,
      visibleFeaturesState: (useVisibleFeaturesState as jest.Mock).mock
        .results[0].value,
    });
    expect(result.current.menuOrder).toEqual(["weather", "journal"]);
    expect(result.current.visibleFeatures).toEqual(visibleFeatures);
  });
});
