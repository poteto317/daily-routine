import { createSettingsFormStateResult } from "../state/settingsFormStateResult";

describe("createSettingsFormStateResult", () => {
  it("settings form state の公開 shape を返す", () => {
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
    const setDurationInput = jest.fn();
    const setNotificationInput = jest.fn();
    const setPomodoroFocusInput = jest.fn();
    const setPomodoroBreakInput = jest.fn();
    const handleThemeChange = jest.fn();

    expect(
      createSettingsFormStateResult({
        settings,
        setSettings,
        durationInput: "30",
        setDurationInput,
        notificationInput: "0",
        setNotificationInput,
        pomodoroFocusInput: "25",
        setPomodoroFocusInput,
        pomodoroBreakInput: "5",
        setPomodoroBreakInput,
        handleThemeChange,
      }),
    ).toEqual({
      settings,
      setSettings,
      durationInput: "30",
      setDurationInput,
      notificationInput: "0",
      setNotificationInput,
      pomodoroFocusInput: "25",
      setPomodoroFocusInput,
      pomodoroBreakInput: "5",
      setPomodoroBreakInput,
      handleThemeChange,
    });
  });
});
