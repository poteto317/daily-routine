import { renderHook } from "@testing-library/react";
import { toDateKey } from "@/features/budget/utils/date";
import { getTodayString, toJstDay } from "@/lib/storage/core";
import { useJstDay, useJstTodayKey, useLocalTodayKey } from "../useToday";

describe("useToday", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("useJstTodayKey は getTodayString() と同じ値を返し、日をまたいだ後の再描画で新しい日付になる", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T23:59:00+09:00"));
    const { result, rerender } = renderHook(() => useJstTodayKey());

    expect(result.current).toBe("2026-03-07");
    expect(result.current).toBe(getTodayString());

    jest.setSystemTime(new Date("2026-03-08T00:01:00+09:00"));
    rerender();

    expect(result.current).toBe("2026-03-08");
    expect(result.current).toBe(getTodayString());
  });

  it("useJstDay は toJstDay(new Date()) と同じ値を返し、日をまたいだ後の再描画で新しい曜日になる", () => {
    // 2026-03-07 は土曜（6）、2026-03-08 は日曜（0）
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T23:59:00+09:00"));
    const { result, rerender } = renderHook(() => useJstDay());

    expect(result.current).toBe(6);
    expect(result.current).toBe(toJstDay(new Date()));

    jest.setSystemTime(new Date("2026-03-08T00:01:00+09:00"));
    rerender();

    expect(result.current).toBe(0);
    expect(result.current).toBe(toJstDay(new Date()));
  });

  it("useLocalTodayKey は家計簿の toDateKey(new Date()) と同じ値を返し、日をまたいだ後の再描画で新しい日付になる", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T23:59:00+09:00"));
    const { result, rerender } = renderHook(() => useLocalTodayKey());

    expect(result.current).toBe("2026-03-07");
    expect(result.current).toBe(toDateKey(new Date()));

    jest.setSystemTime(new Date("2026-03-08T00:01:00+09:00"));
    rerender();

    expect(result.current).toBe("2026-03-08");
    expect(result.current).toBe(toDateKey(new Date()));
  });

  it("useLocalTodayKey は 1 桁の月・日をゼロ埋めする", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-01-05T09:00:00+09:00"));
    const { result } = renderHook(() => useLocalTodayKey());

    expect(result.current).toBe("2026-01-05");
    expect(result.current).toBe(toDateKey(new Date()));
  });
});
