import type { Dispatch, SetStateAction } from "react";
import { getTodayPomodoros, incrementTodayPomodoros } from "./storage";
import type { TimerState } from "./pomodoroDisplay";
import {
  createResetTimerState,
  createSkipToBreakState,
  createStartTimerState,
} from "./pomodoroTimerActions";
import {
  applyPomodoroTimerControlState,
  createPausedPomodoroState,
  runPomodoroCompletion,
} from "./pomodoroViewStateActions";

type SetBoolean = Dispatch<SetStateAction<boolean>>;
type SetNumber = Dispatch<SetStateAction<number>>;
type SetTimerState = Dispatch<SetStateAction<TimerState>>;
type TimerControlState = ReturnType<typeof createResetTimerState>;

const createPomodoroControlAction = (params: {
  createNextState: () => TimerControlState;
  setIsRunning: SetBoolean;
  setTimerState: SetTimerState;
  setTimeLeft: SetNumber;
}) => {
  const { createNextState, setIsRunning, setTimerState, setTimeLeft } = params;

  return () => {
    applyPomodoroTimerControlState({
      nextState: createNextState(),
      setIsRunning,
      setTimerState,
      setTimeLeft,
    });
  };
};

export const createHandleTimerCompleteAction = (params: {
  timerState: TimerState;
  focusMinutes: number;
  breakMinutes: number;
  audio: HTMLAudioElement | null;
  setIsRunning: SetBoolean;
  setCompletedToday: SetNumber;
  setTimerState: SetTimerState;
  setTimeLeft: SetNumber;
}) => {
  const {
    timerState,
    focusMinutes,
    breakMinutes,
    audio,
    setIsRunning,
    setCompletedToday,
    setTimerState,
    setTimeLeft,
  } = params;

  return () => {
    runPomodoroCompletion({
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
    });
  };
};

export const createPauseTimerAction = (params: {
  setIsRunning: SetBoolean;
}) => {
  const { setIsRunning } = params;

  return () => {
    setIsRunning(createPausedPomodoroState().isRunning);
  };
};

export const createResetTimerAction = (params: {
  focusMinutes: number;
  setIsRunning: SetBoolean;
  setTimerState: SetTimerState;
  setTimeLeft: SetNumber;
}) => {
  const { focusMinutes, setIsRunning, setTimerState, setTimeLeft } = params;

  return createPomodoroControlAction({
    createNextState: () => createResetTimerState(focusMinutes),
    setIsRunning,
    setTimerState,
    setTimeLeft,
  });
};

export const createSkipToBreakAction = (params: {
  breakMinutes: number;
  setIsRunning: SetBoolean;
  setTimerState: SetTimerState;
  setTimeLeft: SetNumber;
}) => {
  const { breakMinutes, setIsRunning, setTimerState, setTimeLeft } = params;

  return createPomodoroControlAction({
    createNextState: () => createSkipToBreakState(breakMinutes),
    setIsRunning,
    setTimerState,
    setTimeLeft,
  });
};

export const createStartTimerAction = (params: {
  timerState: TimerState;
  focusMinutes: number;
  timeLeft: number;
  setIsRunning: SetBoolean;
  setTimerState: SetTimerState;
  setTimeLeft: SetNumber;
}) => {
  const {
    timerState,
    focusMinutes,
    timeLeft,
    setIsRunning,
    setTimerState,
    setTimeLeft,
  } = params;

  return createPomodoroControlAction({
    createNextState: () =>
      createStartTimerState(timerState, focusMinutes, timeLeft),
    setIsRunning,
    setTimerState,
    setTimeLeft,
  });
};
