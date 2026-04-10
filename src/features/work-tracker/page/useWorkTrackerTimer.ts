import {
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
  useEffect,
} from "react";

type Params = {
  isRunning: boolean;
  intervalRef: MutableRefObject<NodeJS.Timeout | null>;
  setElapsedTime: Dispatch<SetStateAction<number>>;
};

export const useWorkTrackerTimer = ({
  isRunning,
  intervalRef,
  setElapsedTime,
}: Params) => {
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(
        () => setElapsedTime((prev) => prev + 1),
        1000,
      );
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [intervalRef, isRunning, setElapsedTime]);
};
