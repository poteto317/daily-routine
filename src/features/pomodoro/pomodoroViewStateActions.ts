import type { Dispatch, SetStateAction } from "react";
import type { TimerState } from "./pomodoroDisplay";
import { applyPomodoroCompletion } from "./pomodoroTimerActions";

type SetBoolean = Dispatch<SetStateAction<boolean>>;
type SetNumber = Dispatch<SetStateAction<number>>;
type SetTimerState = Dispatch<SetStateAction<TimerState>>;

type TimerControlState = {
  nextIsRunning: boolean;
  nextTimerState: TimerState;
  nextTimeLeft: number;
};

type InitialPomodoroViewStateArgs = {
  focusMinutes: number;
  breakMinutes: number;
  completedToday: number;
};

type ApplyTimerControlStateArgs = {
  nextState: TimerControlState;
  setIsRunning: SetBoolean;
  setTimerState: SetTimerState;
  setTimeLeft: SetNumber;
};

type RunPomodoroCompletionArgs = {
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

export const createInitialPomodoroViewState = ({
  focusMinutes,
  breakMinutes,
  completedToday,
}: InitialPomodoroViewStateArgs) => {
  return {
    focusMinutes,
    breakMinutes,
    timerState: "idle" as TimerState,
    timeLeft: focusMinutes * 60,
    isRunning: false,
    completedToday,
  };
};

export const applyPomodoroTimerControlState = ({
  nextState,
  setIsRunning,
  setTimerState,
  setTimeLeft,
}: ApplyTimerControlStateArgs) => {
  setIsRunning(nextState.nextIsRunning);
  setTimerState(nextState.nextTimerState);
  setTimeLeft(nextState.nextTimeLeft);
};

export const runPomodoroCompletion = (
  args: RunPomodoroCompletionArgs,
): void => {
  applyPomodoroCompletion(args);
};

export const createPausedPomodoroState = () => {
  return {
    isRunning: false,
  };
};

export const shouldShowSkipToBreak = (timerState: TimerState): boolean => {
  return timerState === "focus";
};
