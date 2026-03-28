import { createTestMatrixDataActionsResult } from "../testMatrixDataActionsResult";

describe("testMatrixDataActionsResult", () => {
  it("data actions の公開 shape を組み立てる", () => {
    const resetAll = jest.fn(() => true);
    const toggleDetailStatus = jest.fn();
    const toggleStatus = jest.fn();
    const updateDetailNote = jest.fn();
    const updateNote = jest.fn();

    expect(
      createTestMatrixDataActionsResult({
        resetAll,
        toggleDetailStatus,
        toggleStatus,
        updateDetailNote,
        updateNote,
      }),
    ).toEqual({
      resetAll,
      toggleDetailStatus,
      toggleStatus,
      updateDetailNote,
      updateNote,
    });
  });
});
