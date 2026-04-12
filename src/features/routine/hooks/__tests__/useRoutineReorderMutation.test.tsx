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
    const reordered = [{ id: "r2", sortOrder: 10, isCompleted: true }];
    const updated = [{ id: "r2", sortOrder: 0, isCompleted: true }];
    const setRoutines = jest.fn();
    const routinesRef = { current: [] as never[] };

    (reorderRoutineState as jest.Mock).mockReturnValue(updated);

    const { result } = renderHook(() =>
      useRoutineReorderMutation(setRoutines, routinesRef),
    );

    act(() => {
      result.current(reordered as never);
    });

    expect(reorderRoutineState).toHaveBeenCalledWith(reordered);
    expect(setRoutines).toHaveBeenCalledWith(updated);
    // isCompleted は一時状態なので saveRoutines には除去した配列が渡されること
    expect(saveRoutines).toHaveBeenCalledWith([{ id: "r2", sortOrder: 0, isCompleted: false }]);
    // routinesRef.current が即座に updated に更新されること
    expect(routinesRef.current).toBe(updated);
  });
});
