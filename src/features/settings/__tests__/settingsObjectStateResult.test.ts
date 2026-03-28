import { createSettingsObjectStateResult } from "../state/settingsObjectStateResult";

describe("createSettingsObjectStateResult", () => {
  it("settings object state の公開 shape を返す", () => {
    const settings = {
      defaultDurationMinutes: 30,
      defaultNotificationMinutes: 0,
      theme: "auto" as const,
      swipeAction: "delete" as const,
      pomodoroFocusMinutes: 25,
      pomodoroBreakMinutes: 5,
      menuOrder: [],
    };
    const setSettings = jest.fn();

    expect(
      createSettingsObjectStateResult({
        settings,
        setSettings,
      }),
    ).toEqual({
      settings,
      setSettings,
    });
  });
});
