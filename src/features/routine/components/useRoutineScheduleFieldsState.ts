import { useState } from "react";

type UseRoutineScheduleFieldsStateParams = {
  initialDaysOfWeek: number[];
  initialStartTime: string;
  initialDuration: string;
};

export const useRoutineScheduleFieldsState = ({
  initialDaysOfWeek,
  initialStartTime,
  initialDuration,
}: UseRoutineScheduleFieldsStateParams) => {
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(initialDaysOfWeek);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [duration, setDuration] = useState(initialDuration);

  return {
    daysOfWeek,
    setDaysOfWeek,
    startTime,
    setStartTime,
    duration,
    setDuration,
  };
};
