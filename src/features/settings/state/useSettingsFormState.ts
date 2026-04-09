import { useState } from "react";
import { DEFAULT_SETTINGS, getSettings } from "@/features/settings/storage";
import { createSettingsFormStateResult } from "./settingsFormStateResult";
import { useSettingsInputState } from "./useSettingsInputState";
import { useSettingsObjectState } from "./useSettingsObjectState";
import { useSettingsThemeAction } from "./useSettingsThemeAction";

const createInitialSettingsFormState = () => {
  const initialSettings = getSettings();

  return {
    settings: initialSettings,
    durationInput: String(initialSettings.defaultDurationMinutes),
    notificationInput: String(initialSettings.defaultNotificationMinutes),
    pomodoroFocusInput: String(initialSettings.pomodoroFocusMinutes),
    pomodoroBreakInput: String(initialSettings.pomodoroBreakMinutes),
    backgroundRefreshIntervalInput: String(
      initialSettings.backgroundRefreshIntervalMinutes ??
        DEFAULT_SETTINGS.backgroundRefreshIntervalMinutes,
    ),
  };
};

export const useSettingsFormState = () => {
  const [initialState] = useState(createInitialSettingsFormState);
  const { settings, setSettings } = useSettingsObjectState(initialState);
  const {
    durationInput,
    notificationInput,
    pomodoroBreakInput,
    pomodoroFocusInput,
    setDurationInput,
    setNotificationInput,
    setPomodoroBreakInput,
    setPomodoroFocusInput,
    backgroundRefreshIntervalInput,
    setBackgroundRefreshIntervalInput,
  } = useSettingsInputState(initialState);
  const handleThemeChange = useSettingsThemeAction({ setSettings });

  return createSettingsFormStateResult({
    settings,
    setSettings,
    durationInput,
    setDurationInput,
    notificationInput,
    setNotificationInput,
    pomodoroFocusInput,
    setPomodoroFocusInput,
    pomodoroBreakInput,
    setPomodoroBreakInput,
    backgroundRefreshIntervalInput,
    setBackgroundRefreshIntervalInput,
    handleThemeChange,
  });
};

export { createInitialSettingsFormState };
