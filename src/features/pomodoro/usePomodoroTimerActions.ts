import type { Dispatch, SetStateAction } from "react";
import { useCallback } from "react";
import { shouldShowSkipToBreak } from "./pomodoroViewStateActions";
import { createPomodoroTimerActionsResult } from "./pomodoroTimerActionsResult";
import {
  createHandleTimerCompleteAction,
  createPauseTimerAction,
  createResetTimerAction,
  createSkipToBreakAction,
  createStartTimerAction,
} from "./pomodoroTimerHookActions";
import type { TimerState } from "./pomodoroDisplay";

type UsePomodoroTimerActionsParams = {
  audio: HTMLAudioElement | null;
  breakMinutes: number;
  completedToday: number;
  focusMinutes: number;
  timerState: TimerState;
  timeLeft: number;
  setCompletedToday: Dispatch<SetStateAction<number>>;
  setIsRunning: Dispatch<SetStateAction<boolean>>;
  setTimeLeft: Dispatch<SetStateAction<number>>;
  setTimerState: Dispatch<SetStateAction<TimerState>>;
};

export const usePomodoroTimerActions = ({
  audio,
  breakMinutes,
  completedToday,
  focusMinutes,
  timerState,
  timeLeft,
  setCompletedToday,
  setIsRunning,
  setTimeLeft,
  setTimerState,
}: UsePomodoroTimerActionsParams) => {
  const handleTimerComplete = useCallback(() => {
    createHandleTimerCompleteAction({
      timerState,
      focusMinutes,
      breakMinutes,
      audio,
      setIsRunning,
      setCompletedToday,
      setTimerState,
      setTimeLeft,
    })();
  }, [
    audio,
    breakMinutes,
    focusMinutes,
    setCompletedToday,
    setIsRunning,
    setTimeLeft,
    setTimerState,
    timerState,
  ]);

  return createPomodoroTimerActionsResult({
    completedToday,
    handleTimerComplete,
    pauseTimer: createPauseTimerAction({ setIsRunning }),
    resetTimer: createResetTimerAction({
      focusMinutes,
      setIsRunning,
      setTimerState,
      setTimeLeft,
    }),
    showSkipToBreak: shouldShowSkipToBreak(timerState),
    skipToBreak: createSkipToBreakAction({
      breakMinutes,
      setIsRunning,
      setTimerState,
      setTimeLeft,
    }),
    startTimer: createStartTimerAction({
      timerState,
      focusMinutes,
      timeLeft,
      setIsRunning,
      setTimerState,
      setTimeLeft,
    }),
  });
};
