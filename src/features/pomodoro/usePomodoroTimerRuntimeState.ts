import { useState } from "react";
import type { TimerState } from "./pomodoroDisplay";

type PomodoroTimerRuntimeStateParams = {
  completedToday: number;
  isRunning: boolean;
  timeLeft: number;
  timerState: TimerState;
};

export const usePomodoroTimerRuntimeState = ({
  completedToday,
  isRunning,
  timeLeft,
  timerState,
}: PomodoroTimerRuntimeStateParams) => {
  const [currentTimerState, setTimerState] = useState<TimerState>(timerState);
  const [currentTimeLeft, setTimeLeft] = useState(timeLeft);
  const [currentIsRunning, setIsRunning] = useState(isRunning);
  const [currentCompletedToday, setCompletedToday] = useState(completedToday);

  return {
    completedToday: currentCompletedToday,
    isRunning: currentIsRunning,
    setCompletedToday,
    setIsRunning,
    setTimeLeft,
    setTimerState,
    timeLeft: currentTimeLeft,
    timerState: currentTimerState,
  };
};
