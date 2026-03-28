import { createRoutineMutationsResult } from "../routineMutationsResult";

describe("routineMutationsResult", () => {
  it("CRUD と completion の公開 shape を組み立てる", () => {
    const crudMutations = {
      addRoutine: jest.fn(),
      addRoutines: jest.fn(),
      updateRoutine: jest.fn(),
      updateRoutineGroup: jest.fn(),
      deleteRoutine: jest.fn(),
      deleteRoutineGroup: jest.fn(),
      replaceRoutinesForDays: jest.fn(),
    };
    const completionMutations = {
      toggleComplete: jest.fn(),
      reorderRoutines: jest.fn(),
    };

    expect(
      createRoutineMutationsResult(crudMutations, completionMutations),
    ).toEqual({
      ...crudMutations,
      ...completionMutations,
    });
  });
});
