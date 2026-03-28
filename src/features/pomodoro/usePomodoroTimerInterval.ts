import { useEffect, useRef } from "react";
import {
  resolveTimerTick,
  shouldStartPomodoroInterval,
} from "./pomodoroTimerRuntime";

type UsePomodoroTimerIntervalParams = {
  isRunning: boolean;
  timeLeft: number;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  handleTimerComplete: () => void;
};

export const usePomodoroTimerInterval = ({
  isRunning,
  timeLeft,
  setTimeLeft,
  handleTimerComplete,
}: UsePomodoroTimerIntervalParams) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (shouldStartPomodoroInterval(isRunning, timeLeft)) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((value) => {
          const tickResult = resolveTimerTick(value);
          if (tickResult.shouldComplete) {
            setTimeout(() => handleTimerComplete(), 0);
          }
          return tickResult.nextTimeLeft;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [handleTimerComplete, isRunning, setTimeLeft, timeLeft]);
};
