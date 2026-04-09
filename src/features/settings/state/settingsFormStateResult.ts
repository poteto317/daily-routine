import type { Dispatch, SetStateAction } from "react";
import type { AppSettings } from "@/types/routine";

type SettingsFormStateResultInput = {
  settings: AppSettings;
  setSettings: Dispatch<SetStateAction<AppSettings>>;
  durationInput: string;
  setDurationInput: Dispatch<SetStateAction<string>>;
  notificationInput: string;
  setNotificationInput: Dispatch<SetStateAction<string>>;
  pomodoroFocusInput: string;
  setPomodoroFocusInput: Dispatch<SetStateAction<string>>;
  pomodoroBreakInput: string;
  setPomodoroBreakInput: Dispatch<SetStateAction<string>>;
  backgroundRefreshIntervalInput: string;
  setBackgroundRefreshIntervalInput: Dispatch<SetStateAction<string>>;
  handleThemeChange: (nextTheme: AppSettings["theme"]) => void;
};

export const createSettingsFormStateResult = ({
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
}: SettingsFormStateResultInput) => ({
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
