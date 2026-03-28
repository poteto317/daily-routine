import { createWorkTrackerRunStateResult } from "../page/workTrackerRunStateResult";

describe("workTrackerRunStateResult", () => {
  it("run state の公開 shape を組み立てる", () => {
    const clearStartTime = jest.fn();
    const getStartTime = jest.fn(() => new Date("2026-03-07T12:00:00.000Z"));
    const setElapsedTime = jest.fn();
    const startTimer = jest.fn();
    const stopTimer = jest.fn();

    expect(
      createWorkTrackerRunStateResult({
        clearStartTime,
        elapsedTime: 42,
        getStartTime,
        isRunning: true,
        setElapsedTime,
        startTimer,
        stopTimer,
      }),
    ).toEqual({
      clearStartTime,
      elapsedTime: 42,
      getStartTime,
      isRunning: true,
      setElapsedTime,
      startTimer,
      stopTimer,
    });
  });
});
