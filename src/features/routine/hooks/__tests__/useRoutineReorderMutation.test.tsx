import { act, renderHook } from "@testing-library/react";

jest.mock("@/features/routine/storage", () => ({
  saveRoutines: jest.fn(),
}));

jest.mock("../routineCompletionActions", () => ({
  reorderRoutineState: jest.fn(),
}));

import { saveRoutines } from "@/features/routine/storage";
import { reorderRoutineState } from "../routineCompletionActions";
import { useRoutineReorderMutation } from "../useRoutineReorderMutation";

describe("useRoutineReorderMutation", () => {
  it("並び替え後に state と storage を更新する", () => {
    const reordered = [{ id: "r2", sortOrder: 10 }];
    const updated = [{ id: "r2", sortOrder: 0 }];
    const setRoutines = jest.fn();

    (reorderRoutineState as jest.Mock).mockReturnValue(updated);

    const { result } = renderHook(() => useRoutineReorderMutation(setRoutines));

    act(() => {
      result.current(reordered as never);
    });

    expect(reorderRoutineState).toHaveBeenCalledWith(reordered);
    expect(setRoutines).toHaveBeenCalledWith(updated);
    expect(saveRoutines).toHaveBeenCalledWith(updated);
  });
});
