import { POMODORO_DISPLAY_TEXT } from "./texts";

export type TimerState = "focus" | "break" | "idle";

export const getProgressPercentage = (
  timerState: TimerState,
  timeLeft: number,
  focusMinutes: number,
  breakMinutes: number,
): number => {
  const totalSeconds =
    timerState === "focus"
      ? focusMinutes * 60
      : timerState === "break"
        ? breakMinutes * 60
        : focusMinutes * 60;
  return ((totalSeconds - timeLeft) / totalSeconds) * 100;
};

export const getStateText = (timerState: TimerState): string => {
  if (timerState === "focus") return POMODORO_DISPLAY_TEXT.focusStateText;
  if (timerState === "break") return POMODORO_DISPLAY_TEXT.breakStateText;
  return POMODORO_DISPLAY_TEXT.idleStateText;
};

export const formatPomodoroTimer = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};
