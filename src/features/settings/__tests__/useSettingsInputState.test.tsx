import { act, renderHook } from "@testing-library/react";
import { createSettingsInputStateResult } from "../state/settingsInputStateResult";
import { useSettingsInputState } from "../state/useSettingsInputState";

jest.mock("../state/settingsInputStateResult", () => ({
  createSettingsInputStateResult: jest.fn(),
}));

describe("useSettingsInputState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createSettingsInputStateResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("settings input 群を保持する", () => {
    const { result } = renderHook(() =>
      useSettingsInputState({
        durationInput: "30",
        notificationInput: "0",
        pomodoroFocusInput: "25",
        pomodoroBreakInput: "5",
        backgroundRefreshIntervalInput: "30",
      }),
    );

    expect(createSettingsInputStateResult).toHaveBeenCalledWith({
      durationInput: "30",
      notificationInput: "0",
      pomodoroFocusInput: "25",
      pomodoroBreakInput: "5",
      backgroundRefreshIntervalInput: "30",
      setDurationInput: expect.any(Function),
      setNotificationInput: expect.any(Function),
      setPomodoroFocusInput: expect.any(Function),
      setPomodoroBreakInput: expect.any(Function),
      setBackgroundRefreshIntervalInput: expect.any(Function),
    });

    act(() => {
      result.current.setDurationInput("45");
      result.current.setNotificationInput("10");
      result.current.setPomodoroFocusInput("50");
      result.current.setPomodoroBreakInput("15");
    });

    expect(result.current.durationInput).toBe("45");
    expect(result.current.notificationInput).toBe("10");
    expect(result.current.pomodoroFocusInput).toBe("50");
    expect(result.current.pomodoroBreakInput).toBe("15");
    expect(createSettingsInputStateResult).toHaveBeenLastCalledWith({
      durationInput: "45",
      notificationInput: "10",
      pomodoroFocusInput: "50",
      pomodoroBreakInput: "15",
      backgroundRefreshIntervalInput: "30",
      setDurationInput: expect.any(Function),
      setNotificationInput: expect.any(Function),
      setPomodoroFocusInput: expect.any(Function),
      setPomodoroBreakInput: expect.any(Function),
      setBackgroundRefreshIntervalInput: expect.any(Function),
    });
  });
});
