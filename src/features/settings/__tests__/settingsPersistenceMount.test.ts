import type { AppSettings } from "@/types/routine";
import { persistSettingsAfterMount } from "../state/settingsPersistenceMount";

const baseSettings: AppSettings = {
  defaultDurationMinutes: 30,
  defaultNotificationMinutes: 0,
  theme: "auto",
  swipeAction: "delete",
  pomodoroFocusMinutes: 25,
  pomodoroBreakMinutes: 5,
};

describe("settingsPersistenceMount", () => {
  it("初回は保存をスキップし、以後は保存する", () => {
    const didMountRef = { current: false };
    const saveSettings = jest.fn();
    const applyTheme = jest.fn();

    expect(
      persistSettingsAfterMount({
        didMountRef,
        updatedSettings: baseSettings,
        saveSettings,
        applyTheme,
      }),
    ).toBe(false);
    expect(saveSettings).not.toHaveBeenCalled();

    expect(
      persistSettingsAfterMount({
        didMountRef,
        updatedSettings: baseSettings,
        saveSettings,
        applyTheme,
      }),
    ).toBe(true);
    expect(saveSettings).toHaveBeenCalledWith(baseSettings);
    expect(applyTheme).toHaveBeenCalledWith("auto");
  });
});