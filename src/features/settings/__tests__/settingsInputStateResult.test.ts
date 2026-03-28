import { createSettingsInputStateResult } from "../state/settingsInputStateResult";

describe("createSettingsInputStateResult", () => {
  it("settings input state の公開 shape を返す", () => {
    const setDurationInput = jest.fn();
    const setNotificationInput = jest.fn();
    const setPomodoroFocusInput = jest.fn();
    const setPomodoroBreakInput = jest.fn();

    expect(
      createSettingsInputStateResult({
        durationInput: "45",
        notificationInput: "10",
        pomodoroFocusInput: "50",
        pomodoroBreakInput: "15",
        setDurationInput,
        setNotificationInput,
        setPomodoroFocusInput,
        setPomodoroBreakInput,
      }),
    ).toEqual({
      durationInput: "45",
      notificationInput: "10",
      pomodoroFocusInput: "50",
      pomodoroBreakInput: "15",
      setDurationInput,
      setNotificationInput,
      setPomodoroFocusInput,
      setPomodoroBreakInput,
    });
  });
});
