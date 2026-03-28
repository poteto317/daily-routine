type PomodoroTimerActionsResultArgs = {
  completedToday: number;
  handleTimerComplete: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  showSkipToBreak: boolean;
  skipToBreak: () => void;
  startTimer: () => void;
};

export const createPomodoroTimerActionsResult = ({
  completedToday,
  handleTimerComplete,
  pauseTimer,
  resetTimer,
  showSkipToBreak,
  skipToBreak,
  startTimer,
}: PomodoroTimerActionsResultArgs) => {
  return {
    completedToday,
    handleTimerComplete,
    pauseTimer,
    resetTimer,
    showSkipToBreak,
    skipToBreak,
    startTimer,
  };
};
