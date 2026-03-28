import { act, renderHook } from "@testing-library/react";

jest.mock("../pomodoroTimerRuntime", () => ({
  createPomodoroAudio: jest.fn(),
  resolveTimerTick: jest.fn((timeLeft: number) => ({
    nextTimeLeft: timeLeft - 1,
    shouldComplete: false,
  })),
  shouldStartPomodoroInterval: jest.fn(
    (isRunning: boolean, timeLeft: number) => isRunning && timeLeft > 0,
  ),
}));

import {
  resolveTimerTick,
  shouldStartPomodoroInterval,
} from "../pomodoroTimerRuntime";
import { usePomodoroTimerInterval } from "../usePomodoroTimerInterval";

describe("usePomodoroTimerInterval", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("実行条件を満たすと tick 用 updater を登録する", () => {
    const setTimeLeft = jest.fn();
    const handleTimerComplete = jest.fn();

    renderHook(() =>
      usePomodoroTimerInterval({
        isRunning: true,
        timeLeft: 10,
        setTimeLeft,
        handleTimerComplete,
      }),
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(shouldStartPomodoroInterval).toHaveBeenCalledWith(true, 10);
    expect(setTimeLeft).toHaveBeenCalledWith(expect.any(Function));
    const updateTimeLeft = setTimeLeft.mock.calls[0][0] as (
      value: number,
    ) => number;
    expect(updateTimeLeft(10)).toBe(9);
    expect(resolveTimerTick).toHaveBeenCalledWith(10);
    expect(handleTimerComplete).not.toHaveBeenCalled();
  });

  it("完了 tick のとき completion handler を非同期で呼ぶ", () => {
    const setTimeLeft = jest.fn();
    const handleTimerComplete = jest.fn();

    (resolveTimerTick as jest.Mock).mockReturnValueOnce({
      nextTimeLeft: 0,
      shouldComplete: true,
    });

    renderHook(() =>
      usePomodoroTimerInterval({
        isRunning: true,
        timeLeft: 1,
        setTimeLeft,
        handleTimerComplete,
      }),
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const updateTimeLeft = setTimeLeft.mock.calls[0][0] as (
      value: number,
    ) => number;
    expect(updateTimeLeft(1)).toBe(0);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(handleTimerComplete).toHaveBeenCalledTimes(1);
  });
});
