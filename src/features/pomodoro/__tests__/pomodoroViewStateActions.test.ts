import {
  applyPomodoroTimerControlState,
  createInitialPomodoroViewState,
  createPausedPomodoroState,
  runPomodoroCompletion,
  shouldShowSkipToBreak,
} from "../pomodoroViewStateActions";

jest.mock("../pomodoroTimerActions", () => ({
  applyPomodoroCompletion: jest.fn(),
}));

import { applyPomodoroCompletion } from "../pomodoroTimerActions";

describe("pomodoroViewStateActions", () => {
  it("初期 state を作る", () => {
    expect(
      createInitialPomodoroViewState({
        focusMinutes: 25,
        breakMinutes: 5,
        completedToday: 3,
      }),
    ).toEqual({
      focusMinutes: 25,
      breakMinutes: 5,
      timerState: "idle",
      timeLeft: 1500,
      isRunning: false,
      completedToday: 3,
    });
  });

  it("control state を setter へ反映する", () => {
    const setIsRunning = jest.fn();
    const setTimerState = jest.fn();
    const setTimeLeft = jest.fn();

    applyPomodoroTimerControlState({
      nextState: {
        nextIsRunning: true,
        nextTimerState: "focus",
        nextTimeLeft: 1500,
      },
      setIsRunning,
      setTimerState,
      setTimeLeft,
    });

    expect(setIsRunning).toHaveBeenCalledWith(true);
    expect(setTimerState).toHaveBeenCalledWith("focus");
    expect(setTimeLeft).toHaveBeenCalledWith(1500);
  });

  it("completion action を委譲する", () => {
    const args = {
      timerState: "focus" as const,
      focusMinutes: 25,
      breakMinutes: 5,
      audio: null,
      incrementTodayPomodoros: jest.fn(),
      getTodayPomodoros: jest.fn(() => 2),
      setIsRunning: jest.fn(),
      setCompletedToday: jest.fn(),
      setTimerState: jest.fn(),
      setTimeLeft: jest.fn(),
    };

    runPomodoroCompletion(args);

    expect(applyPomodoroCompletion).toHaveBeenCalledWith(args);
  });

  it("pause state と skip 表示判定を返す", () => {
    expect(createPausedPomodoroState()).toEqual({ isRunning: false });
    expect(shouldShowSkipToBreak("focus")).toBe(true);
    expect(shouldShowSkipToBreak("break")).toBe(false);
  });
});
