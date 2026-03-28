import { usePomodoroTimerActions } from "./usePomodoroTimerActions";
import { createPomodoroTimerStateResult } from "./pomodoroTimerStateResult";
import { usePomodoroTimerViewState } from "./usePomodoroTimerViewState";

type UsePomodoroTimerStateParams = {
  audio: HTMLAudioElement | null;
};

export const usePomodoroTimerState = ({
  audio,
}: UsePomodoroTimerStateParams) => {
  const {
    breakMinutes,
    completedToday,
    focusMinutes,
    isRunning,
    setCompletedToday,
    setIsRunning,
    setTimeLeft,
    setTimerState,
    timeLeft,
    timerState,
  } = usePomodoroTimerViewState();
  const actions = usePomodoroTimerActions({
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
  });

  return createPomodoroTimerStateResult({
    actions,
    viewState: {
      breakMinutes,
      completedToday,
      focusMinutes,
      isRunning,
      setCompletedToday,
      setIsRunning,
      setTimeLeft,
      setTimerState,
      timeLeft,
      timerState,
    },
  });
};
