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

/**
 * 画面の初期状態。戻り値型として宣言し、timerState を as で広げずに検査する
 * （as だと綴り違いの文字列も通ってしまうため）。
 */
type InitialPomodoroViewState = {
  focusMinutes: number;
  breakMinutes: number;
  timerState: TimerState;
  timeLeft: number;
  isRunning: boolean;
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
}: InitialPomodoroViewStateArgs): InitialPomodoroViewState => {
  return {
    focusMinutes,
    breakMinutes,
    timerState: "idle",
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
