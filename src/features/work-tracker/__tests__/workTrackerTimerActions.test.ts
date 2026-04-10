import {
  createWorkTrackerStartTimerAction,
  createWorkTrackerStopTimerAction,
} from "../page/workTrackerTimerActions";

jest.mock("../page/stateActions", () => ({
  stopWorkTrackerTimer: jest.fn(),
}));

import { stopWorkTrackerTimer } from "../page/stateActions";

describe("workTrackerTimerActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date("2026-03-17T09:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("start action が開始時刻と実行状態を更新する", () => {
    const params = {
      setElapsedTime: jest.fn(),
      setIsRunning: jest.fn(),
      setStartTime: jest.fn(),
    };

    createWorkTrackerStartTimerAction(params)();

    expect(params.setStartTime).toHaveBeenCalledWith(expect.any(Date));
    expect(params.setElapsedTime).toHaveBeenCalledWith(0);
    expect(params.setIsRunning).toHaveBeenCalledWith(true);
  });

  it("stop action が timer 停止処理へ委譲する", () => {
    const params = {
      setIsRunning: jest.fn(),
      setShowInputForm: jest.fn(),
    };

    createWorkTrackerStopTimerAction(params)();

    expect(stopWorkTrackerTimer).toHaveBeenCalledWith(params);
  });
});
