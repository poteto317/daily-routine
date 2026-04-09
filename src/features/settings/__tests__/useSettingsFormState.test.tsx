import { renderHook } from "@testing-library/react";

jest.mock("../state/settingsFormStateResult", () => ({
  createSettingsFormStateResult: jest.fn(),
}));

jest.mock("../state/useSettingsInputState", () => ({
  useSettingsInputState: jest.fn(),
}));

jest.mock("../state/useSettingsObjectState", () => ({
  useSettingsObjectState: jest.fn(),
}));

jest.mock("@/features/settings/storage", () => ({
  DEFAULT_SETTINGS: {
    defaultDurationMinutes: 30,
    defaultNotificationMinutes: 0,
    theme: "light",
    swipeAction: "delete",
    pomodoroFocusMinutes: 25,
    pomodoroBreakMinutes: 5,
    backgroundRefreshIntervalMinutes: 30,
  },
  getSettings: jest.fn(() => ({
    defaultDurationMinutes: 30,
    defaultNotificationMinutes: 0,
    theme: "auto",
    swipeAction: "delete",
    pomodoroFocusMinutes: 25,
    pomodoroBreakMinutes: 5,
    backgroundRefreshIntervalMinutes: 15,
    menuOrder: [],
  })),
}));

import { getSettings } from "@/features/settings/storage";
import { createSettingsFormStateResult } from "../state/settingsFormStateResult";
import { useSettingsInputState } from "../state/useSettingsInputState";
import { useSettingsObjectState } from "../state/useSettingsObjectState";
import { useSettingsFormState } from "../state/useSettingsFormState";
import { useSettingsThemeAction } from "../state/useSettingsThemeAction";

jest.mock("../state/useSettingsThemeAction", () => ({
  useSettingsThemeAction: jest.fn(),
}));

describe("useSettingsFormState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createSettingsFormStateResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("settings/input/theme action hook を compose する", () => {
    const objectState = {
      settings: {
        defaultDurationMinutes: 30,
        defaultNotificationMinutes: 0,
        theme: "auto",
        swipeAction: "delete",
        pomodoroFocusMinutes: 25,
        pomodoroBreakMinutes: 5,
        menuOrder: [],
      },
      setSettings: jest.fn(),
    };
    const inputState = {
      durationInput: "30",
      notificationInput: "0",
      pomodoroFocusInput: "25",
      pomodoroBreakInput: "5",
      backgroundRefreshIntervalInput: "15",
      setDurationInput: jest.fn(),
      setNotificationInput: jest.fn(),
      setPomodoroFocusInput: jest.fn(),
      setPomodoroBreakInput: jest.fn(),
      setBackgroundRefreshIntervalInput: jest.fn(),
    };
    const handleThemeChange = jest.fn();
    (useSettingsObjectState as jest.Mock).mockReturnValue(objectState);
    (useSettingsInputState as jest.Mock).mockReturnValue(inputState);
    (useSettingsThemeAction as jest.Mock).mockReturnValue(handleThemeChange);

    const { result } = renderHook(() => useSettingsFormState());

    expect(getSettings).toHaveBeenCalledTimes(1);
    expect(useSettingsObjectState).toHaveBeenCalledWith(
      expect.objectContaining({
        settings: expect.objectContaining({ theme: "auto" }),
      }),
    );
    expect(useSettingsInputState).toHaveBeenCalledWith(
      expect.objectContaining({
        durationInput: "30",
        notificationInput: "0",
        pomodoroFocusInput: "25",
        pomodoroBreakInput: "5",
        backgroundRefreshIntervalInput: "15",
      }),
    );
    expect(useSettingsThemeAction).toHaveBeenCalledWith({
      setSettings: objectState.setSettings,
    });
    expect(createSettingsFormStateResult).toHaveBeenCalledWith({
      settings: objectState.settings,
      setSettings: objectState.setSettings,
      durationInput: "30",
      setDurationInput: inputState.setDurationInput,
      notificationInput: "0",
      setNotificationInput: inputState.setNotificationInput,
      pomodoroFocusInput: "25",
      setPomodoroFocusInput: inputState.setPomodoroFocusInput,
      pomodoroBreakInput: "5",
      setPomodoroBreakInput: inputState.setPomodoroBreakInput,
      backgroundRefreshIntervalInput: "15",
      setBackgroundRefreshIntervalInput:
        inputState.setBackgroundRefreshIntervalInput,
      handleThemeChange,
    });
    expect(result.current).toEqual({
      settings: objectState.settings,
      setSettings: objectState.setSettings,
      durationInput: "30",
      setDurationInput: inputState.setDurationInput,
      notificationInput: "0",
      setNotificationInput: inputState.setNotificationInput,
      pomodoroFocusInput: "25",
      setPomodoroFocusInput: inputState.setPomodoroFocusInput,
      pomodoroBreakInput: "5",
      setPomodoroBreakInput: inputState.setPomodoroBreakInput,
      backgroundRefreshIntervalInput: "15",
      setBackgroundRefreshIntervalInput:
        inputState.setBackgroundRefreshIntervalInput,
      handleThemeChange,
    });
  });
});
