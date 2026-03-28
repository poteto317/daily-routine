import { renderHook } from "@testing-library/react";

jest.mock("@/features/settings", () => ({
  getSettings: jest.fn(() => ({
    pomodoroFocusMinutes: 25,
    pomodoroBreakMinutes: 5,
  })),
}));

jest.mock("../storage", () => ({
  getTodayPomodoros: jest.fn(() => 2),
}));

jest.mock("../pomodoroViewStateActions", () => ({
  ...jest.requireActual("../pomodoroViewStateActions"),
  createInitialPomodoroViewState: jest.fn(() => ({
    focusMinutes: 25,
    breakMinutes: 5,
    timerState: "idle",
    timeLeft: 1500,
    isRunning: false,
    completedToday: 2,
  })),
}));

import { getSettings } from "@/features/settings";
import { getTodayPomodoros } from "../storage";
import { createInitialPomodoroViewState } from "../pomodoroViewStateActions";
import { usePomodoroTimerInitialState } from "../usePomodoroTimerInitialState";

describe("usePomodoroTimerInitialState", () => {
  it("settings と storage から初期 state を一度だけ組み立てる", () => {
    const { result, rerender } = renderHook(() =>
      usePomodoroTimerInitialState(),
    );

    expect(getSettings).toHaveBeenCalledTimes(1);
    expect(getTodayPomodoros).toHaveBeenCalledTimes(1);
    expect(createInitialPomodoroViewState).toHaveBeenCalledWith({
      focusMinutes: 25,
      breakMinutes: 5,
      completedToday: 2,
    });

    rerender();

    expect(getSettings).toHaveBeenCalledTimes(1);
    expect(getTodayPomodoros).toHaveBeenCalledTimes(1);
    expect(result.current).toEqual(
      (createInitialPomodoroViewState as jest.Mock).mock.results[0].value,
    );
  });
});
