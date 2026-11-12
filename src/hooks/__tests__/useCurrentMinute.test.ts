import { act, renderHook } from "@testing-library/react";
import {
  getCurrentMinute,
  notifyCurrentMinute,
  useCurrentMinute,
} from "../useCurrentMinute";

describe("useCurrentMinute", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-11-12T08:59:30+09:00"));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it("getCurrentMinute はいまの分の開始時刻（秒とミリ秒を切り捨てた値）を返す", () => {
    expect(getCurrentMinute()).toBe(Date.parse("2026-11-12T08:59:00+09:00"));
  });

  it("同じ分のあいだは、時刻が進んでも同じ値を返す", () => {
    const first = getCurrentMinute();
    jest.setSystemTime(new Date("2026-11-12T08:59:59.999+09:00"));
    expect(getCurrentMinute()).toBe(first);
  });

  it("最初の描画で、いまの分を返す", () => {
    const { result } = renderHook(() => useCurrentMinute());
    expect(result.current).toBe(Date.parse("2026-11-12T08:59:00+09:00"));
  });

  it("時計とタイマーが進んでも、通知が無ければ値は変わらない（毎分のタイマーを持たない）", () => {
    const { result } = renderHook(() => useCurrentMinute());
    // setSystemTime はタイマーを発火させないので、時計とタイマーの両方を進める
    act(() => {
      jest.advanceTimersByTime(2 * 60_000);
    });
    expect(getCurrentMinute()).toBe(Date.parse("2026-11-12T09:01:00+09:00"));
    expect(result.current).toBe(Date.parse("2026-11-12T08:59:00+09:00"));
  });

  it("分が変わった後に notifyCurrentMinute を呼ぶと、新しい分に更新される", () => {
    const { result } = renderHook(() => useCurrentMinute());
    jest.setSystemTime(new Date("2026-11-12T09:01:00+09:00"));
    act(() => {
      notifyCurrentMinute();
    });
    expect(result.current).toBe(Date.parse("2026-11-12T09:01:00+09:00"));
  });

  it("同じ分のうちに notifyCurrentMinute を呼んでも、再描画しない", () => {
    let renderCount = 0;
    renderHook(() => {
      renderCount += 1;
      return useCurrentMinute();
    });
    const countAfterMount = renderCount;
    jest.setSystemTime(new Date("2026-11-12T08:59:45+09:00"));
    act(() => {
      notifyCurrentMinute();
    });
    expect(renderCount).toBe(countAfterMount);
  });

  it("アンマウント後は購読を解除し、notifyCurrentMinute を呼んでも時刻を読みに来ない", () => {
    const { unmount } = renderHook(() => useCurrentMinute());
    const dateNowSpy = jest.spyOn(Date, "now");

    // 対照: マウント中は、通知で購読者が時刻を読みに来る
    act(() => {
      notifyCurrentMinute();
    });
    expect(dateNowSpy).toHaveBeenCalled();

    unmount();
    dateNowSpy.mockClear();
    notifyCurrentMinute();
    expect(dateNowSpy).not.toHaveBeenCalled();
  });
});
