import { act, renderHook } from "@testing-library/react";
import { useWorkTrackerRunActions } from "../page/useWorkTrackerRunActions";

jest.mock("../page/workTrackerHookActions", () => ({
  createWorkTrackerStartTimerHandler: jest.fn(),
  createWorkTrackerStopTimerHandler: jest.fn(),
}));

jest.mock("../page/workTrackerRunActionsResult", () => ({
  createWorkTrackerRunActionsResult: jest.fn(),
}));

import {
  createWorkTrackerStartTimerHandler,
  createWorkTrackerStopTimerHandler,
} from "../page/workTrackerHookActions";
import { createWorkTrackerRunActionsResult } from "../page/workTrackerRunActionsResult";

describe("useWorkTrackerRunActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("start/stop handler を委譲する", () => {
    const startAction = jest.fn();
    const stopAction = jest.fn();
    const resultShape = {
      startTimer: jest.fn(),
      stopTimer: jest.fn(),
      composed: true,
    };
    (createWorkTrackerStartTimerHandler as jest.Mock).mockReturnValue(
      startAction,
    );
    (createWorkTrackerStopTimerHandler as jest.Mock).mockReturnValue(
      stopAction,
    );
    (createWorkTrackerRunActionsResult as jest.Mock).mockReturnValue(
      resultShape,
    );

    const params = {
      setElapsedTime: jest.fn(),
      setIsRunning: jest.fn(),
      setShowInputForm: jest.fn(),
      setStartTime: jest.fn(),
    };
    const { result } = renderHook(() => useWorkTrackerRunActions(params));

    expect(result.current).toBe(resultShape);
    expect(createWorkTrackerRunActionsResult).toHaveBeenCalledWith({
      startTimer: expect.any(Function),
      stopTimer: expect.any(Function),
    });

    const builtActions = (createWorkTrackerRunActionsResult as jest.Mock).mock
      .calls[0][0] as {
      startTimer: () => void;
      stopTimer: () => void;
    };

    act(() => {
      builtActions.startTimer();
      builtActions.stopTimer();
    });

    expect(createWorkTrackerStartTimerHandler).toHaveBeenCalledWith({
      setElapsedTime: params.setElapsedTime,
      setIsRunning: params.setIsRunning,
      setStartTime: params.setStartTime,
    });
    expect(createWorkTrackerStopTimerHandler).toHaveBeenCalledWith({
      setIsRunning: params.setIsRunning,
      setShowInputForm: params.setShowInputForm,
    });
    expect(startAction).toHaveBeenCalled();
    expect(stopAction).toHaveBeenCalled();
  });
});
