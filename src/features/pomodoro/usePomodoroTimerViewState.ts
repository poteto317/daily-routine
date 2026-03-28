import { usePomodoroTimerInitialState } from "./usePomodoroTimerInitialState";
import { usePomodoroTimerConfigState } from "./usePomodoroTimerConfigState";
import { usePomodoroTimerRuntimeState } from "./usePomodoroTimerRuntimeState";
import { createPomodoroTimerViewStateResult } from "./pomodoroTimerViewStateResult";

export const usePomodoroTimerViewState = () => {
  const initialState = usePomodoroTimerInitialState();
  const configState = usePomodoroTimerConfigState({
    breakMinutes: initialState.breakMinutes,
    focusMinutes: initialState.focusMinutes,
  });
  const runtimeState = usePomodoroTimerRuntimeState({
    completedToday: initialState.completedToday,
    isRunning: initialState.isRunning,
    timeLeft: initialState.timeLeft,
    timerState: initialState.timerState,
  });

  return createPomodoroTimerViewStateResult({
    configState,
    runtimeState,
  });
};
