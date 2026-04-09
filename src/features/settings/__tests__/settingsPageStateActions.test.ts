import type { AppSettings } from "@/types/routine";
import type { VisibleFeaturesState } from "../state/featureVisibility";
import {
  buildUpdatedSettings,
  parseSettingNumber,
  parseSettingsNumbers,
  persistUpdatedSettings,
} from "../state/settingsPageStateActions";

describe("settingsPageStateActions", () => {
  const baseSettings: AppSettings = {
    defaultDurationMinutes: 30,
    defaultNotificationMinutes: 0,
    theme: "auto",
    swipeAction: "delete",
    pomodoroFocusMinutes: 25,
    pomodoroBreakMinutes: 5,
  };

  const visibleFeatures: VisibleFeaturesState = {
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

  it("数値設定を範囲内でパースする", () => {
    expect(parseSettingNumber("45", 1, 1440)).toBe(45);
  });

  it("不正な数値設定は null を返す", () => {
    expect(parseSettingNumber("0", 1, 1440)).toBeNull();
    expect(parseSettingNumber("abc", 1, 1440)).toBeNull();
  });

  it("5項目の設定値をまとめてパースする", () => {
    expect(parseSettingsNumbers("45", "10", "30", "5", "30")).toEqual({
      defaultDurationMinutes: 45,
      defaultNotificationMinutes: 10,
      pomodoroFocusMinutes: 30,
      pomodoroBreakMinutes: 5,
      backgroundRefreshIntervalMinutes: 30,
    });
  });

  it("いずれかが不正ならまとめて null を返す", () => {
    expect(parseSettingsNumbers("45", "200", "30", "5", "30")).toBeNull();
  });

  it("保存用settingsを組み立てる", () => {
    expect(
      buildUpdatedSettings({
        settings: baseSettings,
        durationInput: "45",
        notificationInput: "10",
        pomodoroFocusInput: "30",
        pomodoroBreakInput: "5",
        backgroundRefreshIntervalInput: "30",
        trainDelayEnabled: true,
        monitoredLines: [
          {
            lineId: "yamanote",
            lineName: "山手線",
            company: "JR東日本",
          },
        ],
        visibleFeatures,
      }),
    ).toEqual({
      ...baseSettings,
      defaultDurationMinutes: 45,
      defaultNotificationMinutes: 10,
      pomodoroFocusMinutes: 30,
      pomodoroBreakMinutes: 5,
      backgroundRefreshIntervalMinutes: 30,
      trainDelay: {
        enabled: true,
        monitoredLines: [
          {
            lineId: "yamanote",
            lineName: "山手線",
            company: "JR東日本",
          },
        ],
      },
      visibleFeatures,
    });
  });

  it("不正入力があれば settings を組み立てない", () => {
    expect(
      buildUpdatedSettings({
        settings: baseSettings,
        durationInput: "0",
        notificationInput: "10",
        pomodoroFocusInput: "30",
        pomodoroBreakInput: "5",
        backgroundRefreshIntervalInput: "30",
        trainDelayEnabled: false,
        monitoredLines: [],
        visibleFeatures,
      }),
    ).toBeNull();
  });

  it("有効なsettingsだけ保存してテーマ適用する", () => {
    const saveSettings = jest.fn();
    const applyTheme = jest.fn();

    expect(
      persistUpdatedSettings({
        updatedSettings: baseSettings,
        saveSettings,
        applyTheme,
      }),
    ).toBe(true);
    expect(saveSettings).toHaveBeenCalledWith(baseSettings);
    expect(applyTheme).toHaveBeenCalledWith("auto");
  });

  it("null settings は保存しない", () => {
    const saveSettings = jest.fn();
    const applyTheme = jest.fn();

    expect(
      persistUpdatedSettings({
        updatedSettings: null,
        saveSettings,
        applyTheme,
      }),
    ).toBe(false);
    expect(saveSettings).not.toHaveBeenCalled();
    expect(applyTheme).not.toHaveBeenCalled();
  });
});
