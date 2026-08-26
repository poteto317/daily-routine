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

jest.mock("../useRoutineCompletionToggleMutation", () => ({
  useRoutineCompletionToggleMutation: jest.fn(() => jest.fn()),
}));

jest.mock("../useRoutineReorderMutation", () => ({
  useRoutineReorderMutation: jest.fn(() => jest.fn()),
}));

jest.mock("../routineMutationsResult", () => ({
  createRoutineMutationsResult: jest.fn(),
}));

import { createRoutineMutationsResult } from "../routineMutationsResult";
import { useRoutineCompletionToggleMutation } from "../useRoutineCompletionToggleMutation";
import { useRoutineCrudMutationActions } from "../useRoutineCrudMutationActions";
import { useRoutineMutations } from "../useRoutineMutations";
import { useRoutineReorderMutation } from "../useRoutineReorderMutation";

describe("useRoutineMutations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("CRUD・完了切替・並び替えを公開 mutation contract に compose する", () => {
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
    expect(useRoutineCompletionToggleMutation).toHaveBeenCalledWith(
      setRoutines,
      routinesRef,
    );
    expect(useRoutineReorderMutation).toHaveBeenCalledWith(
      setRoutines,
      routinesRef,
    );
    expect(createRoutineMutationsResult).toHaveBeenCalledWith({
      crudMutations: (useRoutineCrudMutationActions as jest.Mock).mock
        .results[0].value,
      toggleComplete: (useRoutineCompletionToggleMutation as jest.Mock).mock
        .results[0].value,
      reorderRoutines: (useRoutineReorderMutation as jest.Mock).mock.results[0]
        .value,
    });
    expect(result.current).toEqual(resultShape);
  });
});
