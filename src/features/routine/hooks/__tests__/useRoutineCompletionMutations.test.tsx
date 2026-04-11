import { renderHook } from "@testing-library/react";

jest.mock("../useRoutineCompletionToggleMutation", () => ({
  useRoutineCompletionToggleMutation: jest.fn(() => jest.fn()),
}));

jest.mock("../useRoutineReorderMutation", () => ({
  useRoutineReorderMutation: jest.fn(() => jest.fn()),
}));

jest.mock("../routineCompletionMutationsResult", () => ({
  createRoutineCompletionMutationsResult: jest.fn(),
}));

import { createRoutineCompletionMutationsResult } from "../routineCompletionMutationsResult";
import { useRoutineCompletionMutations } from "../useRoutineCompletionMutations";
import { useRoutineCompletionToggleMutation } from "../useRoutineCompletionToggleMutation";
import { useRoutineReorderMutation } from "../useRoutineReorderMutation";

describe("useRoutineCompletionMutations", () => {
  it("toggle と reorder mutation hook を compose する", () => {
    const setRoutines = jest.fn();
    const getRoutines = jest.fn();
    const resultShape = { composed: true };
    (createRoutineCompletionMutationsResult as jest.Mock).mockReturnValue(
      resultShape,
    );

    const { result } = renderHook(() =>
      useRoutineCompletionMutations(setRoutines, getRoutines),
    );

    expect(useRoutineCompletionToggleMutation).toHaveBeenCalledWith(
      setRoutines,
      getRoutines,
    );
    expect(useRoutineReorderMutation).toHaveBeenCalledWith(setRoutines);
    expect(createRoutineCompletionMutationsResult).toHaveBeenCalledWith({
      toggleComplete: (useRoutineCompletionToggleMutation as jest.Mock).mock
        .results[0].value,
      reorderRoutines: (useRoutineReorderMutation as jest.Mock).mock.results[0]
        .value,
    });
    expect(result.current).toEqual(resultShape);
  });
});
