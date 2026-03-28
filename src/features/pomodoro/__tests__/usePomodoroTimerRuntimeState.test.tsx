import { act, renderHook } from "@testing-library/react";
import { usePomodoroTimerRuntimeState } from "../usePomodoroTimerRuntimeState";

describe("usePomodoroTimerRuntimeState", () => {
  it("実行時 state と setter を保持する", () => {
    const { result } = renderHook(() =>
      usePomodoroTimerRuntimeState({
        completedToday: 2,
        isRunning: false,
        timeLeft: 1500,
        timerState: "idle",
      }),
    );

    expect(result.current.completedToday).toBe(2);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.timeLeft).toBe(1500);
    expect(result.current.timerState).toBe("idle");

    act(() => {
      result.current.setCompletedToday(3);
      result.current.setIsRunning(true);
      result.current.setTimeLeft(1200);
      result.current.setTimerState("focus");
    });

    expect(result.current.completedToday).toBe(3);
    expect(result.current.isRunning).toBe(true);
    expect(result.current.timeLeft).toBe(1200);
    expect(result.current.timerState).toBe("focus");
  });
});
