import { renderHook } from "@testing-library/react";

jest.mock("@/features/settings/storage", () => ({
  saveSettings: jest.fn(),
}));

jest.mock("../state/theme", () => ({
  applyTheme: jest.fn(),
}));

import { saveSettings } from "@/features/settings/storage";
import { applyTheme } from "../state/theme";
import { useSettingsPersistenceEffect } from "../state/useSettingsPersistenceEffect";

describe("useSettingsPersistenceEffect", () => {
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

  const visibleFeatures = {
    journal: true,
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
  });

  it("初回レンダーでは自動保存しない", () => {
    renderHook(() =>
      useSettingsPersistenceEffect({
        form,
        trainDelay,
        visibleFeatures,
        menuOrder: [],
      }),
    );

    expect(saveSettings).not.toHaveBeenCalled();
    expect(applyTheme).not.toHaveBeenCalled();
  });

  it("依存値が更新されると有効な設定を保存する", () => {
    const { rerender } = renderHook(
      ({ nextForm }) =>
        useSettingsPersistenceEffect({
          form: nextForm,
          trainDelay,
          visibleFeatures,
          menuOrder: [],
        }),
      {
        initialProps: { nextForm: form },
      },
    );

    rerender({
      nextForm: {
        ...form,
        durationInput: "45",
      },
    });

    expect(saveSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultDurationMinutes: 45,
        defaultNotificationMinutes: 0,
      }),
    );
    expect(applyTheme).toHaveBeenCalledWith("auto");
  });

  it("不正な入力なら保存しない", () => {
    const { rerender } = renderHook(
      ({ nextForm }) =>
        useSettingsPersistenceEffect({
          form: nextForm,
          trainDelay,
          visibleFeatures,
          menuOrder: [],
        }),
      {
        initialProps: { nextForm: form },
      },
    );

    rerender({
      nextForm: {
        ...form,
        durationInput: "0",
      },
    });

    expect(saveSettings).not.toHaveBeenCalled();
    expect(applyTheme).not.toHaveBeenCalled();
  });
});
