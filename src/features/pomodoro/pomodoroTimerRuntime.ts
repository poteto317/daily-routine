import { POMODORO_BEEP_DATA_URL } from "./pomodoroAudio";

type TimerTickResult = {
  nextTimeLeft: number;
  shouldComplete: boolean;
};

export const createPomodoroAudio = (): HTMLAudioElement | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return new Audio(POMODORO_BEEP_DATA_URL);
};

export const shouldStartPomodoroInterval = (
  isRunning: boolean,
  timeLeft: number,
): boolean => {
  return isRunning && timeLeft > 0;
};

export const resolveTimerTick = (timeLeft: number): TimerTickResult => {
  if (timeLeft <= 1) {
    return {
      nextTimeLeft: 0,
      shouldComplete: true,
    };
  }

  return {
    nextTimeLeft: timeLeft - 1,
    shouldComplete: false,
  };
};
