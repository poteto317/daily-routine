import type { Dispatch, SetStateAction } from "react";

type WorkTrackerRunStateResultArgs = {
  clearStartTime: () => void;
  elapsedTime: number;
  getStartTime: () => Date | null;
  isRunning: boolean;
  setElapsedTime: Dispatch<SetStateAction<number>>;
  startTimer: () => void;
  stopTimer: () => void;
};

export const createWorkTrackerRunStateResult = ({
  clearStartTime,
  elapsedTime,
  getStartTime,
  isRunning,
  setElapsedTime,
  startTimer,
  stopTimer,
}: WorkTrackerRunStateResultArgs) => {
  return {
    clearStartTime,
    elapsedTime,
    getStartTime,
    isRunning,
    setElapsedTime,
    startTimer,
    stopTimer,
  };
};
