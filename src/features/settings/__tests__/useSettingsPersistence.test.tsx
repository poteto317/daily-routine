import { renderHook } from "@testing-library/react";

jest.mock("../state/useSettingsPersistenceState", () => ({
  useSettingsPersistenceState: jest.fn(),
}));

jest.mock("../state/useSettingsPersistenceEffect", () => ({
  useSettingsPersistenceEffect: jest.fn(),
}));

import { useSettingsPersistenceEffect } from "../state/useSettingsPersistenceEffect";
import { useSettingsPersistenceState } from "../state/useSettingsPersistenceState";
import { useSettingsPersistence } from "../state/useSettingsPersistence";

describe("useSettingsPersistence", () => {
  const form = {
    settings: {
      defaultDurationMinutes: 30,
      defaultNotificationMinutes: 0,
      theme: "auto" as const,
      swipeAction: "delete" as const,
      pomodoroFocusMinutes: 25,
      pomodoroBreakMinutes: 5,
    },
    durationInput: "30",
    notificationInput: "0",
    pomodoroFocusInput: "25",
    pomodoroBreakInput: "5",
    backgroundRefreshIntervalInput: "30",
  };

  const trainDelay = {
    trainDelayEnabled: false,
    monitoredLines: [],
  };

  const persistenceState = {
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
    menuOrder: ["weather"],
    setMenuOrder: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSettingsPersistenceState as jest.Mock).mockReturnValue(
      persistenceState,
    );
  });

  it("state hook の戻り値を返す", () => {
    const { result } = renderHook(() =>
      useSettingsPersistence({ form, trainDelay }),
    );

    expect(result.current).toBe(persistenceState);
  });

  it("effect hook に state と引数を橋渡しする", () => {
    renderHook(() => useSettingsPersistence({ form, trainDelay }));

    expect(useSettingsPersistenceEffect).toHaveBeenCalledWith({
      form,
      trainDelay,
      visibleFeatures: persistenceState.visibleFeatures,
      menuOrder: persistenceState.menuOrder,
    });
  });
});
