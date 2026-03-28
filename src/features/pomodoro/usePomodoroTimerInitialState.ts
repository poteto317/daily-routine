import { useMemo } from "react";
import { getSettings } from "@/features/settings";
import { getTodayPomodoros } from "./storage";
import { createInitialPomodoroViewState } from "./pomodoroViewStateActions";

export const usePomodoroTimerInitialState = () => {
  return useMemo(() => {
    const settings = getSettings();

    return createInitialPomodoroViewState({
      focusMinutes: settings.pomodoroFocusMinutes,
      breakMinutes: settings.pomodoroBreakMinutes,
      completedToday: getTodayPomodoros(),
    });
  }, []);
};
