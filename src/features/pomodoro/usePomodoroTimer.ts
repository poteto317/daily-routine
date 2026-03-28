import { usePomodoroAudio } from "./usePomodoroAudio";
import { usePomodoroTimerInterval } from "./usePomodoroTimerInterval";
import { usePomodoroTimerState } from "./usePomodoroTimerState";

export const usePomodoroTimer = () => {
  const audio = usePomodoroAudio();
  const { setTimeLeft, handleTimerComplete, ...timerState } =
    usePomodoroTimerState({ audio });

  usePomodoroTimerInterval({
    isRunning: timerState.isRunning,
    timeLeft: timerState.timeLeft,
    setTimeLeft,
    handleTimerComplete,
  });

  return timerState;
};
