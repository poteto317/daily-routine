import { createWorkTrackerSessionActionsResult } from "../page/workTrackerSessionActionsResult";

describe("createWorkTrackerSessionActionsResult", () => {
  it("session action handlers を公開 shape に載せる", () => {
    const handleCancelSession = jest.fn();
    const handleDeleteSession = jest.fn();
    const handleSaveSession = jest.fn();
    const resetForm = jest.fn();

    expect(
      createWorkTrackerSessionActionsResult({
        handleCancelSession,
        handleDeleteSession,
        handleSaveSession,
        resetForm,
      }),
    ).toEqual({
      handleCancelSession,
      handleDeleteSession,
      handleSaveSession,
      resetForm,
    });
  });
});
