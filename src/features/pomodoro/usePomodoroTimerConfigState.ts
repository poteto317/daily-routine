type PomodoroTimerConfigStateParams = {
  focusMinutes: number;
  breakMinutes: number;
};

export const usePomodoroTimerConfigState = ({
  focusMinutes,
  breakMinutes,
}: PomodoroTimerConfigStateParams) => {
  return {
    breakMinutes,
    focusMinutes,
  };
};
