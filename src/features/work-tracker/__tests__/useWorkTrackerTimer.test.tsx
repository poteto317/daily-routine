import { act, renderHook } from "@testing-library/react";
import { useState } from "react";
import { useWorkTrackerTimer } from "../page/useWorkTrackerTimer";

type Ref = { current: NodeJS.Timeout | null };

describe("useWorkTrackerTimer", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const setup = (isRunning: boolean, intervalRef: Ref = { current: null }) => {
    const setElapsedTime = jest.fn();
    const hook = renderHook(
      ({ running }) =>
        useWorkTrackerTimer({
          isRunning: running,
          intervalRef,
          setElapsedTime,
        }),
      { initialProps: { running: isRunning } },
    );
    return { ...hook, setElapsedTime, intervalRef };
  };

  it("停止中はタイマーを始めない", () => {
    const { setElapsedTime, intervalRef } = setup(false);

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(setElapsedTime).not.toHaveBeenCalled();
    expect(intervalRef.current).toBeNull();
    expect(jest.getTimerCount()).toBe(0);
  });

  it("実行中は 1 秒ごとに経過時間を 1 増やす更新を渡す", () => {
    const { setElapsedTime, intervalRef } = setup(true);

    expect(intervalRef.current).not.toBeNull();
    expect(setElapsedTime).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(999);
    });
    expect(setElapsedTime).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(setElapsedTime).toHaveBeenCalledTimes(1);
    const updater = setElapsedTime.mock.calls[0][0] as (prev: number) => number;
    expect(updater(7)).toBe(8);

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(setElapsedTime).toHaveBeenCalledTimes(4);
  });

  it("実行中から停止に切り替えるとタイマーを解除する", () => {
    const { rerender, setElapsedTime } = setup(true);

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(setElapsedTime).toHaveBeenCalledTimes(2);

    rerender({ running: false });

    expect(jest.getTimerCount()).toBe(0);
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(setElapsedTime).toHaveBeenCalledTimes(2);
  });

  it("停止から再開するとまた 1 秒ごとに進める", () => {
    const { rerender, setElapsedTime } = setup(false);

    rerender({ running: true });
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(setElapsedTime).toHaveBeenCalledTimes(2);
    expect(jest.getTimerCount()).toBe(1);
  });

  it("アンマウントでタイマーを解除する", () => {
    const { unmount, setElapsedTime } = setup(true);
    expect(jest.getTimerCount()).toBe(1);

    unmount();

    expect(jest.getTimerCount()).toBe(0);
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(setElapsedTime).not.toHaveBeenCalled();
  });

  it("停止中にアンマウントしても例外にならない", () => {
    const { unmount } = setup(false);

    expect(() => unmount()).not.toThrow();
  });

  it("実際の state と組み合わせると経過時間が秒数どおり増える", () => {
    const intervalRef: Ref = { current: null };
    const { result, rerender } = renderHook(
      ({ running }) => {
        const [elapsed, setElapsed] = useState(0);
        useWorkTrackerTimer({
          isRunning: running,
          intervalRef,
          setElapsedTime: setElapsed,
        });
        return elapsed;
      },
      { initialProps: { running: true } },
    );

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current).toBe(3);

    rerender({ running: false });
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current).toBe(3);
  });
});
