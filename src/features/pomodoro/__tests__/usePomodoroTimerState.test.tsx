import { renderHook } from "@testing-library/react";
import { usePomodoroTimerState } from "../usePomodoroTimerState";

jest.mock("../usePomodoroTimerViewState", () => ({
  usePomodoroTimerViewState: jest.fn(),
}));

jest.mock("../usePomodoroTimerActions", () => ({
  usePomodoroTimerActions: jest.fn(),
}));

jest.mock("../pomodoroTimerStateResult", () => ({
  createPomodoroTimerStateResult: jest.fn(),
}));

import { usePomodoroTimerActions } from "../usePomodoroTimerActions";
import { createPomodoroTimerStateResult } from "../pomodoroTimerStateResult";
import { usePomodoroTimerViewState } from "../usePomodoroTimerViewState";

const mockUsePomodoroTimerViewState =
  usePomodoroTimerViewState as jest.MockedFunction<
    typeof usePomodoroTimerViewState
  >;
const mockUsePomodoroTimerActions =
  usePomodoroTimerActions as jest.MockedFunction<
    typeof usePomodoroTimerActions
  >;
const mockCreatePomodoroTimerStateResult =
  createPomodoroTimerStateResult as jest.MockedFunction<
    typeof createPomodoroTimerStateResult
  >;

describe("usePomodoroTimerState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePomodoroTimerViewState.mockReturnValue({
      breakMinutes: 5,
      completedToday: 2,
      focusMinutes: 25,
      isRunning: false,
      setCompletedToday: jest.fn(),
      setIsRunning: jest.fn(),
      setTimeLeft: jest.fn(),
      setTimerState: jest.fn(),
      timeLeft: 1500,
      timerState: "idle",
    });
    mockUsePomodoroTimerActions.mockReturnValue({
      completedToday: 2,
      handleTimerComplete: jest.fn(),
      pauseTimer: jest.fn(),
      resetTimer: jest.fn(),
      showSkipToBreak: false,
      skipToBreak: jest.fn(),
      startTimer: jest.fn(),
    });
    mockCreatePomodoroTimerStateResult.mockImplementation(
      ({ actions, viewState }) => ({
        breakMinutes: viewState.breakMinutes,
        focusMinutes: viewState.focusMinutes,
        isRunning: viewState.isRunning,
        timerState: viewState.timerState,
        timeLeft: viewState.timeLeft,
        setTimeLeft: viewState.setTimeLeft,
        ...actions,
      }),
    );
  });

  it("view state hook と timer actions hook を compose し result builder へ委譲する", () => {
    const audio = { play: jest.fn() } as unknown as HTMLAudioElement;
    const { result } = renderHook(() => usePomodoroTimerState({ audio }));

    expect(mockUsePomodoroTimerViewState).toHaveBeenCalled();
    expect(mockUsePomodoroTimerActions).toHaveBeenCalledWith({
      audio,
      breakMinutes: 5,
      completedToday: 2,
      focusMinutes: 25,
      timerState: "idle",
      timeLeft: 1500,
      setCompletedToday: (mockUsePomodoroTimerViewState as jest.Mock).mock
        .results[0].value.setCompletedToday,
      setIsRunning: (mockUsePomodoroTimerViewState as jest.Mock).mock.results[0]
        .value.setIsRunning,
      setTimeLeft: (mockUsePomodoroTimerViewState as jest.Mock).mock.results[0]
        .value.setTimeLeft,
      setTimerState: (mockUsePomodoroTimerViewState as jest.Mock).mock
        .results[0].value.setTimerState,
    });
    expect(mockCreatePomodoroTimerStateResult).toHaveBeenCalledWith({
      actions: (mockUsePomodoroTimerActions as jest.Mock).mock.results[0].value,
      viewState: (mockUsePomodoroTimerViewState as jest.Mock).mock.results[0]
        .value,
    });
    expect(result.current).toEqual({
      breakMinutes: 5,
      focusMinutes: 25,
      isRunning: false,
      timerState: "idle",
      timeLeft: 1500,
      setTimeLeft: (mockUsePomodoroTimerViewState as jest.Mock).mock.results[0]
        .value.setTimeLeft,
      ...(mockUsePomodoroTimerActions as jest.Mock).mock.results[0].value,
    });
  });
});
