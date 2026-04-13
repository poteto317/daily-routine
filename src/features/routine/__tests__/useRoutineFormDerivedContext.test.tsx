import { renderHook } from "@testing-library/react";

jest.mock("../components/routineFormModel", () => ({
  resolveRoutineFormInitialState: jest.fn(),
}));

import { resolveRoutineFormInitialState } from "../components/routineFormModel";
import { useRoutineFormDerivedContext } from "../components/useRoutineFormDerivedContext";

describe("useRoutineFormDerivedContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (resolveRoutineFormInitialState as jest.Mock).mockReturnValue({
      title: "朝活",
    });
  });

  it("initialState を既存 routines から導出する", () => {
    const routine = { id: "r1" } as never;
    const existingRoutines = [{ id: "r1" }, { id: "r2" }] as never;

    const { result } = renderHook(() =>
      useRoutineFormDerivedContext({
        currentDayOfWeek: 2,
        defaultDurationMinutes: 45,
        existingRoutines,
        routine,
      }),
    );

    expect(resolveRoutineFormInitialState).toHaveBeenCalledWith({
      routine,
      currentDayOfWeek: 2,
      existingRoutines,
      defaultDurationMinutes: 45,
    });
    expect(result.current).toEqual({
      initialState: {
        title: "朝活",
      },
    });
  });
});
