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

    const { result } = renderHook(() =>
      useRoutineCrudMutationActions(setRoutines, saveAndSync),
    );

    expect(useRoutineCrudMutations).toHaveBeenCalledWith(expect.any(Function));
    expect(result.current).toBe(crudMutations);
  });

  it("CRUD hook に渡す runner が mutation を同期付きで実行する", () => {
    (useRoutineCrudMutations as jest.Mock).mockReturnValue({});
    const setRoutines = jest.fn();
    const saveAndSync = jest.fn();

    renderHook(() => useRoutineCrudMutationActions(setRoutines, saveAndSync));

    const runAndSync = (useRoutineCrudMutations as jest.Mock).mock
      .calls[0][0] as (
      mutate: (previous: Array<{ id: string }>) => Array<{ id: string }>,
    ) => void;
    const previous = [{ id: "1" }];
    const updated = [{ id: "2" }];

    runAndSync(() => updated);

    const updater = setRoutines.mock.calls[0][0] as (
      state: Array<{ id: string }>,
    ) => Array<{ id: string }>;
    expect(updater(previous)).toBe(updated);
    expect(saveAndSync).toHaveBeenCalledWith(updated);
  });
});
