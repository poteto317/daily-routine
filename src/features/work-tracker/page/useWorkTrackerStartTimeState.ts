import { useCallback, useRef } from "react";

export const useWorkTrackerStartTimeState = () => {
  const startTimeRef = useRef<Date | null>(null);

  const clearStartTime = useCallback(() => {
    startTimeRef.current = null;
  }, []);

  const setStartTime = useCallback((date: Date) => {
    startTimeRef.current = date;
  }, []);

  const getStartTime = useCallback(() => {
    return startTimeRef.current;
  }, []);

  return {
    clearStartTime,
    getStartTime,
    setStartTime,
  };
};
