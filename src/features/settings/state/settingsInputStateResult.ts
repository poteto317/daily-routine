import type { Dispatch, SetStateAction } from "react";

type SettingsInputStateResultInput = {
  durationInput: string;
  notificationInput: string;
  pomodoroFocusInput: string;
  pomodoroBreakInput: string;
  backgroundRefreshIntervalInput: string;
  setDurationInput: Dispatch<SetStateAction<string>>;
  setNotificationInput: Dispatch<SetStateAction<string>>;
  setPomodoroFocusInput: Dispatch<SetStateAction<string>>;
  setPomodoroBreakInput: Dispatch<SetStateAction<string>>;
  setBackgroundRefreshIntervalInput: Dispatch<SetStateAction<string>>;
};

export const createSettingsInputStateResult = ({
  durationInput,
  notificationInput,
  pomodoroFocusInput,
  pomodoroBreakInput,
  backgroundRefreshIntervalInput,
  setDurationInput,
  setNotificationInput,
  setPomodoroFocusInput,
  setPomodoroBreakInput,
  setBackgroundRefreshIntervalInput,
}: SettingsInputStateResultInput) => ({
  durationInput,
  notificationInput,
  pomodoroFocusInput,
  pomodoroBreakInput,
  backgroundRefreshIntervalInput,
  setDurationInput,
  setNotificationInput,
  setPomodoroFocusInput,
  setPomodoroBreakInput,
  setBackgroundRefreshIntervalInput,
});
