import { createPomodoroTimerStateResult } from "../pomodoroTimerStateResult";

describe("pomodoroTimerStateResult", () => {
  it("timer state hook の公開 shape を組み立てる", () => {
    const handleTimerComplete = jest.fn();
    const pauseTimer = jest.fn();
    const resetTimer = jest.fn();
    const setCompletedToday = jest.fn();
    const setIsRunning = jest.fn();
    const setTimeLeft = jest.fn();
    const setTimerState = jest.fn();
    const skipToBreak = jest.fn();
    const startTimer = jest.fn();

    expect(
      createPomodoroTimerStateResult({
        actions: {
          completedToday: 2,
          handleTimerComplete,
          pauseTimer,
          resetTimer,
          showSkipToBreak: false,
          skipToBreak,
          startTimer,
        },
        viewState: {
          breakMinutes: 5,
          completedToday: 2,
          focusMinutes: 25,
          isRunning: false,
          setCompletedToday,
          setIsRunning,
          setTimeLeft,
          setTimerState,
          timeLeft: 1500,
          timerState: "idle",
        },
      }),
    ).toEqual({
      breakMinutes: 5,
      completedToday: 2,
      focusMinutes: 25,
      handleTimerComplete,
      isRunning: false,
      pauseTimer,
      resetTimer,
      setTimeLeft,
      showSkipToBreak: false,
      skipToBreak,
      startTimer,
      timeLeft: 1500,
      timerState: "idle",
    });
  });
});
