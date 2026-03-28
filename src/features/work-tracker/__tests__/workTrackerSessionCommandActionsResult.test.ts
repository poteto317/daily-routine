import { createWorkTrackerSessionCommandActionsResult } from "../page/workTrackerSessionCommandActionsResult";

describe("createWorkTrackerSessionCommandActionsResult", () => {
  it("session command handlers を公開 shape に載せる", () => {
    const handleSaveSession = jest.fn();
    const handleCancelSession = jest.fn();
    const handleDeleteSession = jest.fn();

    expect(
      createWorkTrackerSessionCommandActionsResult({
        handleSaveSession,
        handleCancelSession,
        handleDeleteSession,
      }),
    ).toEqual({
      handleSaveSession,
      handleCancelSession,
      handleDeleteSession,
    });
  });
});
