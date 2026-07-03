import type { TimerState } from "./pomodoroDisplay";

export type TimerCompletionResult = {
  nextState: TimerState;
  nextTimeLeft: number;
  shouldIncrementPomodoros: boolean;
};

export const getCompletionTransition = (
  timerState: TimerState,
  focusMinutes: number,
  breakMinutes: number,
): TimerCompletionResult => {
  if (timerState === "focus") {
    return {
      nextState: "break",
      nextTimeLeft: breakMinutes * 60,
      shouldIncrementPomodoros: true,
    };
  }

  if (timerState === "break") {
    return {
      nextState: "focus",
      nextTimeLeft: focusMinutes * 60,
      shouldIncrementPomodoros: false,
    };
  }

  return {
    nextState: "focus",
    nextTimeLeft: focusMinutes * 60,
    shouldIncrementPomodoros: false,
  };
};
