import { act, renderHook } from "@testing-library/react";
import { useWorkTrackerRunState } from "../page/useWorkTrackerRunState";

jest.mock("../page/useWorkTrackerTimer", () => ({
  useWorkTrackerTimer: jest.fn(),
}));

describe("useWorkTrackerRunState", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("初期状態と開始停止を管理する", () => {
    const setShowInputForm = jest.fn();
    const { result } = renderHook(() =>
      useWorkTrackerRunState({
        initialIsRunning: false,
        initialElapsedTime: 5,
        setShowInputForm,
      }),
    );

    expect(result.current.isRunning).toBe(false);
    expect(result.current.elapsedTime).toBe(5);
    expect(result.current.getStartTime()).toBeNull();

    act(() => {
      result.current.startTimer();
    });

    expect(result.current.isRunning).toBe(true);
    expect(result.current.elapsedTime).toBe(0);
    expect(result.current.getStartTime()).toEqual(expect.any(Date));

    act(() => {
      result.current.stopTimer();
    });

    expect(result.current.isRunning).toBe(false);
    expect(setShowInputForm).toHaveBeenCalledWith(true);
  });

  it("clearStartTime と setElapsedTime を外部から利用できる", () => {
    const { result } = renderHook(() =>
      useWorkTrackerRunState({
        initialIsRunning: false,
        initialElapsedTime: 0,
        setShowInputForm: jest.fn(),
      }),
    );

    act(() => {
      result.current.startTimer();
    });

    expect(result.current.getStartTime()).not.toBeNull();

    act(() => {
      result.current.setElapsedTime(42);
      result.current.clearStartTime();
    });

    expect(result.current.elapsedTime).toBe(42);
    expect(result.current.getStartTime()).toBeNull();
  });
});
