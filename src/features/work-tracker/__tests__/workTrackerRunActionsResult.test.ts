import { createWorkTrackerRunActionsResult } from "../page/workTrackerRunActionsResult";

describe("createWorkTrackerRunActionsResult", () => {
  it("run action handlers を公開 shape に載せる", () => {
    const startTimer = jest.fn();
    const stopTimer = jest.fn();

    expect(
      createWorkTrackerRunActionsResult({
        startTimer,
        stopTimer,
      }),
    ).toEqual({
      startTimer,
      stopTimer,
    });
  });
});
