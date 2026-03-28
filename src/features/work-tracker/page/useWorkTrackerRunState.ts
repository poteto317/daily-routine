import { useWorkTrackerRunActions } from "./useWorkTrackerRunActions";
import { useWorkTrackerRunViewState } from "./useWorkTrackerRunViewState";
import { useWorkTrackerStartTimeState } from "./useWorkTrackerStartTimeState";
import { useWorkTrackerTimer } from "./useWorkTrackerTimer";
import { createWorkTrackerRunStateResult } from "./workTrackerRunStateResult";

type UseWorkTrackerRunStateParams = {
  initialIsRunning: boolean;
  initialElapsedTime: number;
  setShowInputForm: (value: boolean) => void;
};

export const useWorkTrackerRunState = ({
  initialIsRunning,
  initialElapsedTime,
  setShowInputForm,
}: UseWorkTrackerRunStateParams) => {
  const { elapsedTime, intervalRef, isRunning, setElapsedTime, setIsRunning } =
    useWorkTrackerRunViewState({
      initialElapsedTime,
      initialIsRunning,
    });
  const { clearStartTime, getStartTime, setStartTime } =
    useWorkTrackerStartTimeState();

  useWorkTrackerTimer({ isRunning, intervalRef, setElapsedTime });

  const { startTimer, stopTimer } = useWorkTrackerRunActions({
    setElapsedTime,
    setIsRunning,
    setShowInputForm,
    setStartTime,
  });

  return createWorkTrackerRunStateResult({
    clearStartTime,
    elapsedTime,
    getStartTime,
    isRunning,
    setElapsedTime,
    startTimer,
    stopTimer,
  });
};
