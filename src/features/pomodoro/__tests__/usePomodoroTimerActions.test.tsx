import { act, renderHook } from "@testing-library/react";

jest.mock("../pomodoroTimerActionsResult", () => ({
  createPomodoroTimerActionsResult: jest.fn(),
}));

jest.mock("../pomodoroTimerActions", () => ({
  createResetTimerState: jest.fn(() => ({
    nextIsRunning: false,
    nextTimerState: "idle",
    nextTimeLeft: 1500,
  })),
  createSkipToBreakState: jest.fn(() => ({
    nextIsRunning: false,
    nextTimerState: "break",
    nextTimeLeft: 300,
  })),
  createStartTimerState: jest.fn(
    (timerState: string, _focusMinutes: number, timeLeft: number) => ({
      nextIsRunning: true,
      nextTimerState: timerState === "idle" ? "focus" : timerState,
      nextTimeLeft: timerState === "idle" ? 1500 : timeLeft,
    }),
  ),
}));

jest.mock("../storage", () => ({
  getTodayPomodoros: jest.fn(() => 2),
  incrementTodayPomodoros: jest.fn(),
}));

jest.mock("../pomodoroViewStateActions", () => ({
  ...jest.requireActual("../pomodoroViewStateActions"),
  applyPomodoroTimerControlState: jest.fn(),
  createPausedPomodoroState: jest.fn(() => ({ isRunning: false })),
  runPomodoroCompletion: jest.fn(),
  shouldShowSkipToBreak: jest.fn(
    (timerState: string) => timerState === "focus",
  ),
}));

import { createStartTimerState } from "../pomodoroTimerActions";
import { createPomodoroTimerActionsResult } from "../pomodoroTimerActionsResult";
import {
  runPomodoroCompletion,
  shouldShowSkipToBreak,
} from "../pomodoroViewStateActions";
import { usePomodoroTimerActions } from "../usePomodoroTimerActions";

describe("usePomodoroTimerActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createPomodoroTimerActionsResult as jest.Mock).mockImplementation(
      (params) => params,
    );
  });

  it("timer action と表示フラグを組み立てる", () => {
    const params = createParams();
    const { result } = renderHook(() => usePomodoroTimerActions(params));

    expect(result.current.showSkipToBreak).toBe(false);

    act(() => {
      result.current.startTimer();
      result.current.skipToBreak();
      result.current.resetTimer();
      result.current.pauseTimer();
      result.current.handleTimerComplete();
    });

    expect(shouldShowSkipToBreak).toHaveBeenCalledWith("idle");
    expect(createStartTimerState).toHaveBeenCalledWith("idle", 25, 1500);
    expect(runPomodoroCompletion).toHaveBeenCalled();
    expect(createPomodoroTimerActionsResult).toHaveBeenCalledWith({
      completedToday: 2,
      handleTimerComplete: expect.any(Function),
      pauseTimer: expect.any(Function),
      resetTimer: expect.any(Function),
      showSkipToBreak: false,
      skipToBreak: expect.any(Function),
      startTimer: expect.any(Function),
    });
  });
});

const createParams = () => ({
  audio: { play: jest.fn() } as unknown as HTMLAudioElement,
  breakMinutes: 5,
  completedToday: 2,
  focusMinutes: 25,
  timerState: "idle" as const,
  timeLeft: 1500,
  setCompletedToday: jest.fn(),
  setIsRunning: jest.fn(),
  setTimeLeft: jest.fn(),
  setTimerState: jest.fn(),
});
