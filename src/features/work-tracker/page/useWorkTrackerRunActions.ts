import { useCallback } from "react";
import {
  createWorkTrackerStartTimerHandler,
  createWorkTrackerStopTimerHandler,
} from "./workTrackerHookActions";
import { createWorkTrackerRunActionsResult } from "./workTrackerRunActionsResult";

type SetValue<T> = (value: T) => void;

type UseWorkTrackerRunActionsParams = {
  setElapsedTime: SetValue<number>;
  setIsRunning: SetValue<boolean>;
  setShowInputForm: SetValue<boolean>;
  setStartTime: (date: Date) => void;
};

export const useWorkTrackerRunActions = ({
  setElapsedTime,
  setIsRunning,
  setShowInputForm,
  setStartTime,
}: UseWorkTrackerRunActionsParams) => {
  const startTimer = useCallback(() => {
    createWorkTrackerStartTimerHandler({
      setElapsedTime,
      setIsRunning,
      setStartTime,
    })();
  }, [setElapsedTime, setIsRunning, setStartTime]);

  const stopTimer = useCallback(() => {
    createWorkTrackerStopTimerHandler({
      setIsRunning,
      setShowInputForm,
    })();
  }, [setIsRunning, setShowInputForm]);

  return createWorkTrackerRunActionsResult({
    startTimer,
    stopTimer,
  });
};
