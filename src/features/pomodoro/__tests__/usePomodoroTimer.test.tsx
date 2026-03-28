import { act, renderHook } from "@testing-library/react";

jest.mock("@/features/settings", () => ({
  getSettings: jest.fn(() => ({ pomodoroFocusMinutes: 25, pomodoroBreakMinutes: 5 })),
}));

jest.mock("../storage", () => ({
  getTodayPomodoros: jest.fn(() => 1),
  incrementTodayPomodoros: jest.fn(),
}));

jest.mock("../pomodoroTimerActions", () => ({
  applyPomodoroCompletion: jest.fn(),
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
  createStartTimerState: jest.fn((timerState: string, _focusMinutes: number, timeLeft: number) => ({
    nextIsRunning: true,
    nextTimerState: timerState === "idle" ? "focus" : timerState,
    nextTimeLeft: timerState === "idle" ? 1500 : timeLeft,
  })),
}));

jest.mock("../pomodoroTimerRuntime", () => ({
  createPomodoroAudio: jest.fn(() => ({ play: jest.fn() })),
  resolveTimerTick: jest.fn((timeLeft: number) => ({
    nextTimeLeft: timeLeft - 1,
    shouldComplete: false,
  })),
  shouldStartPomodoroInterval: jest.fn((isRunning: boolean, timeLeft: number) =>
    isRunning && timeLeft > 0,
  ),
}));

import {
  applyPomodoroCompletion,
  createResetTimerState,
  createSkipToBreakState,
  createStartTimerState,
} from "../pomodoroTimerActions";
import {
  createPomodoroAudio,
  resolveTimerTick,
  shouldStartPomodoroInterval,
} from "../pomodoroTimerRuntime";
import { usePomodoroTimer } from "../usePomodoroTimer";

describe("usePomodoroTimer", () => {
  const originalAudio = global.Audio;

  beforeEach(() => {
    jest.clearAllMocks();
    global.Audio = jest.fn(() => ({ play: jest.fn() })) as unknown as typeof Audio;
  });

  afterEach(() => {
    global.Audio = originalAudio;
  });

  it("初期値を返す", () => {
    const { result } = renderHook(() => usePomodoroTimer());

    expect(result.current.focusMinutes).toBe(25);
    expect(result.current.breakMinutes).toBe(5);
    expect(result.current.completedToday).toBe(1);
    expect(result.current.timerState).toBe("idle");
    expect(result.current.timeLeft).toBe(1500);
    expect(createPomodoroAudio).toHaveBeenCalled();
  });

  it("startTimer で action に基づいて開始する", () => {
    const { result } = renderHook(() => usePomodoroTimer());

    act(() => {
      result.current.startTimer();
    });

    expect(createStartTimerState).toHaveBeenCalledWith("idle", 25, 1500);
    expect(shouldStartPomodoroInterval).toHaveBeenCalledWith(false, 1500);
    expect(result.current.isRunning).toBe(true);
    expect(result.current.timerState).toBe("focus");
    expect(result.current.timeLeft).toBe(1500);
    expect(result.current.showSkipToBreak).toBe(true);
  });

  it("resetTimer と skipToBreak が action を使って状態更新する", () => {
    const { result } = renderHook(() => usePomodoroTimer());

    act(() => {
      result.current.skipToBreak();
    });
    expect(createSkipToBreakState).toHaveBeenCalledWith(5);
    expect(result.current.timerState).toBe("break");
    expect(result.current.timeLeft).toBe(300);

    act(() => {
      result.current.resetTimer();
    });
    expect(createResetTimerState).toHaveBeenCalledWith(25);
    expect(result.current.timerState).toBe("idle");
    expect(result.current.timeLeft).toBe(1500);
    expect(result.current.isRunning).toBe(false);
  });

  it("pauseTimer で停止する", () => {
    const { result } = renderHook(() => usePomodoroTimer());

    act(() => {
      result.current.startTimer();
    });

    expect(result.current.isRunning).toBe(true);

    act(() => {
      result.current.pauseTimer();
    });

    expect(result.current.isRunning).toBe(false);
  });

  it("実行中に unmount すると interval を片付ける", () => {
    jest.useFakeTimers();
    const clearIntervalSpy = jest.spyOn(global, "clearInterval");
    const { result, unmount } = renderHook(() => usePomodoroTimer());

    act(() => {
      result.current.startTimer();
    });

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();

    clearIntervalSpy.mockRestore();
    jest.useRealTimers();
  });

  it("カウント完了時に completion 処理を呼ぶ", () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => usePomodoroTimer());

    (resolveTimerTick as jest.Mock).mockReturnValueOnce({
      nextTimeLeft: 0,
      shouldComplete: true,
    });

    act(() => {
      result.current.startTimer();
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(resolveTimerTick).toHaveBeenCalledWith(1500);
    expect(applyPomodoroCompletion).toHaveBeenCalled();
    expect(result.current.timeLeft).toBe(0);

    jest.useRealTimers();
  });
});
