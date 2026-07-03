import type { Dispatch, SetStateAction } from "react";
import type { TimerState } from "./pomodoroDisplay";
import { getCompletionTransition } from "./pomodoroCompletionTransition";
import { notifyTimerCompletion } from "./pomodoroCompletionNotification";
import { playTimerCompletionSound } from "./pomodoroCompletionSound";

type SetBoolean = Dispatch<SetStateAction<boolean>>;
type SetNumber = Dispatch<SetStateAction<number>>;
type SetTimerState = Dispatch<SetStateAction<TimerState>>;

type CompletionArgs = {
  timerState: TimerState;
  focusMinutes: number;
  breakMinutes: number;
  audio: HTMLAudioElement | null;
  incrementTodayPomodoros: () => number;
  getTodayPomodoros: () => number;
  setIsRunning: SetBoolean;
  setCompletedToday: SetNumber;
  setTimerState: SetTimerState;
  setTimeLeft: SetNumber;
};

type TimerControlState = {
  nextIsRunning: boolean;
  nextTimerState: TimerState;
  nextTimeLeft: number;
};

export const createResetTimerState = (
  focusMinutes: number,
): TimerControlState => {
  return {
    nextIsRunning: false,
    nextTimerState: "idle",
    nextTimeLeft: focusMinutes * 60,
  };
};

export const createSkipToBreakState = (
  breakMinutes: number,
): TimerControlState => {
  return {
    nextIsRunning: false,
    nextTimerState: "break",
    nextTimeLeft: breakMinutes * 60,
  };
};

export const createStartTimerState = (
  timerState: TimerState,
  focusMinutes: number,
  currentTimeLeft: number,
): TimerControlState => {
  if (timerState === "idle") {
    return {
      nextIsRunning: true,
      nextTimerState: "focus",
      nextTimeLeft: focusMinutes * 60,
    };
  }

  return {
    nextIsRunning: true,
    nextTimerState: timerState,
    nextTimeLeft: currentTimeLeft,
  };
};

export const applyPomodoroCompletion = ({
  timerState,
  focusMinutes,
  breakMinutes,
  audio,
  incrementTodayPomodoros,
  getTodayPomodoros,
  setIsRunning,
  setCompletedToday,
  setTimerState,
  setTimeLeft,
}: CompletionArgs): void => {
  playTimerCompletionSound(audio);
  notifyTimerCompletion(timerState);

  setIsRunning(false);

  const transition = getCompletionTransition(
    timerState,
    focusMinutes,
    breakMinutes,
  );

  if (transition.shouldIncrementPomodoros) {
    incrementTodayPomodoros();
    setCompletedToday(getTodayPomodoros());
  }

  setTimerState(transition.nextState);
  setTimeLeft(transition.nextTimeLeft);
};
