import { renderHook } from "@testing-library/react";

jest.mock("../useRoutineCrudMutationActions", () => ({
  useRoutineCrudMutationActions: jest.fn(() => ({
    addRoutine: jest.fn(),
    addRoutines: jest.fn(),
    updateRoutine: jest.fn(),
    deleteRoutine: jest.fn(),
    deleteRoutineGroup: jest.fn(),
    replaceRoutinesForDays: jest.fn(),
  })),
}));

jest.mock("../useRoutineCompletionMutations", () => ({
  useRoutineCompletionMutations: jest.fn(() => ({
    toggleComplete: jest.fn(),
    reorderRoutines: jest.fn(),
  })),
}));

jest.mock("../routineMutationsResult", () => ({
  createRoutineMutationsResult: jest.fn(),
}));

import { createRoutineMutationsResult } from "../routineMutationsResult";
import { useRoutineCompletionMutations } from "../useRoutineCompletionMutations";
import { useRoutineCrudMutationActions } from "../useRoutineCrudMutationActions";
import { useRoutineMutations } from "../useRoutineMutations";

describe("useRoutineMutations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("CRUD/completion/result builder を compose する", () => {
    const setRoutines = jest.fn();
    const saveAndSync = jest.fn();
    const routinesRef = { current: [] };
    const resultShape = { composed: true };
    (createRoutineMutationsResult as jest.Mock).mockReturnValue(resultShape);

    const { result } = renderHook(() =>
      useRoutineMutations(setRoutines, saveAndSync, routinesRef),
    );

    expect(useRoutineCrudMutationActions).toHaveBeenCalledWith(
      setRoutines,
      saveAndSync,
      routinesRef,
    );
    expect(useRoutineCompletionMutations).toHaveBeenCalledWith(
      setRoutines,
      routinesRef,
    );
    expect(createRoutineMutationsResult).toHaveBeenCalledWith(
      (useRoutineCrudMutationActions as jest.Mock).mock.results[0].value,
      (useRoutineCompletionMutations as jest.Mock).mock.results[0].value,
    );
    expect(result.current).toEqual(resultShape);
  });
});
