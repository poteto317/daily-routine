import { createRoutineCompletionMutationsResult } from "../routineCompletionMutationsResult";

describe("routineCompletionMutationsResult", () => {
  it("completion mutation hook の公開 shape を組み立てる", () => {
    const toggleComplete = jest.fn();
    const reorderRoutines = jest.fn();

    expect(
      createRoutineCompletionMutationsResult({
        toggleComplete,
        reorderRoutines,
      }),
    ).toEqual({
      toggleComplete,
      reorderRoutines,
    });
  });
});
