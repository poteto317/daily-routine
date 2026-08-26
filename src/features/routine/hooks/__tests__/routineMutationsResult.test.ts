import { createRoutineMutationsResult } from "../routineMutationsResult";

describe("routineMutationsResult", () => {
  it("CRUD・完了切替・並び替えの公開 shape を組み立てる", () => {
    const crudMutations = {
      addRoutine: jest.fn(),
      addRoutines: jest.fn(),
      updateRoutine: jest.fn(),
      deleteRoutine: jest.fn(),
      deleteRoutineGroup: jest.fn(),
      replaceRoutinesForDays: jest.fn(),
    };
    const toggleComplete = jest.fn();
    const reorderRoutines = jest.fn();

    expect(
      createRoutineMutationsResult({
        crudMutations,
        toggleComplete,
        reorderRoutines,
      }),
    ).toEqual({
      ...crudMutations,
      toggleComplete,
      reorderRoutines,
    });
  });
});
