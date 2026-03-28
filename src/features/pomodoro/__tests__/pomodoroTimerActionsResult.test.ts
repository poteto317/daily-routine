import { createPomodoroTimerActionsResult } from "../pomodoroTimerActionsResult";

describe("pomodoroTimerActionsResult", () => {
  it("timer actions の公開 shape を組み立てる", () => {
    const handleTimerComplete = jest.fn();
    const pauseTimer = jest.fn();
    const resetTimer = jest.fn();
    const skipToBreak = jest.fn();
    const startTimer = jest.fn();

    expect(
      createPomodoroTimerActionsResult({
        completedToday: 2,
        handleTimerComplete,
        pauseTimer,
        resetTimer,
        showSkipToBreak: true,
        skipToBreak,
        startTimer,
      }),
    ).toEqual({
      completedToday: 2,
      handleTimerComplete,
      pauseTimer,
      resetTimer,
      showSkipToBreak: true,
      skipToBreak,
      startTimer,
    });
  });
});
