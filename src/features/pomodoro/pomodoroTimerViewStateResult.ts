type PomodoroTimerViewStateResultArgs = {
  configState: {
    breakMinutes: number;
    focusMinutes: number;
  };
  runtimeState: {
    completedToday: number;
    isRunning: boolean;
    setCompletedToday: (value: React.SetStateAction<number>) => void;
    setIsRunning: (value: React.SetStateAction<boolean>) => void;
    setTimeLeft: (value: React.SetStateAction<number>) => void;
    setTimerState: (
      value: React.SetStateAction<import("./pomodoroDisplay").TimerState>,
    ) => void;
    timeLeft: number;
    timerState: import("./pomodoroDisplay").TimerState;
  };
};

export const createPomodoroTimerViewStateResult = ({
  configState,
  runtimeState,
}: PomodoroTimerViewStateResultArgs) => {
  return {
    ...configState,
    ...runtimeState,
  };
};
