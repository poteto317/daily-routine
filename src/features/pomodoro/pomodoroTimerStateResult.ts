import type { usePomodoroTimerActions } from "./usePomodoroTimerActions";
import type { usePomodoroTimerViewState } from "./usePomodoroTimerViewState";

type PomodoroTimerStateResultArgs = {
  actions: ReturnType<typeof usePomodoroTimerActions>;
  viewState: ReturnType<typeof usePomodoroTimerViewState>;
};

export const createPomodoroTimerStateResult = ({
  actions,
  viewState,
}: PomodoroTimerStateResultArgs) => {
  return {
    breakMinutes: viewState.breakMinutes,
    focusMinutes: viewState.focusMinutes,
    isRunning: viewState.isRunning,
    timerState: viewState.timerState,
    timeLeft: viewState.timeLeft,
    setTimeLeft: viewState.setTimeLeft,
    ...actions,
  };
};
