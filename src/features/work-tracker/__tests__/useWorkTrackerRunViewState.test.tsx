import { act, renderHook } from "@testing-library/react";
import { useWorkTrackerRunViewState } from "../page/useWorkTrackerRunViewState";

describe("useWorkTrackerRunViewState", () => {
  it("初期値と実行状態の更新を保持する", () => {
    const { result } = renderHook(() =>
      useWorkTrackerRunViewState({
        initialElapsedTime: 12,
        initialIsRunning: true,
      }),
    );

    expect(result.current.isRunning).toBe(true);
    expect(result.current.elapsedTime).toBe(12);
    expect(result.current.intervalRef.current).toBeNull();

    act(() => {
      result.current.setIsRunning(false);
      result.current.setElapsedTime(99);
    });

    expect(result.current.isRunning).toBe(false);
    expect(result.current.elapsedTime).toBe(99);
  });
});
