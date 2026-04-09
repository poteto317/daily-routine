import { act, renderHook } from "@testing-library/react";
import { useRoutineFallbackTimer } from "../useRoutineFallbackTimer";

describe("useRoutineFallbackTimer", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "visible",
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("start を呼ぶと visible 時に onTick が intervalMs ごとに呼ばれる", () => {
    const onTick = jest.fn();
    const { result } = renderHook(() => useRoutineFallbackTimer(1000));

    act(() => result.current.start(onTick));
    act(() => jest.advanceTimersByTime(3000));

    expect(onTick).toHaveBeenCalledTimes(3);
  });

  it("stop を呼ぶと onTick は呼ばれなくなる", () => {
    const onTick = jest.fn();
    const { result } = renderHook(() => useRoutineFallbackTimer(1000));

    act(() => result.current.start(onTick));
    act(() => jest.advanceTimersByTime(1000));
    act(() => result.current.stop());
    act(() => jest.advanceTimersByTime(3000));

    expect(onTick).toHaveBeenCalledTimes(1);
  });

  it("intervalMs が 0 のとき start を呼んでもタイマーは開始しない", () => {
    const onTick = jest.fn();
    const { result } = renderHook(() => useRoutineFallbackTimer(0));

    act(() => result.current.start(onTick));
    act(() => jest.advanceTimersByTime(99999));

    expect(onTick).not.toHaveBeenCalled();
  });

  it("document が hidden のとき start を呼んでもタイマーは開始しない", () => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "hidden",
    });
    const onTick = jest.fn();
    const { result } = renderHook(() => useRoutineFallbackTimer(1000));

    act(() => result.current.start(onTick));
    act(() => jest.advanceTimersByTime(3000));

    expect(onTick).not.toHaveBeenCalled();
  });

  it("アンマウント時に実行中のタイマーが自動停止する", () => {
    const onTick = jest.fn();
    const { result, unmount } = renderHook(() => useRoutineFallbackTimer(1000));

    act(() => result.current.start(onTick));
    unmount();
    act(() => jest.advanceTimersByTime(3000));

    expect(onTick).not.toHaveBeenCalled();
  });

  it("start を再度呼ぶと既存タイマーをリセットして新しいタイマーを開始する", () => {
    const onTick = jest.fn();
    const { result } = renderHook(() => useRoutineFallbackTimer(1000));

    act(() => result.current.start(onTick));
    act(() => jest.advanceTimersByTime(500)); // 0.5 秒経過（まだ発火なし）
    act(() => result.current.start(onTick)); // リセット
    act(() => jest.advanceTimersByTime(1000)); // 1 秒経過 → 1 回発火

    expect(onTick).toHaveBeenCalledTimes(1);
  });

  it("start は stop 済みのタイマーを安全に再起動できる", () => {
    const onTick = jest.fn();
    const { result } = renderHook(() => useRoutineFallbackTimer(1000));

    act(() => result.current.start(onTick));
    act(() => result.current.stop());
    act(() => result.current.start(onTick));
    act(() => jest.advanceTimersByTime(1000));

    expect(onTick).toHaveBeenCalledTimes(1);
  });

  it("stop を複数回呼んでもエラーにならない", () => {
    const { result } = renderHook(() => useRoutineFallbackTimer(1000));

    act(() => {
      result.current.stop();
      result.current.stop();
      result.current.stop();
    });
    // エラーが発生しないことを確認
  });

  it("intervalMs が変わると start/stop 参照が更新される", () => {
    const { result, rerender } = renderHook(
      ({ ms }: { ms: number }) => useRoutineFallbackTimer(ms),
      { initialProps: { ms: 1000 } },
    );

    const firstStart = result.current.start;
    rerender({ ms: 2000 });

    expect(result.current.start).not.toBe(firstStart);
  });
});
