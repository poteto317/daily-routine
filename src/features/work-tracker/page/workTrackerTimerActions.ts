type SetValue<T> = (value: T) => void;

import { stopWorkTrackerTimer } from "./stateActions";

export const createWorkTrackerStartTimerAction = (params: {
  setElapsedTime: SetValue<number>;
  setIsRunning: SetValue<boolean>;
  setStartTime: (date: Date) => void;
}) => {
  return () => {
    const { setElapsedTime, setIsRunning, setStartTime } = params;
    const now = new Date();

    setStartTime(now);
    setElapsedTime(0);
    setIsRunning(true);
  };
};

export const createWorkTrackerStopTimerAction = (params: {
  setIsRunning: SetValue<boolean>;
  setShowInputForm: SetValue<boolean>;
}) => {
  return () => {
    stopWorkTrackerTimer(params);
  };
};
