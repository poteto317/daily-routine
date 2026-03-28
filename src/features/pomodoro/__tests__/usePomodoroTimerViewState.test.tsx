import { renderHook } from "@testing-library/react";

jest.mock("../usePomodoroTimerInitialState", () => ({
  usePomodoroTimerInitialState: jest.fn(),
}));

jest.mock("../usePomodoroTimerConfigState", () => ({
  usePomodoroTimerConfigState: jest.fn(),
}));

jest.mock("../usePomodoroTimerRuntimeState", () => ({
  usePomodoroTimerRuntimeState: jest.fn(),
}));

jest.mock("../pomodoroTimerViewStateResult", () => ({
  createPomodoroTimerViewStateResult: jest.fn(),
}));

import { usePomodoroTimerViewState } from "../usePomodoroTimerViewState";
import { createPomodoroTimerViewStateResult } from "../pomodoroTimerViewStateResult";
import { usePomodoroTimerConfigState } from "../usePomodoroTimerConfigState";
import { usePomodoroTimerInitialState } from "../usePomodoroTimerInitialState";
import { usePomodoroTimerRuntimeState } from "../usePomodoroTimerRuntimeState";

const mockUsePomodoroTimerInitialState =
  usePomodoroTimerInitialState as jest.MockedFunction<
    typeof usePomodoroTimerInitialState
  >;
const mockUsePomodoroTimerConfigState =
  usePomodoroTimerConfigState as jest.MockedFunction<
    typeof usePomodoroTimerConfigState
  >;
const mockUsePomodoroTimerRuntimeState =
  usePomodoroTimerRuntimeState as jest.MockedFunction<
    typeof usePomodoroTimerRuntimeState
  >;
const mockCreatePomodoroTimerViewStateResult =
  createPomodoroTimerViewStateResult as jest.MockedFunction<
    typeof createPomodoroTimerViewStateResult
  >;

describe("usePomodoroTimerViewState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePomodoroTimerInitialState.mockReturnValue({
      focusMinutes: 25,
      breakMinutes: 5,
      completedToday: 2,
      timerState: "idle",
      timeLeft: 1500,
      isRunning: false,
    });
    mockUsePomodoroTimerConfigState.mockReturnValue({
      breakMinutes: 5,
      focusMinutes: 25,
    });
    mockUsePomodoroTimerRuntimeState.mockReturnValue({
      completedToday: 2,
      isRunning: false,
      setCompletedToday: jest.fn(),
      setIsRunning: jest.fn(),
      setTimeLeft: jest.fn(),
      setTimerState: jest.fn(),
      timeLeft: 1500,
      timerState: "idle",
    });
    mockCreatePomodoroTimerViewStateResult.mockImplementation(
      ({ configState, runtimeState }) => ({
        ...configState,
        ...runtimeState,
      }),
    );
  });

  it("初期 state hook と config/runtime hook を compose し result builder へ委譲する", () => {
    const { result } = renderHook(() => usePomodoroTimerViewState());

    expect(mockUsePomodoroTimerInitialState).toHaveBeenCalled();
    expect(mockUsePomodoroTimerConfigState).toHaveBeenCalledWith({
      breakMinutes: 5,
      focusMinutes: 25,
    });
    expect(mockUsePomodoroTimerRuntimeState).toHaveBeenCalledWith({
      completedToday: 2,
      isRunning: false,
      timeLeft: 1500,
      timerState: "idle",
    });
    expect(mockCreatePomodoroTimerViewStateResult).toHaveBeenCalledWith({
      configState: (mockUsePomodoroTimerConfigState as jest.Mock).mock
        .results[0].value,
      runtimeState: (mockUsePomodoroTimerRuntimeState as jest.Mock).mock
        .results[0].value,
    });
    expect(result.current).toEqual({
      breakMinutes: 5,
      completedToday: 2,
      focusMinutes: 25,
      isRunning: false,
      setCompletedToday: (mockUsePomodoroTimerRuntimeState as jest.Mock).mock
        .results[0].value.setCompletedToday,
      setIsRunning: (mockUsePomodoroTimerRuntimeState as jest.Mock).mock
        .results[0].value.setIsRunning,
      setTimeLeft: (mockUsePomodoroTimerRuntimeState as jest.Mock).mock
        .results[0].value.setTimeLeft,
      setTimerState: (mockUsePomodoroTimerRuntimeState as jest.Mock).mock
        .results[0].value.setTimerState,
      timeLeft: 1500,
      timerState: "idle",
    });
  });
});
