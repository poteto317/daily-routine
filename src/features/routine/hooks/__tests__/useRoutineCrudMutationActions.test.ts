import { renderHook } from "@testing-library/react";

jest.mock("../useRoutineCrudMutations", () => ({
  useRoutineCrudMutations: jest.fn(),
}));

import { useRoutineCrudMutations } from "../useRoutineCrudMutations";
import { useRoutineCrudMutationActions } from "../useRoutineCrudMutationActions";

describe("useRoutineCrudMutationActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("runner を組み立てて CRUD hook に委譲する", () => {
    const crudMutations = {
      addRoutine: jest.fn(),
      addRoutines: jest.fn(),
      updateRoutine: jest.fn(),
      deleteRoutine: jest.fn(),
      deleteRoutineGroup: jest.fn(),
      replaceRoutinesForDays: jest.fn(),
    };
    (useRoutineCrudMutations as jest.Mock).mockReturnValue(crudMutations);
    const setRoutines = jest.fn();
    const saveAndSync = jest.fn();
    const routinesRef = { current: [] };

    const { result } = renderHook(() =>
      useRoutineCrudMutationActions(setRoutines, saveAndSync, routinesRef),
    );

    expect(useRoutineCrudMutations).toHaveBeenCalledWith(expect.any(Function));
    expect(result.current).toBe(crudMutations);
  });

  it("CRUD hook に渡す runner が mutation を同期付きで実行し ref を更新する", () => {
    (useRoutineCrudMutations as jest.Mock).mockReturnValue({});
    const previous = [{ id: "1" }];
    const updated = [{ id: "2" }];
    const setRoutines = jest.fn();
    const saveAndSync = jest.fn();
    const routinesRef = {
      current: previous as unknown as import("@/types/routine").Routine[],
    };

    renderHook(() =>
      useRoutineCrudMutationActions(setRoutines, saveAndSync, routinesRef),
    );

    const runAndSync = (useRoutineCrudMutations as jest.Mock).mock
      .calls[0][0] as (
      mutate: (state: Array<{ id: string }>) => Array<{ id: string }>,
    ) => void;

    runAndSync(() => updated);

    // setRoutines は直接値で呼ばれる（関数型 updater ではない）
    expect(setRoutines).toHaveBeenCalledWith(updated);
    expect(saveAndSync).toHaveBeenCalledWith(updated);
    // routinesRef.current が即座に更新されること
    expect(routinesRef.current).toBe(updated);
  });
});
