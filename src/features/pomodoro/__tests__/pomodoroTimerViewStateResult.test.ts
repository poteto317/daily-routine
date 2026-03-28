import { createPomodoroTimerViewStateResult } from "../pomodoroTimerViewStateResult";

describe("pomodoroTimerViewStateResult", () => {
  it("view state の公開 shape を組み立てる", () => {
    const setCompletedToday = jest.fn();
    const setIsRunning = jest.fn();
    const setTimeLeft = jest.fn();
    const setTimerState = jest.fn();

    expect(
      createPomodoroTimerViewStateResult({
        configState: {
          breakMinutes: 5,
          focusMinutes: 25,
        },
        runtimeState: {
          completedToday: 2,
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
      isRunning: false,
      setCompletedToday,
      setIsRunning,
      setTimeLeft,
      setTimerState,
      timeLeft: 1500,
      timerState: "idle",
    });
  });
});
