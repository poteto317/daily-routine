import { useState } from "react";
import { createSettingsInputStateResult } from "./settingsInputStateResult";

type SettingsInputInitialState = {
  durationInput: string;
  notificationInput: string;
  pomodoroFocusInput: string;
  pomodoroBreakInput: string;
};

export const useSettingsInputState = (
  initialState: SettingsInputInitialState,
) => {
  const [durationInput, setDurationInput] = useState<string>(
    initialState.durationInput,
  );
  const [notificationInput, setNotificationInput] = useState<string>(
    initialState.notificationInput,
  );
  const [pomodoroFocusInput, setPomodoroFocusInput] = useState<string>(
    initialState.pomodoroFocusInput,
  );
  const [pomodoroBreakInput, setPomodoroBreakInput] = useState<string>(
    initialState.pomodoroBreakInput,
  );

  return createSettingsInputStateResult({
    durationInput,
    notificationInput,
    pomodoroBreakInput,
    pomodoroFocusInput,
    setDurationInput,
    setNotificationInput,
    setPomodoroBreakInput,
    setPomodoroFocusInput,
  });
};
