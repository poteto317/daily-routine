import { useRef, useState } from "react";

type UseWorkTrackerRunViewStateParams = {
  initialElapsedTime: number;
  initialIsRunning: boolean;
};

export const useWorkTrackerRunViewState = ({
  initialElapsedTime,
  initialIsRunning,
}: UseWorkTrackerRunViewStateParams) => {
  const [isRunning, setIsRunning] = useState(initialIsRunning);
  const [elapsedTime, setElapsedTime] = useState(initialElapsedTime);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  return {
    elapsedTime,
    intervalRef,
    isRunning,
    setElapsedTime,
    setIsRunning,
  };
};
