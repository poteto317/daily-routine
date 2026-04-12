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
    const routinesRef = { current: [] };
    const resultShape = { composed: true };
    (createRoutineCompletionMutationsResult as jest.Mock).mockReturnValue(
      resultShape,
    );

    const { result } = renderHook(() =>
      useRoutineCompletionMutations(setRoutines, routinesRef),
    );

    expect(useRoutineCompletionToggleMutation).toHaveBeenCalledWith(
      setRoutines,
      routinesRef,
    );
    expect(useRoutineReorderMutation).toHaveBeenCalledWith(
      setRoutines,
      routinesRef,
    );
    expect(createRoutineCompletionMutationsResult).toHaveBeenCalledWith({
      toggleComplete: (useRoutineCompletionToggleMutation as jest.Mock).mock
        .results[0].value,
      reorderRoutines: (useRoutineReorderMutation as jest.Mock).mock.results[0]
        .value,
    });
    expect(result.current).toEqual(resultShape);
  });
});
