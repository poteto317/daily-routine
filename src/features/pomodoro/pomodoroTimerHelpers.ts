import type { TimerState } from "./pomodoroDisplay";
import { POMODORO_NOTIFICATION_TEXT } from "./texts";

type TimerCompletionResult = {
  nextState: TimerState;
  nextTimeLeft: number;
  shouldIncrementPomodoros: boolean;
};

export const playTimerCompletionSound = (
  audio: HTMLAudioElement | null,
): void => {
  audio?.play().catch(() => undefined);
};

export const notifyTimerCompletion = (timerState: TimerState): void => {
  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {
    return;
  }

  if (timerState === "focus") {
    new Notification(POMODORO_NOTIFICATION_TEXT.focusCompleteTitle, {
      body: POMODORO_NOTIFICATION_TEXT.focusCompleteBody,
      icon: "/icon-192x192.png",
    });
  }

  if (timerState === "break") {
    new Notification(POMODORO_NOTIFICATION_TEXT.breakCompleteTitle, {
      body: POMODORO_NOTIFICATION_TEXT.breakCompleteBody,
      icon: "/icon-192x192.png",
    });
  }
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
