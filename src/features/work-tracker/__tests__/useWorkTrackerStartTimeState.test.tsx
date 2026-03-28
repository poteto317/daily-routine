import { act, renderHook } from "@testing-library/react";
import { useWorkTrackerStartTimeState } from "../page/useWorkTrackerStartTimeState";

describe("useWorkTrackerStartTimeState", () => {
  it("開始時刻の設定・取得・クリアを管理する", () => {
    const { result } = renderHook(() => useWorkTrackerStartTimeState());
    const now = new Date("2026-03-15T09:00:00.000Z");

    expect(result.current.getStartTime()).toBeNull();

    act(() => {
      result.current.setStartTime(now);
    });

    expect(result.current.getStartTime()).toBe(now);

    act(() => {
      result.current.clearStartTime();
    });

    expect(result.current.getStartTime()).toBeNull();
  });
});
