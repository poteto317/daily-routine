import type { Dispatch, SetStateAction } from "react";

type SettingsInputStateResultInput = {
  durationInput: string;
  notificationInput: string;
  pomodoroFocusInput: string;
  pomodoroBreakInput: string;
  setDurationInput: Dispatch<SetStateAction<string>>;
  setNotificationInput: Dispatch<SetStateAction<string>>;
  setPomodoroFocusInput: Dispatch<SetStateAction<string>>;
  setPomodoroBreakInput: Dispatch<SetStateAction<string>>;
};

export const createSettingsInputStateResult = ({
  durationInput,
  notificationInput,
  pomodoroFocusInput,
  pomodoroBreakInput,
  setDurationInput,
  setNotificationInput,
  setPomodoroFocusInput,
  setPomodoroBreakInput,
}: SettingsInputStateResultInput) => ({
  durationInput,
  notificationInput,
  pomodoroFocusInput,
  pomodoroBreakInput,
  setDurationInput,
  setNotificationInput,
  setPomodoroFocusInput,
  setPomodoroBreakInput,
});
