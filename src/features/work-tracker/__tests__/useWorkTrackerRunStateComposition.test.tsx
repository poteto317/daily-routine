import { renderHook } from "@testing-library/react";

jest.mock("../page/useWorkTrackerRunViewState", () => ({
  useWorkTrackerRunViewState: jest.fn(),
}));

jest.mock("../page/useWorkTrackerStartTimeState", () => ({
  useWorkTrackerStartTimeState: jest.fn(),
}));

jest.mock("../page/useWorkTrackerTimer", () => ({
  useWorkTrackerTimer: jest.fn(),
}));

jest.mock("../page/useWorkTrackerRunActions", () => ({
  useWorkTrackerRunActions: jest.fn(),
}));

jest.mock("../page/workTrackerRunStateResult", () => ({
  createWorkTrackerRunStateResult: jest.fn(),
}));

import { useWorkTrackerRunActions } from "../page/useWorkTrackerRunActions";
import { useWorkTrackerRunViewState } from "../page/useWorkTrackerRunViewState";
import { useWorkTrackerRunState } from "../page/useWorkTrackerRunState";
import { useWorkTrackerStartTimeState } from "../page/useWorkTrackerStartTimeState";
import { useWorkTrackerTimer } from "../page/useWorkTrackerTimer";
import { createWorkTrackerRunStateResult } from "../page/workTrackerRunStateResult";

describe("useWorkTrackerRunState composition", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useWorkTrackerRunViewState as jest.Mock).mockReturnValue({
      elapsedTime: 5,
      intervalRef: { current: null },
      isRunning: false,
      setElapsedTime: jest.fn(),
      setIsRunning: jest.fn(),
    });
    (useWorkTrackerStartTimeState as jest.Mock).mockReturnValue({
      clearStartTime: jest.fn(),
      getStartTime: jest.fn(),
      setStartTime: jest.fn(),
    });
    (useWorkTrackerRunActions as jest.Mock).mockReturnValue({
      startTimer: jest.fn(),
      stopTimer: jest.fn(),
    });
    (createWorkTrackerRunStateResult as jest.Mock).mockImplementation(
      (params) => params,
    );
  });

  it("view state・timer・actions・result builder を compose する", () => {
    const setShowInputForm = jest.fn();

    const { result } = renderHook(() =>
      useWorkTrackerRunState({
        initialIsRunning: false,
        initialElapsedTime: 5,
        setShowInputForm,
      }),
    );

    expect(useWorkTrackerRunViewState).toHaveBeenCalledWith({
      initialElapsedTime: 5,
      initialIsRunning: false,
    });
    expect(useWorkTrackerStartTimeState).toHaveBeenCalledTimes(1);
    expect(useWorkTrackerTimer).toHaveBeenCalledWith({
      isRunning: false,
      intervalRef: { current: null },
      setElapsedTime: expect.any(Function),
    });
    expect(useWorkTrackerRunActions).toHaveBeenCalledWith({
      setElapsedTime: expect.any(Function),
      setIsRunning: expect.any(Function),
      setShowInputForm,
      setStartTime: expect.any(Function),
    });
    expect(createWorkTrackerRunStateResult).toHaveBeenCalledWith({
      clearStartTime: expect.any(Function),
      elapsedTime: 5,
      getStartTime: expect.any(Function),
      isRunning: false,
      setElapsedTime: expect.any(Function),
      startTimer: expect.any(Function),
      stopTimer: expect.any(Function),
    });
    expect(result.current).toEqual({
      clearStartTime: expect.any(Function),
      elapsedTime: 5,
      getStartTime: expect.any(Function),
      isRunning: false,
      setElapsedTime: expect.any(Function),
      startTimer: expect.any(Function),
      stopTimer: expect.any(Function),
    });
  });
});
